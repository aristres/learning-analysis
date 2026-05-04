import OpenAI from 'openai'
import type { AnswersJson, AssessmentResult, LearningTypeResult } from '@/types'

// 遅延初期化：ビルド時ではなく実行時にのみクライアントを生成する
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60_000,
      maxRetries: 2,
    })
  }
  return _openai
}

// OpenAI未設定時のフォールバックレポート
const FALLBACK_REPORT: AssessmentResult = {
  summary: 'お子さんの回答をもとに傾向を分析しました。詳細なAIレポートは準備中です。現在の回答データは保存されており、AIレポート機能が有効になり次第、自動的に生成されます。',
  strengths: ['自分のペースで取り組む力', '観察力・気づく力', '継続して取り組む姿勢'],
  weaknesses: ['新しい環境への慣れに時間がかかる傾向', '複数の指示を同時に処理するのが難しい傾向', '疲れると集中が途切れやすい傾向'],
  risk_situations: ['手順が多いと混乱しやすい傾向がある', 'ざわついた環境では集中しにくい傾向がある', '時間のプレッシャーがあると焦りやすい傾向がある'],
  home_strategies: ['1つずつ順番に指示する', '静かな学習環境を作る', '短い時間に区切って休憩を入れる'],
  math_strategies: ['図や絵を使って視覚的に理解する', '具体的な物を使って考える', '1問ずつ丁寧に取り組む'],
  japanese_strategies: ['音読を取り入れる', '書き順を声に出しながら練習する', '短い文章から始める'],
  study_style: {
    type: '視覚',
    description: '見て理解するスタイルが合う傾向があります。図や絵を使った説明が効果的です。',
  },
}

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
  answersJson: AnswersJson,
  learningProfile?: LearningTypeResult
): Promise<AssessmentResult> {
  const client = getOpenAI()
  if (!client) {
    console.warn('OPENAI_API_KEY not set. Returning fallback report.')
    return FALLBACK_REPORT
  }

  const prompt = buildAssessmentPrompt(answersJson, learningProfile)

  return withRetry(async () => {
    const completion = await client.chat.completions.create({
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
  const client = getOpenAI()
  if (!client) {
    console.warn('OPENAI_API_KEY not set. Returning fallback free report.')
    return {
      summary: FALLBACK_REPORT.summary,
      strengths: FALLBACK_REPORT.strengths,
      home_strategies: FALLBACK_REPORT.home_strategies,
    }
  }

  const prompt = buildFreePrompt(answersJson)

  return withRetry(async () => {
    const completion = await client.chat.completions.create({
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

function buildAssessmentPrompt(answersJson: AnswersJson, learningProfile?: LearningTypeResult): string {
  const typeContext = learningProfile
    ? `
【v2 学習タイプ分類（ルールベース判定済み）】
- プライマリタイプ: ${learningProfile.type_label}（${learningProfile.primary_type}）
- タイプの傾向: ${learningProfile.type_description}
- サブタグ: ${learningProfile.sub_tags.length > 0 ? learningProfile.sub_tags.join(', ') : 'なし'}

このタイプ情報をコンテキストとして活かし、study_style はこのタイプと一貫性のある内容で記述してください。`
    : ''

  return `教育心理・認知特性・特別支援・家庭学習支援の観点から、
親が回答した質問データをもとに、学習特性レポートを作成してください。

以下の制約を守ってください。

【重要】
- 出力は必ず指定のJSONフォーマットに従うこと
- 効果の薄い一般論は禁止
- 年齢に不適切な内容は禁止
- 医療診断に該当する表現は禁止（ADHDなどの名称も禁止）
- "行動ベースでの特徴"に限定すること（「〜の傾向があります」「〜しやすいようです」など傾向表現を使う）
- 断定表現（「〜です」「〜の子です」）は避け、傾向・可能性の表現を使うこと
- 家庭で再現可能なアドバイスのみを書くこと
- 否定表現ではなく、改善の方向性を書くこと
${typeContext}
【生成ルール詳細】

●summary
- お子さんの特徴を「ポジティブに、かつ嘘なく」1段落でまとめる。
- 「〜の傾向が見られます」「〜しやすいお子さんのようです」など傾向表現を使う。

●strengths
- 課題処理・集中・理解方法などの「認知特性ベースの強み」を3つ。

●weaknesses
- 責める表現は禁止。
- "行動上つまずきやすい傾向"を3つ。傾向表現を使うこと。

●risk_situations
- 「こういう場面で困りやすい傾向がある」という場面描写を書く。
（例：手順が多いプリントだと混乱しやすい傾向がある、など）

●home_strategies
- 親が"そのまま明日から使える"手立てを3つ。
- 「5分区切り」「見本を置く」「視覚化」のような即効性のある方法に限定。

●study_style
- v2タイプ分類と一貫性のある学習スタイルを記述する。
- なぜそのスタイルが合う傾向があるのか、説明を入れる。

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
    "困りやすい場面1（行動ベース・傾向表現）",
    "困りやすい場面2（行動ベース・傾向表現）",
    "困りやすい場面3（行動ベース・傾向表現）"
  ],
  "home_strategies": [
    "家庭でできる手立て1（具体的に）",
    "家庭でできる手立て2（具体的に）",
    "家庭でできる手立て3（具体的に）"
  ],
  "study_style": {
    "type": "視覚/聴覚/体感/熟慮/直感/構造 など1つ",
    "description": "そのスタイルが合う傾向がある理由を簡潔に"
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
