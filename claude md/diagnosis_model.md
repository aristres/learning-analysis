# 診断モデル仕様書

## 概要

KIDDO Insightの診断モデルは、保護者が観察した子どもの行動特性を8つの認知ドメインにスコアリングし、学習特性プロファイルを生成する。医療診断ではなく**行動観察ベースの傾向把握**として設計されている。

---

## 8つの評価ドメイン

| ドメインID | ラベル | 測定対象の概念 | 使用質問 |
|---|---|---|---|
| attention | 集中のしやすさ | 選択的注意・持続的注意・注意の転換 | Q1, Q2, Q3, Q4, Q5 |
| working_memory | 手順の記憶 | 作業記憶・多段処理 | Q4, Q5, Q6, Q10 |
| processing_speed | 作業スピード | 情報処理速度・流暢性・ミス率 | Q3, Q8, Q15 |
| motivation_emotion | やる気・気持ち | 学習意欲・感情調整・自己効力感 | Q11, Q12, Q13 |
| study_habits | 学習習慣 | 自己調整学習・生活リズム | Q3, Q14, Q15, Q20 |
| sensory | 感覚の特徴 | 感覚処理・学習モダリティ | Q18, Q19 |
| math_calculation | 算数・計算 | 数的処理・計算流暢性 | Q8, Q9, Q15 |
| kanji_literacy | 国語・漢字 | 言語理解・音韻処理・漢字記憶 | Q6, Q9, Q16 |

---

## スコア計算の実装

```typescript
// src/lib/scoring.ts

// 回答値（1〜3）を 0〜100 に変換
// avg=1 → 0（最も支援が必要）
// avg=2 → 50（平均的）
// avg=3 → 100（強みがある）
const score = Math.round(((avg - 1) / 2) * 100)

// レベル判定
score < 40  → 'low'    重点支援が必要
score < 70  → 'middle' 標準的
score >= 70 → 'high'   強みとして活かせる
```

---

## 診断フラグ（boolean）

```typescript
flags: {
  low_attention:      attention.score < 40,
  low_working_memory: working_memory.score < 40,
  slow_processing:    processing_speed.score < 40,
  low_motivation:     motivation_emotion.score < 40,
  fragile_emotion:    Q11 <= 2 && Q13 <= 2,  // 感情的に折れやすいパターン
  weak_study_habit:   study_habits.score < 40,
}
```

---

## 学習スタイル判定ロジック

```typescript
// src/lib/llm.ts の determineLearningStyle()

if (sensory.score >= 65 && rawQ19 === 3) → 'visual'（視覚優位）
if (sensory.score < 40)                  → 'kinesthetic'（体感覚優位）
else                                     → 'auditory'（聴覚優位）
```

---

## 無料診断（8問）と有料診断（20問）の違い

| 項目 | 無料診断 | ベーシック診断 |
|---|---|---|
| 質問数 | 8問 | 20問 |
| 計算されるドメイン | attention・motivation_emotion・study_habits（3つ） | 全8ドメイン |
| 未計算ドメインの扱い | score: 50, level: 'middle' に固定 | 実際の回答から計算 |
| LLM出力 | summary・strengths・home_strategies（3フィールド） | 6フィールド（詳細レポート） |
| 登録 | 不要（ゲストモード対応） | 必要（決済前提） |

---

## LLM出力フィールド（ベーシック診断）

| フィールド | 内容 | 件数 |
|---|---|---|
| summary | お子さんの特徴の1段落まとめ | — |
| strengths | 認知特性ベースの強み | 3つ |
| weaknesses | 行動上つまずきやすい傾向（責める表現禁止） | 3つ |
| risk_situations | 困りやすい場面描写 | 3つ |
| home_strategies | 明日から使える家庭での手立て | 3つ |
| study_style | 学習スタイル（type + description） | 1つ |

---

## LLM禁止事項（設計上の制約）

- ADHD・LD・ASD・発達障害などの診断名は絶対に使用しない
- 医療診断に相当する断言をしない
- 「問題がある」「異常」「遅れている」などの否定表現を使わない
- 行動ベースの特性描写のみ行う
- 親の育て方を批判・示唆しない

---

## クロスドメイン質問（複数のドメインで使用）

| 質問 | 使用ドメイン |
|---|---|
| Q3（取りかかり速度） | attention / processing_speed / study_habits（3ドメイン最多） |
| Q4（手順の多さへの苦手さ） | attention / working_memory |
| Q5（忘れ物・提出物） | attention / working_memory |
| Q8（計算・作業スピード） | processing_speed / math_calculation |
| Q9（文章題の理解） | math_calculation / kanji_literacy |
| Q15（宿題のミス量） | study_habits / processing_speed / math_calculation |

---

## 既知の設計課題

1. **学年補正なし**：小1と中3で同一スコア基準。低学年の「正常範囲」が異なる
2. **sensoryの質問不足**：2問のみで信頼性が低い（3〜4問が望ましい）
3. **Q17の非活用**：教科別の得意・苦手はLLM補助情報のみ。スコアへの反映未対応
4. **保護者バイアス**：親の主観的な観察に依存するため、評価にばらつきがある
5. **縦断的変化の未追跡**：ある時点のスナップショット。マンスリーでの変化追跡が必要
