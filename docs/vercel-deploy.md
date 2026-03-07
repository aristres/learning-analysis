# Vercel デプロイ手順

## 前提
- GitHub: aristres/learning-analysis にプッシュ済み
- Vercel: あなた（旦那さん）のアカウント

## 1. Vercel にプロジェクトをインポート

1. https://vercel.com にログイン
2. 「Add New...」→「Project」
3. GitHub リポジトリ `aristres/learning-analysis` を選択
4. 「Import」をクリック

## 2. ビルド設定

自動検出されるはずだが、念のため確認：
- **Framework Preset**: Next.js
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`
- **Output Directory**: `.next`（デフォルト）

## 3. 環境変数を設定

「Environment Variables」セクションに以下を全て追加：

| Key | Value | 備考 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe テストキー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe 公開キー |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | 後で設定（手順5参照） |
| `STRIPE_PRICE_BASIC_ASSESSMENT` | `price_...` | ベーシック診断 1,480円 |
| `STRIPE_PRICE_PLAN_30DAY` | `price_...` | 30日プラン 2,450円 |
| `STRIPE_PRICE_MONTHLY` | `price_...` | マンスリー 2,980円/月 |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API キー |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | デプロイ後のURL |

4. 「Deploy」をクリック

## 4. デプロイ後の設定

### Supabase リダイレクトURL追加
1. Supabase → Authentication → URL Configuration
2. Redirect URLs に追加: `https://your-app.vercel.app/**`
3. Site URL を変更: `https://your-app.vercel.app`

### NEXT_PUBLIC_APP_URL を更新
1. Vercel → Settings → Environment Variables
2. `NEXT_PUBLIC_APP_URL` を実際のデプロイURLに変更
3. Redeploy

## 5. Stripe Webhook 設定

1. Stripe Dashboard → Developers → Webhooks
2. 「Add endpoint」をクリック
3. **Endpoint URL**: `https://your-app.vercel.app/api/stripe/webhook`
4. **Events** を選択:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 「Add endpoint」をクリック
6. 表示される **Signing secret** (`whsec_...`) をコピー
7. Vercel → Settings → Environment Variables で `STRIPE_WEBHOOK_SECRET` を更新
8. Redeploy

## 6. Stripe 商品・価格作成

### テストモードで作成（Stripe Dashboard）

1. Products → Add product
   - **ベーシック診断**: ¥1,480 / One time
   - **30日プラン**: ¥2,450 / One time
   - **マンスリー**: ¥2,980 / Monthly recurring

2. 各商品の Price ID (`price_...`) をコピー
3. Vercel の環境変数に設定

## 7. 本番切り替え

テストが完了したら：
1. Stripe Dashboard → 本番モードに切り替え
2. 本番用のキーとWebhook Secretで環境変数を更新
3. Redeploy
