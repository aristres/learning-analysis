# セットアップ手順（SETUP.md）

---

## 前提条件

- Next.js 15 App Router
- Supabase（既存プロジェクト）
- Stripe（既存設定）
- OpenAI API Key（`OPENAI_API_KEY` 環境変数）

---

## ステップ 1：ファイルのコピー

このパッケージの `src/` 以下のファイルを、プロジェクトの `src/` 以下にコピーします。

```bash
# パッケージのルートから実行する場合
cp -r src/ /path/to/your/project/src/
cp -r supabase/ /path/to/your/project/supabase/
```

**注意：** 既存ファイルを上書きします。特に以下のファイルは重要な変更が含まれています：
- `src/lib/scoring.ts` — TypeScript の型エラーが出る場合は `src/types/index.ts` も必ず適用
- `src/app/parent/report/[assessmentId]/page.tsx` — フリーミアムロジックが入っています

---

## ステップ 2：Supabase マイグレーション

```bash
supabase db push
```

または Supabase ダッシュボード → SQL エディタで以下を実行：

```sql
-- supabase/migrations/20250321_chat_messages.sql の内容をそのままペースト
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id   UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ...（以下省略・ファイルの内容を参照）
```

---

## ステップ 3：middleware.ts の更新

`src/lib/supabase/middleware.ts`（または `src/middleware.ts`）の
`protectedPaths` 配列に以下を追加：

```ts
const protectedPaths = [
  // ...既存のパス...
  '/parent/chat',    // ← 追加
  '/api/chat',       // ← 追加
]
```

---

## ステップ 4：環境変数の確認

`.env.local` に以下が設定されていることを確認：

```env
OPENAI_API_KEY=sk-...          # AIコーチチャットに必須
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## ステップ 5：動作確認

```bash
npm run dev
```

以下の画面が正常に動作することを確認：

1. **LP**（`/`）— 波形・STEPカード・グラデーションCTAが表示される
2. **詳細チェック**（`/parent/assessment/basic`）— 支払いなしで20問が回答できる
3. **レポート**（`/parent/report/[id]`）— 未払い時はロック表示、paid後は全表示
4. **AIコーチ**（`/parent/chat/[childId]`）— チャットが送受信できる（要マンスリープラン）

---

## 管理画面の使い方

`admin/admin_dashboard.jsx` は独立した React ファイルです。

**方法A（Claude Artifact として使う）**
ファイルの内容をコピーして Claude のチャットに貼り付け → Artifact として表示

**方法B（プロジェクトに組み込む）**
```
src/app/admin/analytics/page.tsx として配置
```
現在はモックデータなので、Supabase からの実データ取得は別途実装が必要です。
