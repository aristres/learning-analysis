-- お問い合わせテーブル
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  email       text        NOT NULL,
  category    text        NOT NULL,
  message     text        NOT NULL,
  status      text        NOT NULL DEFAULT 'new',  -- 'new' | 'replied' | 'closed'
  created_at  timestamptz DEFAULT now()
);

-- RLS: 全ユーザー（未ログイン含む）が INSERT のみ可能
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiry"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

-- 管理者（service role）は SELECT・UPDATE・DELETE が可能
-- service role はデフォルトで RLS をバイパスするので追加ポリシー不要
