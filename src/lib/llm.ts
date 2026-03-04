import OpenAI from 'openai'
import type { AnswersJson, AssessmentResult } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 60_000, // 60秒タイムアウト
  maxRetries: 2,   // 自動リトライ2回
})

// =============================================
// リトライヘルパー（アプリケーションレベル）
// =============================================

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`LLM attempt ${attempt + 1}/${maxRetries + 1} failed:`, lastError.message)

      if (attempt < maxRetries) {
        // 指数バックオフ
        const delay = delayMs * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

// =============================================
// ベーシック診断レポート生成
// =============================================

export async function generateAssessmentReport(
  answersJson: AnswersJson
): Promise<AssessmentResult> {
  const prompt = buildAssessmentPrompt(answersJson)

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'あなたは小学生〜中学生の学習特性に詳しい専門家です。必ず指定されたJSON形式で回答してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('LLM returned empty content')
    }

    const result: AssessmentResult = JSON.parse(content)

    // 必須フィールドの簡易バリデーション
    if (!result.summary || !result.strengths || !result.weaknesses) {
      throw new Error('LLM response missing required fields')
    }

    return result
  })
}

// =============================================
// 無料診断の簡易レポート（短め）
// =============================================

export async function generateFreeReport(
  answersJson: Partial<AnswersJson>
): Promise<Pick<AssessmentResult, 'summary' | 'strengths' | 'home_strategies'>> {
  const prompt = buildFreePrompt(answersJson)

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'あなたは子どもの学習特性に詳しい専門家です。必ず指定されたJSON形式で回答してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('LLM returned empty content')
    }

    const result = JSON.parse(content)

    if (!result.summary || !result.strengths) {
      throw new Error('LLM response missing required fields')
    }

    return result
  })
}

// =============================================
// プロンプトビルダー（ベーシック診断）
// =============================================

function buildAssessmentPrompt(answersJson: AnswersJson): string {
  return `教育心理・認知特性・特別支援・家庭学習支援の観点から、
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

  return `以下の簡易診断データをもとに、親向けの「お試しレポート」を作成してください。

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
