# KIDDO Insight — ユーザーフロー設計書

## 概要

KIDDO Insight における主要なユーザーフローを網羅的に定義する。
ゲストユーザー・登録済みユーザー・有料ユーザーの3状態を基軸に、各フローの導線・状態遷移・エラーケースを記述する。

---

## ユーザー状態の定義

| 状態 | 定義 |
|---|---|
| **ゲスト** | 未登録・未ログイン。無料診断のみ利用可能 |
| **登録済み（無料）** | アカウント作成済み。有料機能は未購入 |
| **ベーシック購入済み** | ¥1,480 の買切を完了。詳細レポート・30日プランが見られる |
| **マンスリー加入中** | ¥2,980/月 の継続課金。毎月プランが更新される |

---

## フロー 1：無料診断（ゲスト）

最も重要な獲得フロー。登録ゼロのまま価値を体験させ、有料転換を促す。

```
[LP]
  ↓ 「無料で診断する」CTA
[学年・名前入力]（/parent/assessment/free, step=0）
  ↓
[Q1〜Q8 を1問ずつ表示]（step=1〜8）
  ↓
[ローディング]（step=9）
  ↓ POST /api/assessment/free
[簡易レポート表示]（step=10）
  - summary / strengths × 3 / home_strategies × 3
  ↓
[CTA: 「もっと詳しく知る → ベーシック診断へ」]
  ↓
[/login または /signup]
```

**エラーケース：**
- LLM障害 → モックレポートを返す（ユーザーはエラーに気づかない）
- ネットワークエラー → エラーメッセージ + 再送信ボタン

---

## フロー 2：アカウント登録

```
[/signup]
  ↓ メールアドレス + パスワード入力
[Supabase Auth] → 確認メール送信
  ↓ メール内リンクをクリック
[handle_new_user トリガー] → users テーブルに自動挿入
  ↓
[/parent/dashboard]
```

**注意：** メール確認必須。確認前はダッシュボードにアクセスできない。

---

## フロー 3：ベーシック診断購入・実施

最重要の収益フロー。

```
[/parent/dashboard]
  ↓ 「診断する」ボタン
[/parent/payment/plan?type=basic_assessment]
  ↓ 子ども選択（なければ /parent/children/add へ）
  ↓ 「購入して診断を始める」
[POST /api/checkout] → Stripe Checkout Session 作成
  ↓
[stripe.com（外部決済画面）]
  ↓ 決済完了
[POST /api/stripe/webhook]（checkout.session.completed）
  ↓ assessments.payment_status = 'paid'
[/parent/assessment/basic?assessmentId=xxx]
  ↓ Q1〜Q20 を表示
[POST /api/assessment/basic]
  ↓ スコア計算 → LLM レポート生成 → 30日プラン自動生成
[/parent/report/[assessmentId]]
  ↓
[/parent/plan/[planId]]
```

**エラーケース：**
- 決済済みだが診断未完了 → `assessmentId` パラメータで再開可能
- LLM障害 → HTTP 503 + 「もう一度お試しください」
- 支払い未完了のまま診断アクセス → 403 → 決済ページへリダイレクト

---

## フロー 4：子ども追加

```
[/parent/dashboard]
  ↓ 「+ 追加」ボタン
[/parent/children/add]
  ↓ ニックネーム・学年・生まれ年を入力
[POST /api/children] → children テーブルに挿入
  ↓
[/parent/dashboard]（追加された子どもが表示される）
```

---

## フロー 5：日次ログ記録（マンスリーユーザー）

```
[/parent/plan/[planId]]
  ↓ 「今日のログを記録する」
[日次チェックインフォーム]
  Q1: 今日やった科目 / Q2: やりやすさ / Q3: 気分 / Q4〜Q10: 各種フィードバック
[POST /api/daily-log]
  ↓ daily_logs テーブルに保存
[完了画面]
```

---

## フロー 6：デモ閲覧（未登録ユーザー）

登録前にプロダクトを体験させるウォークスルー。モックデータを使用。

```
[LP フッター「デモページを見る」]
  ↓
[/demo]（認証不要・DB保存なし）
  ├── /demo/dashboard
  ├── /demo/assessment/basic
  ├── /demo/report
  ├── /demo/plan
  ├── /demo/growth-report
  └── /demo/child/self-discovery
```

全画面に「デモモード：モックデータを表示しています」バナーを表示。
データは `src/lib/demo-data.ts` の `DEMO_CHILDREN` / `DEMO_ANSWERS_JSON` 等を使用。

---

## 認証ガード一覧（middleware.ts）

| パス | アクセス |
|---|---|
| `/` `/demo/**` `/privacy` `/terms` `/tokushoho` `/login` `/signup` | 誰でも |
| `/parent/assessment/free` `/api/assessment/free` | 誰でも |
| `/parent/dashboard` `/parent/assessment/basic` `/parent/children/**` | ログイン必須 |
| `/parent/report/**` `/parent/payment/**` `/parent/plan/**` | ログイン必須 |
| `/child/**` | ログイン必須 |
| `/api/assessment/basic` `/api/plan` `/api/daily-log` `/api/checkout` | ログイン必須 |

未認証で保護パスへのアクセス → `/login` へリダイレクト

---

## 画面遷移マップ

```
LP (/)
├── /parent/assessment/free    無料診断
│   └── 結果 → /login or /signup
├── /login → /parent/dashboard
│   ├── /parent/children/add
│   ├── /parent/payment/plan
│   │   └── stripe.com → /parent/assessment/basic
│   │       └── /parent/report/[id]
│   │           └── /parent/plan/[id]
│   │               └── 日次ログ
│   └── /parent/plan/[id]     既存プランへの再アクセス
├── /demo                      デモ一覧
│   ├── /demo/dashboard
│   ├── /demo/report
│   └── /demo/plan
├── /privacy
├── /terms
└── /tokushoho
```
