# Manabi Compass — 外部サービス連携セットアップ手順

**実施順序：Supabase → Stripe → OpenAI → 環境変数 → 動作確認**

---

## STEP 1｜Supabase セットアップ

### 1-1. プロジェクト作成

1. [https://supabase.com](https://supabase.com) にアクセスしてアカウント作成
2. **New project** をクリック
   - Project name: `manabi-compass`（任意）
   - Database password: 強力なパスワードを設定（メモしておく）
   - Region: **Northeast Asia (Tokyo)** を選択
3. 作成完了まで約2分待つ

### 1-2. API キーの取得

**Settings → API** を開く

| 変数名 | 取得場所 |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` ⚠️ 秘密 |

### 1-3. スキーマの適用

**SQL Editor** を開き、`supabase/schema.sql` の内容を全てコピー＆ペーストして **Run** をクリック。

正常に完了すると以下のテーブルが作成されます：
- `users` / `children` / `assessments` / `answers`
- `plans` / `daily_logs` / `subscriptions`

### 1-4. Auth 設定（メール認証）

**Authentication → Providers → Email** を確認：
- `Enable Email provider` → ON
- `Confirm email` → ON（本番必須・開発中は OFF でも可）

**Authentication → URL Configuration**：
- Site URL: `http://localhost:3000`（本番時に変更）
- Redirect URLs に追加: `http://localhost:3000/auth/callback`

### 1-5. Auth メールテンプレート（日本語化）

**Authentication → Email Templates → Confirm signup** を開き、Subject を
`【Manabi Compass】メールアドレスの確認` に変更（任意）。

---

## STEP 2｜Stripe セットアップ

### 2-1. アカウント作成・日本円設定

1. [https://stripe.com/jp](https://stripe.com/jp) でアカウント作成
2. ダッシュボード右上でアカウント設定 → **通貨: JPY** を確認

### 2-2. 商品と価格の作成

**Products → Add product** から以下の3つを作成する：

| 商品名 | 価格 | 支払い方式 | 環境変数 |
|--------|------|-----------|---------|
| くわしいチェック | ¥1,480 | 一回払い（One time） | `STRIPE_PRICE_BASIC_ASSESSMENT` |
| 30日プラン | ¥2,450 | 一回払い（One time） | `STRIPE_PRICE_PLAN_30DAY` |
| マンスリープラン | ¥2,980/月 | 定期（Recurring・月次） | `STRIPE_PRICE_MONTHLY` |

各商品の **Price ID**（`price_` から始まる文字列）をメモする。

### 2-3. API キーの取得

**Developers → API keys** を開く：

| 変数名 | 取得場所 |
|--------|---------|
| `STRIPE_SECRET_KEY` | Secret key（`sk_test_...`） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key（`pk_test_...`） |

### 2-4. Webhook の設定

#### ローカル開発（Stripe CLI を使用）

```bash
# Stripe CLI をインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# ローカルへの転送を開始（dev サーバーを起動した状態で）
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLI が表示する `whsec_...` を `STRIPE_WEBHOOK_SECRET` に設定。

#### 本番（Vercel デプロイ後）

**Developers → Webhooks → Add endpoint**：
- Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Webhook の **Signing secret**（`whsec_...`）を `STRIPE_WEBHOOK_SECRET` に設定。

---

## STEP 3｜OpenAI API キー取得

1. [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) にアクセス
2. **Create new secret key** をクリック
3. キー（`sk-proj-...`）をメモ → `OPENAI_API_KEY` に設定

**使用モデル：** `gpt-4o-mini`（コスト最適化済み。1リクエスト約 ¥1〜3）

---

## STEP 4｜環境変数の設定

### ローカル開発

```bash
cp .env.local.example .env.local
```

`.env.local` を開き、STEP 1〜3 で取得した値を全て埋める：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_ASSESSMENT=price_...
STRIPE_PRICE_PLAN_30DAY=price_...
STRIPE_PRICE_MONTHLY=price_...

OPENAI_API_KEY=sk-proj-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 本番（Vercel）

**Vercel ダッシュボード → Project → Settings → Environment Variables** で上記と同じ変数を全て追加。
`NEXT_PUBLIC_APP_URL` は `https://your-domain.vercel.app` に変更する。

---

## STEP 5｜動作確認チェックリスト

```bash
npm run dev
```

| ページ | URL | 確認内容 |
|--------|-----|---------|
| LP | `/` | Manabi Compass ロゴ・CTA ボタンが表示される |
| サインアップ | `/signup` | メール登録できる（確認メール受信） |
| ログイン | `/login` | ログイン後にダッシュボードへリダイレクト |
| かんたんチェック | `/parent/assessment/free` | 8問回答 → 結果が表示される（OpenAI 呼び出し） |
| ダッシュボード | `/parent/dashboard` | 子どもの登録・一覧表示 |
| くわしいチェック | `/parent/assessment/basic` | Stripe 決済画面に遷移（テストカード: 4242 4242 4242 4242） |
| レポート | `/parent/report/[id]` | 支払い後に全セクション表示 |
| デモ | `/demo` | 全デモページがモックデータで表示される |

### Stripe テストカード

| カード番号 | 用途 |
|-----------|------|
| `4242 4242 4242 4242` | 成功（任意の有効期限・CVC） |
| `4000 0000 0000 9995` | 残高不足エラー |
| `4000 0025 0000 3155` | 3Dセキュア認証 |

---

## よくあるエラーと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `supabaseUrl is required` | `.env.local` 未設定 | 環境変数を確認して `npm run dev` 再起動 |
| `Invalid API Key` (Stripe) | テストキーと本番キーの混在 | ダッシュボードの「Test mode」スイッチを確認 |
| `No such price` (Stripe) | Price ID が間違っている | ダッシュボードの Products → Price ID を再確認 |
| Webhook 署名エラー | `STRIPE_WEBHOOK_SECRET` の不一致 | `stripe listen` 再起動後に表示される whsec を再設定 |
| メール確認が届かない | Supabase Auth 設定 | Authentication → Email Templates → SMTP 設定を確認 |
