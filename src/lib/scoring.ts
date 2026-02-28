import type { AnswersJson, DomainScore, DomainLevel, FreeAnswersRaw } from '@/types'

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
