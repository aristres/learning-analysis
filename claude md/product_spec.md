# KIDDO Insight — プロダクト仕様書

**バージョン：** v1.0  
**対象読者：** エンジニア・PM・デザイナー

---

## 1. プロダクト概要

KIDDO Insight は、保護者が回答する質問データをAIが分析し、子どもの学習特性レポートと個別最適化された30日学習プランを提供するWebサービスである。

**コアバリュー：**
- 3分で完了（無料診断）
- 登録不要ですぐ結果が見られる（無料診断）
- 「明日から使える」具体的な手立て
- 医療診断ではなく教育的アセスメント

---

## 2. 機能一覧

### 2.1 無料診断

| 項目 | 仕様 |
|---|---|
| 問数 | 8問 |
| 認証 | 不要 |
| 所要時間 | 約3分 |
| 出力 | summary + strengths（3つ）+ home_strategies（3つ） |
| AIモデル | gpt-4o-mini |
| 保存 | ゲストは保存なし / ログイン済みはDBに保存 |
| 導線 | LP → `/parent/assessment/free` → 結果 → ベーシック診断CTA |

### 2.2 ベーシック診断

| 項目 | 仕様 |
|---|---|
| 価格 | ¥1,480（買切） |
| 問数 | 20問 |
| 認証 | 必要（Supabase Auth） |
| 決済 | Stripe Checkout Session |
| 出力 | 詳細レポート（8ドメイン）+ 30日プラン自動生成 |
| AIモデル | gpt-4o-mini |
| エラー時 | LLM障害時はHTTP 503を返す |

**詳細レポートの構成：**

```typescript
interface AssessmentResult {
  summary: string           // 1段落のキャラクター紹介
  strengths: string[]       // 認知特性ベースの強み × 3
  weaknesses: string[]      // つまずきやすい傾向 × 3
  risk_situations: string[] // 困りやすい場面 × 3
  home_strategies: string[] // 家庭でできる手立て × 3
  study_style: {
    type: string            // visual / auditory / kinesthetic 等
    description: string     // そのスタイルが合う理由
  }
}
```

### 2.3 30日プラン

| 項目 | 仕様 |
|---|---|
| 生成方法 | ルールベース（LLM不使用）`src/lib/plan-generator.ts` |
| 手立て数 | 合計6個（継続 + 新規） |
| 週構成 | 4週 × テーマ別デイリータスク |
| 難易度 | 月数に応じて段階的に上昇（1ヶ月目=difficulty 1のみ） |
| 調整ルール | 5つの自動調整ルール（日次ログデータに基づく） |

**プラン構造（`PlanJson`）：**

```typescript
interface PlanJson {
  overview: string
  month: number
  child_profile: {
    learning_style: LearningStyle       // visual | auditory | kinesthetic
    low_domains: DomainKey[]            // 重点サポート領域
    improving_domains: DomainKey[]      // 改善中の領域
  }
  continued_strategies: StrategySelection[]  // 前月の効果的な手立て
  new_strategies: StrategySelection[]        // 今月の新規手立て
  retired_strategies: RetiredStrategy[]      // 卒業した手立て
  weeks: WeekPlan[]                          // 4週分のタスク
  adjustment_rules: AdjustmentRule[]         // 5つの自動調整ルール
}
```

### 2.4 マンスリープラン（サブスクリプション）

| 項目 | 仕様 |
|---|---|
| 価格 | ¥2,980/月（Stripe recurring） |
| 更新 | 毎月、前月の日次ログを反映して新プランを生成 |
| 追加機能 | 成長レポート・日次ログ記録 |

### 2.5 日次ログ

| 設問 | 内容 |
|---|---|
| Q1 | 今日やった科目 |
| Q2 | やりやすさ（1〜3） |
| Q3 | 気分（1〜3） |
| Q4〜Q10 | 手立ての実行度・集中度・宿題完了度など |

---

## 3. データモデル（Supabase）

```
users          -- 保護者アカウント（auth.users とトリガーで連動）
children       -- 子ども情報（ニックネーム・学年・birth_year）
assessments    -- 診断セッション
  type: 'free' | 'basic'
  status: 'in_progress' | 'completed' | 'error'
  payment_status: 'free' | 'unpaid' | 'paid'
  answers_json: AnswersJson
  result_json: AssessmentResult
plans          -- 30日プラン
  type: '30day'
  status: 'active' | 'completed' | 'cancelled'
  plan_json: PlanJson
  start_date / end_date
daily_logs     -- 日次チェックイン記録
subscriptions  -- Stripe サブスクリプション管理
```

全テーブルにRLS設定済み。`auth.uid()` が `parent_id` と一致する行のみアクセス可能。

---

## 4. APIエンドポイント

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| POST | `/api/assessment/free` | 不要 | 無料診断の回答受付・LLMレポート生成 |
| POST | `/api/assessment/basic` | 必要 | ベーシック診断の回答受付・レポート生成・プラン自動生成 |
| GET | `/api/assessment/basic?id=` | 必要 | 診断結果の取得 |
| POST | `/api/plan` | 必要 | プランの新規生成 |
| GET | `/api/plan?id=` | 必要 | プランの取得 |
| POST | `/api/daily-log` | 必要 | 日次ログの記録 |
| POST | `/api/checkout` | 必要 | Stripe Checkout Session 作成 |
| POST | `/api/stripe/webhook` | Stripe署名検証 | Stripe Webhook処理 |

---

## 5. 認証・決済フロー

### 決済フロー（ベーシック診断）

```
/parent/payment/plan?type=basic_assessment
  → 子ども選択
    → Stripe Checkout Session 作成（/api/checkout）
      → stripe.com（決済画面）
        → webhook（checkout.session.completed）
          → assessments.payment_status = 'paid'
            → /parent/assessment/basic?assessmentId=xxx
```

---

## 6. LLMプロンプト設計（`src/lib/llm.ts`）

**設計原則：**
1. system: 「子どもの学習特性に詳しい専門家。必ずJSONで回答。」
2. user: 診断回答データ + 出力フォーマット指定
3. 禁止事項をプロンプト内に明記（医療診断用語・一般論・否定表現）
4. `response_format: json_object` で構造化出力を保証

**フォールバック設計：**
- 無料診断：LLM障害時はモックレポートを返す
- ベーシック診断：HTTP 503 を返してユーザーに再試行を促す
- `withRetry()`：最大3回リトライ

---

## 7. 環境変数

| 変数名 | 公開範囲 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | フロント |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | フロント |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバーのみ |
| `STRIPE_SECRET_KEY` | サーバーのみ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | フロント |
| `STRIPE_WEBHOOK_SECRET` | サーバーのみ |
| `STRIPE_PRICE_BASIC_ASSESSMENT` | サーバーのみ |
| `STRIPE_PRICE_PLAN_30DAY` | サーバーのみ |
| `STRIPE_PRICE_MONTHLY` | サーバーのみ |
| `OPENAI_API_KEY` | サーバーのみ |
| `NEXT_PUBLIC_APP_URL` | フロント |

---

## 8. テスト（Vitest）

| テストファイル | カバー範囲 |
|---|---|
| `plan-generator.test.ts` | プラン生成ロジック全体・月数別手立て選択 |
| `validation.test.ts` | APIリクエストのスキーマバリデーション |

---

## 9. 非機能要件

| 項目 | 要件 |
|---|---|
| パフォーマンス | LPのFCP < 2秒（Vercel Edge配信） |
| セキュリティ | RLS全テーブル設定・サービスキーのサーバー限定使用 |
| プライバシー | 子どもの氏名をOpenAIに送信しない・Stripe経由のみカード処理 |
