import Anthropic from '@anthropic-ai/sdk'
import type { AnswersJson, AssessmentResult } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// =============================================
// ベーシック診断レポート生成
// =============================================

export async function generateAssessmentReport(
  answersJson: AnswersJson
): Promise<AssessmentResult> {
  const prompt = buildAssessmentPrompt(answersJson)

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('LLM returned non-text content')
  }

  // JSONブロックを抽出してパース
  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('LLM response does not contain valid JSON')
  }

  const result: AssessmentResult = JSON.parse(jsonMatch[0])
  return result
}

// =============================================
// 無料診断の簡易レポート（短め）
// =============================================

export async function generateFreeReport(
  answersJson: Partial<AnswersJson>
): Promise<Pick<AssessmentResult, 'summary' | 'strengths' | 'home_strategies'>> {
  const prompt = buildFreePrompt(answersJson)

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('LLM returned non-text content')
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('LLM response does not contain valid JSON')
  }

  return JSON.parse(jsonMatch[0])
}

// =============================================
// プロンプトビルダー（ベーシック診断）
// =============================================

function buildAssessmentPrompt(answersJson: AnswersJson): string {
  return `あなたは小学生〜中学生の学習特性に詳しい専門家です。
教育心理・認知特性・特別支援・家庭学習支援の観点から、
親が回答した質問データをもとに、学習特性レポートを作成してください。

以下の制約を守ってください。

【重要】
- 出力は必ず指定のJSONフォーマットに従うこと
- 効果の薄い一般論は禁止
- 年齢に不適切な内容は禁止
- 医療診断に該当する表現は禁止（ADHDなどの名称も禁止）
- "行動ベースでの特徴"に限定すること
- 家庭で再現可能なアドバイスのみを書くこと
- 否定表現ではなく、改善の方向性を書くこと

【生成ルール詳細】

●summary
- お子さんの特徴を「ポジティブに、かつ嘘なく」1段落でまとめる。

●strengths
- 課題処理・集中・理解方法などの「認知特性ベースの強み」を3つ。

●weaknesses
- 責める表現は禁止。
- "行動上つまずきやすい傾向"を3つ。

●risk_situations
- 「こういう場面で困りやすい」という場面描写を書く。
（例：手順が多いプリントだと混乱しやすい、など）

●home_strategies
- 親が"そのまま明日から使える"手立てを3つ。
- 「5分区切り」「見本を置く」「視覚化」のような即効性のある方法に限定。

●study_style
- 回答傾向から判断される学習スタイル（視覚/聴覚/体感 など）を1つ選ぶ。
- なぜそのスタイルが合うのか、説明を入れる。

-------------------------
【入力データ】
- 子どもの学年: ${answersJson.grade}
- 回答データ（JSON）:
${JSON.stringify(answersJson, null, 2)}
-------------------------

【出力フォーマット（必ず厳守）】

{
  "summary": "お子さんの特徴を1段落でわかりやすくまとめた文章を記載",
  "strengths": [
    "強み1",
    "強み2",
    "強み3"
  ],
  "weaknesses": [
    "つまずきやすい特性1",
    "つまずきやすい特性2",
    "つまずきやすい特性3"
  ],
  "risk_situations": [
    "困りやすい場面1（行動ベース）",
    "困りやすい場面2（行動ベース）",
    "困りやすい場面3（行動ベース）"
  ],
  "home_strategies": [
    "家庭でできる手立て1（具体的に）",
    "家庭でできる手立て2（具体的に）",
    "家庭でできる手立て3（具体的に）"
  ],
  "study_style": {
    "type": "視覚/聴覚/体感/読み書き など1つ",
    "description": "そのスタイルが合う理由を簡潔に"
  }
}

JSONのみ出力してください。説明文は不要です。`
}

// =============================================
// プロンプトビルダー（無料診断）
// =============================================

function buildFreePrompt(answersJson: Partial<AnswersJson>): string {
  const domains = answersJson.domains
  const flags = answersJson.flags

  const flagSummary = flags
    ? Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')
    : 'なし'

  return `あなたは子どもの学習特性に詳しい専門家です。
以下の簡易診断データをもとに、親向けの「お試しレポート」を作成してください。

【重要】
- 医療診断に相当する表現は禁止
- 行動ベースで具体的に書く
- ポジティブなトーンを保ちながら正直に書く

【入力データ】
- 学年: ${answersJson.grade}
- 注意力スコア: ${domains?.attention?.score ?? 'N/A'} (${domains?.attention?.level ?? 'N/A'})
- 意欲・情緒スコア: ${domains?.motivation_emotion?.score ?? 'N/A'} (${domains?.motivation_emotion?.level ?? 'N/A'})
- 学習習慣スコア: ${domains?.study_habits?.score ?? 'N/A'} (${domains?.study_habits?.level ?? 'N/A'})
- 注意フラグ: ${flagSummary}

【出力フォーマット（必ず厳守）】
{
  "summary": "お子さんの特徴を2〜3文でまとめた文章",
  "strengths": ["強み1", "強み2"],
  "home_strategies": ["明日から使える手立て1", "明日から使える手立て2"]
}

JSONのみ出力してください。`
}
