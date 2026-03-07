-- =============================================
-- Learning Analysis App - Supabase Schema
-- =============================================

-- 1. users (親・子ども・ロール)
-- Supabase Auth の auth.users と連携。プロフィール情報を保持。
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_access" ON public.users
  FOR ALL USING (auth.uid() = id);

-- 2. children (子どもプロファイル)
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 子どもアカウントと紐付け（任意）
  name TEXT NOT NULL,
  grade TEXT NOT NULL, -- 例: "小4", "中2"
  birth_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_parent_access" ON public.children
  FOR ALL USING (
    auth.uid() = parent_id
    OR auth.uid() = user_id
  );

-- 3. assessments (診断セッション)
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('free', 'basic')), -- 無料 / ベーシック
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'error')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'free')),
  answers_json JSONB, -- スコア済みJSONをそのまま格納
  result_json JSONB,  -- LLM出力を格納
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_parent_access" ON public.assessments
  FOR ALL USING (auth.uid() = parent_id);

-- 4. answers (個別回答行)
-- answers_json でまとめて持つが、個別クエリ用に行単位でも保持
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL, -- "Q1", "Q2", ...
  answer_value JSONB NOT NULL, -- 数値 or 文字列 or 配列
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_via_assessment" ON public.answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_id AND a.parent_id = auth.uid()
    )
  );

-- 5. plans (30日プラン)
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT '30day' CHECK (type IN ('30day', 'monthly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  plan_json JSONB, -- LLM生成の週別メニュー
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_parent_access" ON public.plans
  FOR ALL USING (auth.uid() = parent_id);

-- 6. daily_logs (子どもの日次ログ)
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  answers_json JSONB NOT NULL, -- 子どもUI 10問の回答
  mood TEXT, -- 'good' | 'normal' | 'tired'
  summary TEXT, -- 自動生成サマリー（任意）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, log_date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- 親・子ども両方からアクセス可
CREATE POLICY "daily_logs_access" ON public.daily_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND (c.parent_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- 7. subscriptions (Stripe連携情報)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('basic_assessment', 'plan_30day', 'monthly')),
  -- basic_assessment: 1480円 / plan_30day: 2450円 / monthly: 2980円
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'past_due', 'incomplete')),
  amount INTEGER, -- 円
  currency TEXT DEFAULT 'jpy',
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_user_access" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Helper: updated_at 自動更新トリガー
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER children_updated_at BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Auth トリガー: 新規ユーザー登録時に users 行を作成
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_children_parent_id ON public.children(parent_id);
CREATE INDEX idx_assessments_child_id ON public.assessments(child_id);
CREATE INDEX idx_assessments_parent_id ON public.assessments(parent_id);
CREATE INDEX idx_daily_logs_child_date ON public.daily_logs(child_id, log_date);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_plans_child_id ON public.plans(child_id);
CREATE INDEX idx_plans_parent_id ON public.plans(parent_id);
CREATE INDEX idx_plans_assessment_id ON public.plans(assessment_id);
