# アプリサービス弱点分析レポート（2026-05-04）

対象: `learning-analysis`（Next.js + Supabase + Stripe）

## 結論（経営・運用目線）

このサービスの主要弱点は、**「認可の防御層が薄い」「決済イベントの再実行耐性が弱い」「高コストAPIの濫用対策が未適用」**の3点です。  
特に、親子データを扱う性質上、ID指定系APIの防御不備は信頼毀損に直結します。

---

## 重要度付きの弱点一覧

## 1. [High] OAuthコールバックのオープンリダイレクト余地
- 対象: `src/app/auth/callback/route.ts`
- 事象: `next` クエリをそのまま `origin + next` に連結して遷移先決定。
- 影響:
  - ログイン直後に悪性ページへ誘導されるフィッシング導線化
  - 「公式ログインを経た遷移」という見え方になり、騙されやすい
- 具体対策:
  - `next` は `/` 始まりのみ許可、`//`・`\`・`http:` 形式を拒否
  - `/parent` `/child` など許可プレフィックス方式へ変更

## 2. [High] childId/planId依存の認可不足（IDOR耐性の弱さ）
- 対象:
  - `src/app/api/checkout/route.ts`
  - `src/app/api/assessment/basic/route.ts`
  - `src/app/api/daily-log/route.ts`
  - `src/app/api/plan/route.ts`
- 事象: クライアント入力の `childId` / `planId` を前提に書き込み処理が進む箇所がある。
- 影響:
  - RLSが将来ゆるんだ場合に越権更新が成立しうる
  - 「DBポリシーのみ」に依存し、アプリ層の防御が不足（defense-in-depth欠如）
- 具体対策:
  - 書き込み前に必ず `parent_id = user.id` で所有権照合
  - 不一致時 `403` を返す共通ヘルパーを導入
  - APIレビュー時に「ID受取→所有権検証」のチェックリストを必須化

## 3. [Medium] Stripe Webhookの冪等性不足（再送・再実行に弱い）
- 対象: `src/app/api/stripe/webhook/route.ts`
- 事象: 署名検証はあるが、`event.id` の処理済み管理がない。
- 影響:
  - Stripe再送時にプラン重複作成、課金状態の不整合
  - CS対応工数増、返金対応リスク
- 具体対策:
  - `processed_webhook_events(event_id unique)` を作成
  - トランザクション内で「未処理時のみ」本処理を実行
  - `plans` 側にも業務要件に応じた一意制約を追加

## 4. [Medium] LLM系エンドポイントのレート制限未適用
- 対象:
  - `src/app/api/assessment/free/route.ts`
  - `src/app/api/assessment/basic/route.ts`
  - （補助実装は存在）`src/lib/rate-limit.ts`
- 事象: レート制限ユーティリティは存在するが、主要ルートで未使用。
- 影響:
  - API濫用による推論コスト急増
  - レイテンシ悪化・実質DoS
- 具体対策:
  - ログインユーザー単位 + IP単位の二段制限
  - 429 + Retry-After返却を全LLMルートに統一
  - 失敗率/429率/利用単価のダッシュボード監視

## 5. [Low] 例外握りつぶしによる監視性低下
- 対象:
  - `src/app/api/assessment/free/route.ts`
  - `src/lib/supabase/server.ts`
- 事象: `catch {}` で失敗理由が可観測でない。
- 影響:
  - 攻撃兆候・障害兆候の検知遅延
- 具体対策:
  - 構造化ログ（request_id, user_id hash, route, error_code）導入
  - 監査ログとアラート閾値設定

---

## サービス運用上の弱点（コード外も含む）

1. **単一防御への依存**: 認可をRLSに寄せすぎで、アプリ層の二重防御が薄い。  
2. **決済運用の再実行設計不足**: Webhook再送を前提とした設計が未完成。  
3. **コストガード不足**: LLM利用の上限制御が弱く、利用急増に脆い。  
4. **検知能力不足**: 失敗の握りつぶしで、インシデント初動が遅れる。

---

## 優先対応ロードマップ（短期）

### 48時間以内
- OAuth `next` のバリデーション実装
- `childId/planId` 利用APIに所有権チェックを追加

### 1週間以内
- Webhook冪等テーブル導入 + 重複テスト実装
- LLMルートへレート制限適用

### 2週間以内
- 監査ログ整備、アラート設定
- セキュリティ回帰テスト（IDOR, redirect, webhook replay）をCIに追加

---

## 現状の良い点

- Stripe Webhook署名検証は導入済み
- 認証必須のルートが多く、`parent_id` フィルタも複数箇所で実施済み
- レート制限の基盤コード自体は存在
