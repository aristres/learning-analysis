# Supabase セットアップ手順

## 1. プロジェクト作成

1. https://supabase.com にアクセス（妻のアカウント）
2. 「New Project」をクリック
3. 以下を設定：
   - **Name**: `kiddo-insight`
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック（2-3分待つ）

## 2. テーブル作成（SQL実行）

1. 左メニュー「SQL Editor」をクリック
2. `supabase/schema.sql` の内容を**全て**コピー＆ペースト
3. 「Run」をクリック
4. エラーが出なければ成功

## 3. Auth 設定

1. 左メニュー「Authentication」→「Providers」
2. **Email** が有効になっていることを確認
3. 「Confirm email」は**有効**のままでOK（メール確認あり）

### リダイレクトURL設定
1. 「Authentication」→「URL Configuration」
2. **Site URL**: `http://localhost:3000`（後で本番URLに変更）
3. **Redirect URLs** に以下を追加：
   - `http://localhost:3000/**`
   - `https://your-app.vercel.app/**`（デプロイ後に追加）

## 4. API キー取得

1. 左メニュー「Project Settings」→「API」
2. 以下をコピーして `.env.local` に設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  （Project URL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                （anon public key）
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     （service_role key ← 秘密！）
```

## 5. 確認

テーブルが作成されたか確認：
1. 左メニュー「Table Editor」
2. 以下の7テーブルが表示されればOK：
   - users
   - children
   - assessments
   - answers
   - plans
   - daily_logs
   - subscriptions

## 注意事項

- `SUPABASE_SERVICE_ROLE_KEY` は**絶対にフロントエンドに公開しない**
- RLSポリシーが全テーブルに設定済み
- `handle_new_user` トリガーにより、ユーザー登録時に自動的に `users` テーブルにレコードが作成される
