import type {
  AnswersJson,
  DomainScore,
  DomainLevel,
  FreeAnswersRaw,
  LearningType,
  LearningTypeResult,
  SubTag,
} from '@/types'

// =============================================
// スコア計算ユーティリティ
// =============================================

function toDomainLevel(score: number): DomainLevel {
  if (score < 40) return 'low'
  if (score < 70) return 'middle'
  return 'high'
}

// 平均スコアを 0〜100 に変換（仕様: avg=1→0, avg=2→50, avg=3→100）
function calcDomainScore(values: number[]): number {
  if (values.length === 0) return 50
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(((avg - 1) / 2) * 100)
}

function makeDomain(values: number[], items: string[]): DomainScore {
  const score = calcDomainScore(values)
  return { score, level: toDomainLevel(score), items }
}

// =============================================
// ベーシック診断（20問）の集計
// =============================================

export function calcBasicAnswersJson(
  rawScores: Record<string, number | string | string[] | { good: string[]; weak: string[] }>,
  grade: string
): AnswersJson {
  const n = (key: string) => (rawScores[key] as number) ?? 2

  // Q17 は教科カテゴリ扱い
  const q17 = (rawScores['Q17'] as { good: string[]; weak: string[] }) ?? { good: [], weak: [] }

  // attention: Q1,Q2,Q3,Q4,Q5
  const attention = makeDomain(
    [n('Q1'), n('Q2'), n('Q3'), n('Q4'), n('Q5')],
    ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  )

  // working_memory: Q4,Q5,Q6,Q10
  const working_memory = makeDomain(
    [n('Q4'), n('Q5'), n('Q6'), n('Q10')],
    ['Q4', 'Q5', 'Q6', 'Q10']
  )

  // processing_speed: Q3,Q8,Q15
  const processing_speed = makeDomain(
    [n('Q3'), n('Q8'), n('Q15')],
    ['Q3', 'Q8', 'Q15']
  )

  // motivation_emotion: Q11,Q12,Q13
  const motivation_emotion = makeDomain(
    [n('Q11'), n('Q12'), n('Q13')],
    ['Q11', 'Q12', 'Q13']
  )

  // study_habits: Q3,Q14,Q15,Q20
  const study_habits = makeDomain(
    [n('Q3'), n('Q14'), n('Q15'), n('Q20')],
    ['Q3', 'Q14', 'Q15', 'Q20']
  )

  // sensory: Q18,Q19
  const sensory = makeDomain(
    [n('Q18'), n('Q19')],
    ['Q18', 'Q19']
  )

  // math_calculation: Q8(計算スピード),Q9(文章題理解),Q15(ミス量)
  const math_calculation = makeDomain(
    [n('Q8'), n('Q9'), n('Q15')],
    ['Q8', 'Q9', 'Q15']
  )

  // kanji_literacy: Q6(説明理解),Q9(文章題),Q16(漢字習得)
  const kanji_literacy = makeDomain(
    [n('Q6'), n('Q9'), n('Q16')],
    ['Q6', 'Q9', 'Q16']
  )

  // フラグ判定
  const flags = {
    low_attention: attention.score < 40,
    low_working_memory: working_memory.score < 40,
    slow_processing: processing_speed.score < 40,
    low_motivation: motivation_emotion.score < 40,
    fragile_emotion: n('Q11') <= 2 && n('Q13') <= 2,
    weak_study_habit: study_habits.score < 40,
  }

  return {
    grade,
    raw_scores: {
      Q1: n('Q1'), Q2: n('Q2'), Q3: n('Q3'), Q4: n('Q4'),
      Q5: n('Q5'), Q6: n('Q6'),
      Q7: (rawScores['Q7'] as string[]) ?? [],
      Q8: n('Q8'), Q9: n('Q9'), Q10: n('Q10'),
      Q11: n('Q11'), Q12: n('Q12'), Q13: n('Q13'), Q14: n('Q14'),
      Q15: n('Q15'), Q16: n('Q16'),
      Q17: q17,
      Q18: n('Q18'), Q19: n('Q19'), Q20: n('Q20'),
    },
    domains: {
      attention,
      working_memory,
      processing_speed,
      motivation_emotion,
      study_habits,
      sensory,
      math_calculation,
      kanji_literacy,
    },
    flags,
  }
}

// =============================================
// 無料診断（8問）の簡易集計
// =============================================

export function calcFreeAnswersJson(
  raw: FreeAnswersRaw,
  grade: string
): Partial<AnswersJson> {
  // Q1: 集中 (よくある=1, 時々=2, あまりない=3)
  // Q3: 宿題開始 (自分で=3, 声かけ=2, 渋る=1)
  // Q4: 気が散り (多い=1, 普通=2, 少ない=3)
  // Q5: 苦手反応 (すぐ嫌=1, 少し=2, 普通=3)
  // Q6: わからない時 (諦める=1, 少し=2, 粘る=3)
  // Q7: 生活リズム (不規則=1, やや=2, 整=3)

  const attention = makeDomain(
    [raw.Q1, raw.Q3, raw.Q4, raw.Q5],
    ['Q1', 'Q3', 'Q4', 'Q5']
  )
  const motivation_emotion = makeDomain([raw.Q5, raw.Q6], ['Q5', 'Q6'])
  const study_habits = makeDomain([raw.Q3, raw.Q7], ['Q3', 'Q7'])

  return {
    grade,
    raw_scores: {
      Q1: raw.Q1, Q2: 0, Q3: raw.Q3, Q4: raw.Q4,
      Q5: raw.Q5, Q6: raw.Q6,
      Q7: raw.Q8, // 得意スタイル配列を Q7 に格納
      Q8: 0, Q9: 0, Q10: 0,
      Q11: 0, Q12: 0, Q13: 0, Q14: 0,
      Q15: 0, Q16: 0,
      Q17: { good: [], weak: [] },
      Q18: 0, Q19: 0, Q20: raw.Q7,
    },
    domains: {
      attention,
      working_memory: { score: 50, level: 'middle', items: [] },
      processing_speed: { score: 50, level: 'middle', items: [] },
      motivation_emotion,
      study_habits,
      sensory: { score: 50, level: 'middle', items: [] },
      math_calculation: { score: 50, level: 'middle', items: [] },
      kanji_literacy: { score: 50, level: 'middle', items: [] },
    },
    flags: {
      low_attention: attention.score < 40,
      low_working_memory: false,
      slow_processing: false,
      low_motivation: motivation_emotion.score < 40,
      fragile_emotion: false,
      weak_study_habit: study_habits.score < 40,
    },
  }
}

// =============================================
// v2 学習タイプ分類
// =============================================

/** タイプ別のメタ情報 */
const TYPE_META: Record<LearningType, { label: string; description: string }> = {
  visual: {
    label: '見てわかるタイプ',
    description:
      '視覚的な情報（図・絵・文字）を通じて理解しやすい傾向があります。板書を写すことや、図解・動画を使った学習が合いやすいと考えられます。',
  },
  auditory: {
    label: '聞いてわかるタイプ',
    description:
      '口頭の説明や音声を通じて理解しやすい傾向があります。声に出して読む・親が読み上げる・説明を聞く、といったアプローチが合いやすいと考えられます。',
  },
  kinesthetic: {
    label: '体験してわかるタイプ',
    description:
      '実際にやってみることで理解が進みやすい傾向があります。手を動かす作業・ゲーム感覚の練習・体を使った学習が合いやすいと考えられます。',
  },
  reflective: {
    label: 'じっくり考えるタイプ',
    description:
      '時間をかけて丁寧に考えることで理解を深めやすい傾向があります。急かさず・ステップを明確にした学習環境が合いやすいと考えられます。',
  },
  intuitive: {
    label: 'ひらめきタイプ',
    description:
      '全体像をつかむのが早く、直感的に理解しやすい傾向があります。パターンを見つけたり、応用問題に挑戦したりする場面で力を発揮しやすいと考えられます。',
  },
  systematic: {
    label: '順序立てるタイプ',
    description:
      '手順やルールを覚えることで安定して取り組める傾向があります。チェックリストや決まった学習ルーティンが合いやすいと考えられます。',
  },
}

const MODALITY_NOTE =
  '※ このタイプ判定は保護者の観察回答に基づく行動傾向の参考情報です。医学的・心理学的な診断ではありません。また、学習スタイルの分類は一つの見方にすぎず、お子さんは複数のスタイルを持つ場合がほとんどです。家庭での手立ての参考としてお使いください。'

/**
 * 6タイプ学習スタイルを判定する
 * ルールベースの重み付きポイントシステム
 */
function determineLearningType(answersJson: AnswersJson): LearningType {
  const d = answersJson.domains
  const r = answersJson.raw_scores

  const points: Record<LearningType, number> = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reflective: 0,
    intuitive: 0,
    systematic: 0,
  }

  // ── 視覚型シグナル ──
  if (r.Q19 === 3) points.visual += 3  // 視覚情報で理解しやすい
  if (r.Q19 === 2) points.visual += 1
  if (d.sensory.level === 'high') points.visual += 2
  if (d.kanji_literacy.level !== 'low') points.visual += 1  // 文字情報も得意

  // ── 聴覚型シグナル ──
  if (r.Q18 >= 2) points.auditory += 2  // 音への過敏性が低い = 聴覚チャンネルが使いやすい
  if (r.Q6 >= 2) points.auditory += 2  // 説明を聞いて理解できる
  if (r.Q2 >= 2) points.auditory += 1  // 授業での聴取が安定

  // ── 体験型シグナル ──
  if (r.Q19 <= 2) points.kinesthetic += 1  // 視覚優位ではない
  if (r.Q8 >= 2) points.kinesthetic += 2   // 作業・実践スピードが良い
  if (d.working_memory.level === 'low') points.kinesthetic += 1  // 手順記憶より体験が合う
  if (d.study_habits.level !== 'low') points.kinesthetic += 1

  // ── 熟慮型シグナル ──
  if (d.processing_speed.level === 'low') points.reflective += 3  // ゆっくり処理する
  if (d.working_memory.level !== 'low') points.reflective += 2    // 深く考える力はある
  if (d.motivation_emotion.level !== 'low') points.reflective += 1

  // ── 直感型シグナル ──
  if (d.processing_speed.level === 'high') points.intuitive += 3  // 素早い理解
  if (d.attention.level !== 'low') points.intuitive += 2          // 集中力がある
  if (d.motivation_emotion.level === 'high') points.intuitive += 1

  // ── 構造型シグナル ──
  if (d.working_memory.level === 'high') points.systematic += 3  // 手順記憶が強い
  if (d.study_habits.level !== 'low') points.systematic += 2     // 習慣化できる
  if ((r.Q4 as number) >= 2) points.systematic += 1              // 手順の多い課題もこなせる
  if (r.Q20 >= 2) points.systematic += 1                         // 生活リズムが整っている

  // 最高ポイントのタイプを返す
  const sorted = (Object.entries(points) as [LearningType, number][]).sort(
    ([, a], [, b]) => b - a
  )
  return sorted[0][0]
}

/**
 * サブタグ（補足特性）を判定する
 */
function determineSubTags(answersJson: AnswersJson): SubTag[] {
  const d = answersJson.domains
  const r = answersJson.raw_scores
  const f = answersJson.flags

  const tags: SubTag[] = []

  if (d.attention.level === 'low') tags.push('needs_attention_support')
  if (d.working_memory.level === 'high') tags.push('strong_working_memory')
  if (d.motivation_emotion.level === 'low' || f.fragile_emotion) tags.push('needs_emotional_support')
  if ((r.Q19 as number) === 3) tags.push('visual_strength')
  if ((r.Q18 as number) === 1) tags.push('sound_sensitive')
  if (d.math_calculation.level === 'high') tags.push('math_strength')
  if (d.kanji_literacy.level === 'high') tags.push('language_strength')
  if (r.Q20 === 1) tags.push('needs_routine_support')
  if ((r.Q3 as number) === 3) tags.push('self_starter')
  if (d.motivation_emotion.level === 'high') tags.push('emotionally_resilient')

  return tags
}

/**
 * v2 学習プロファイル分類のエントリーポイント
 * ベーシック診断の AnswersJson から LearningTypeResult を生成する
 */
export function classifyLearningProfile(answersJson: AnswersJson): LearningTypeResult {
  const primary_type = determineLearningType(answersJson)
  const sub_tags = determineSubTags(answersJson)
  const meta = TYPE_META[primary_type]

  return {
    primary_type,
    type_label: meta.label,
    type_description: meta.description,
    sub_tags,
    modality_note: MODALITY_NOTE,
  }
}
