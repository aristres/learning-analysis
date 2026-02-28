import type {
  AnswersJson,
  DomainKey,
  LearningStyle,
  PlanJson,
  StrategySelection,
  WeekPlan,
  DailyTask,
  AdjustmentRule,
  DomainScore,
} from '@/types'
import {
  ALL_STRATEGIES,
  getStrategiesByDomain,
  getStrategyById,
} from './strategies'

// =============================================
// プラン生成の入力型
// =============================================

export interface PlanGeneratorInput {
  /** 診断結果のドメインスコア */
  domains: AnswersJson['domains']
  /** 学習スタイル（視覚/聴覚/体感覚） */
  learningStyle: LearningStyle
  /** 何ヶ月目のプランか（1=初回） */
  month: number
  /** 前月で効果があった手立てID */
  effectiveStrategyIds: string[]
  /** 前月で効果がなかった手立てID */
  ineffectiveStrategyIds: string[]
  /** 前月使用した全手立てID */
  previousStrategyIds: string[]
  /** お子さんの名前 */
  childName: string
}

// =============================================
// ドメインラベル
// =============================================

const DOMAIN_LABELS: Record<DomainKey, string> = {
  attention: '集中のしやすさ',
  working_memory: '手順の記憶',
  processing_speed: '作業スピード',
  motivation_emotion: 'やる気・気持ち',
  study_habits: '学習習慣',
  sensory: '感覚の特徴',
  math_calculation: '算数・計算',
  kanji_literacy: '国語・漢字',
}

const DOMAIN_FOCUS_THEMES: Record<DomainKey, string> = {
  kanji_literacy: '漢字の土台づくり',
  math_calculation: '計算をラクにする仕組み',
  study_habits: '学習習慣の立ち上げ',
  working_memory: '手順をスムーズに覚える',
  attention: '集中しやすい環境づくり',
  motivation_emotion: 'やる気スイッチ作戦',
  processing_speed: '自分のペースをつかむ',
  sensory: '自分に合うやり方を見つける',
}

// =============================================
// メイン: プラン生成関数
// =============================================

export function generatePlan(input: PlanGeneratorInput): PlanJson {
  const {
    domains,
    learningStyle,
    month,
    effectiveStrategyIds,
    ineffectiveStrategyIds,
    previousStrategyIds,
    childName,
  } = input

  // 1. ドメインをスコア昇順にソート（低い=要サポート順）
  const sortedDomains = rankDomains(domains)

  // 2. low / improving ドメインを特定
  const lowDomains = sortedDomains
    .filter(d => d.level === 'low')
    .map(d => d.key)
  const improvingDomains = sortedDomains
    .filter(d => d.level === 'middle' && d.score < 60)
    .map(d => d.key)

  // 3. 難易度上限を決定
  const maxDifficulty = getMaxDifficulty(month)

  // 4. 継続する手立てを選出（前月の効果的な手立て）
  const continued = selectContinuedStrategies(effectiveStrategyIds, maxDifficulty)

  // 5. 卒業する手立てを決定
  const retired = selectRetiredStrategies(
    previousStrategyIds,
    effectiveStrategyIds,
    ineffectiveStrategyIds,
    month
  )
  const retiredIds = retired.map(r => r.id)

  // 6. 新しい手立てを選出
  const continuedIds = continued.map(s => s.id)
  const excludeIds = [...continuedIds, ...retiredIds, ...ineffectiveStrategyIds]
  const newStrategies = selectNewStrategies(
    sortedDomains,
    learningStyle,
    maxDifficulty,
    previousStrategyIds,
    excludeIds,
    6 - continued.length // 合計6個になるように
  )

  // 7. 週別プランを生成
  const allSelected = [...continued, ...newStrategies]
  const weeks = generateWeeks(sortedDomains, allSelected, month)

  // 8. 調整ルールを生成
  const adjustmentRules = generateAdjustmentRules()

  // 9. 概要文を生成
  const overview = generateOverview(childName, month, lowDomains, continued, newStrategies)

  return {
    overview,
    month,
    child_profile: {
      learning_style: learningStyle,
      low_domains: lowDomains,
      improving_domains: improvingDomains,
    },
    continued_strategies: continued,
    new_strategies: newStrategies,
    retired_strategies: retired,
    weeks,
    adjustment_rules: adjustmentRules,
  }
}

// =============================================
// 内部関数
// =============================================

interface RankedDomain {
  key: DomainKey
  score: number
  level: DomainScore['level']
}

/** ドメインをスコア昇順にソート */
function rankDomains(domains: AnswersJson['domains']): RankedDomain[] {
  return (Object.entries(domains) as [DomainKey, DomainScore][])
    .map(([key, val]) => ({ key, score: val.score, level: val.level }))
    .sort((a, b) => a.score - b.score)
}

/** 月に応じた難易度上限 */
function getMaxDifficulty(month: number): 1 | 2 | 3 {
  if (month <= 1) return 1
  if (month <= 3) return 2
  return 3
}

/** 前月の効果的な手立てから継続分を選出 */
function selectContinuedStrategies(
  effectiveIds: string[],
  maxDifficulty: 1 | 2 | 3
): StrategySelection[] {
  const results: StrategySelection[] = []

  for (const id of effectiveIds) {
    const s = getStrategyById(id)
    if (!s) continue

    // next_step があればそちらを継続候補にする（レベルアップ）
    if (s.next_step) {
      const next = getStrategyById(s.next_step)
      if (next && next.difficulty <= maxDifficulty) {
        results.push({
          id: next.id,
          label: next.label,
          description: next.description,
          reason: `「${s.label}」が効果的だったため、次のステップへ`,
          measurable_by: next.measurable_by,
        })
        continue
      }
    }

    // next_step がない or 難易度オーバーなら同じ手立てを継続
    results.push({
      id: s.id,
      label: s.label,
      description: s.description,
      reason: '前月に効果があったため継続',
      measurable_by: s.measurable_by,
    })
  }

  return results.slice(0, 3) // 最大3つ
}

/** 卒業する手立てを決定 */
function selectRetiredStrategies(
  previousIds: string[],
  effectiveIds: string[],
  ineffectiveIds: string[],
  month: number,
): { id: string; reason: string }[] {
  if (month <= 1) return []

  const retired: { id: string; reason: string }[] = []

  for (const id of ineffectiveIds) {
    const s = getStrategyById(id)
    if (!s) continue
    retired.push({
      id,
      reason: `「${s.label}」は効果が見られなかったため別の方法に変更`,
    })
  }

  // 前月使っていたが effective にも ineffective にも入っていない → 中立なので卒業候補
  for (const id of previousIds) {
    if (effectiveIds.includes(id) || ineffectiveIds.includes(id)) continue
    // 2ヶ月以上使っている場合のみ卒業（1ヶ月目は判断しない）
    if (month >= 3) {
      const s = getStrategyById(id)
      if (!s) continue
      retired.push({
        id,
        reason: `「${s.label}」は定着したと判断し、新しい手立てに入れ替え`,
      })
    }
  }

  return retired
}

/** 新しい手立てを選出 */
function selectNewStrategies(
  sortedDomains: RankedDomain[],
  learningStyle: LearningStyle,
  maxDifficulty: 1 | 2 | 3,
  previousIds: string[],
  excludeIds: string[],
  targetCount: number,
): StrategySelection[] {
  const results: StrategySelection[] = []
  const usedIds = new Set(excludeIds)

  // 低スコアのドメインから順に手立てを選ぶ
  for (const domain of sortedDomains) {
    if (results.length >= targetCount) break
    if (domain.level === 'high') continue // high はスキップ

    const candidates = getStrategiesByDomain(domain.key)
      .filter(s => !usedIds.has(s.id))
      .filter(s => s.difficulty <= maxDifficulty)
      .filter(s => s.prerequisite === null || previousIds.includes(s.prerequisite))
      // 学習スタイルに合うもの優先 (合致 or スタイル指定なし)
      .sort((a, b) => {
        const aMatch = a.learning_style.length === 0 || a.learning_style.includes(learningStyle) ? 0 : 1
        const bMatch = b.learning_style.length === 0 || b.learning_style.includes(learningStyle) ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
        return a.difficulty - b.difficulty
      })

    if (candidates.length > 0) {
      const picked = candidates[0]
      usedIds.add(picked.id)
      results.push({
        id: picked.id,
        label: picked.label,
        description: picked.description,
        reason: `${DOMAIN_LABELS[domain.key]}のスコアが${domain.score}点（${domain.level === 'low' ? '要サポート' : '改善中'}）のため`,
        measurable_by: picked.measurable_by,
      })
    }
  }

  // まだ足りなければ、モチベーション系・習慣系から補充
  if (results.length < targetCount) {
    const fillers = ALL_STRATEGIES
      .filter(s => ['motivation_emotion', 'study_habits'].includes(s.category))
      .filter(s => !usedIds.has(s.id))
      .filter(s => s.difficulty <= maxDifficulty)
      .filter(s => s.prerequisite === null || previousIds.includes(s.prerequisite))
      .slice(0, targetCount - results.length)

    for (const s of fillers) {
      usedIds.add(s.id)
      results.push({
        id: s.id,
        label: s.label,
        description: s.description,
        reason: '学習全般のサポートとして追加',
        measurable_by: s.measurable_by,
      })
    }
  }

  return results
}

/** 4週間のプランを生成 */
function generateWeeks(
  sortedDomains: RankedDomain[],
  allStrategies: StrategySelection[],
  month: number,
): WeekPlan[] {
  // 重点ドメインを4つ決定（低い順、足りなければ middle を使う）
  const focusDomains: DomainKey[] = []
  for (const d of sortedDomains) {
    if (focusDomains.length >= 4) break
    if (d.level !== 'high') focusDomains.push(d.key)
  }
  // 4つ未満ならpadding
  while (focusDomains.length < 4) {
    const next = sortedDomains.find(d => !focusDomains.includes(d.key))
    if (next) focusDomains.push(next.key)
    else break
  }

  // Week4 は常に「振り返り＋定着」
  const weekFocuses: DomainKey[] = [
    focusDomains[0],
    focusDomains[1] ?? focusDomains[0],
    focusDomains[0], // Week3は1番苦手に戻る（組み合わせ練習）
    focusDomains[0], // Week4は振り返り
  ]

  const weeks: WeekPlan[] = weekFocuses.map((focus, i) => {
    const weekNum = i + 1
    const isReviewWeek = weekNum === 4

    // この週のドメインに関連する手立てを選ぶ
    const weekStrategies = allStrategies.filter(s => {
      const master = getStrategyById(s.id)
      if (!master) return false
      if (isReviewWeek) return true // Week4は全て
      return master.target_domains.includes(focus)
    })

    // 足りなければ全体から
    const strategies = weekStrategies.length >= 2
      ? weekStrategies.slice(0, 3)
      : allStrategies.slice(0, 3)

    const dailyTasks: DailyTask[] = strategies.map(s => {
      const master = getStrategyById(s.id)
      return {
        category: master?.category ?? 'study_habits',
        strategy_id: s.id,
        task: s.description,
        duration_minutes: estimateDuration(master?.category),
      }
    })

    const theme = isReviewWeek
      ? `振り返り＋できたことの確認`
      : weekNum === 3
        ? `${DOMAIN_FOCUS_THEMES[weekFocuses[0]]}＋${DOMAIN_FOCUS_THEMES[weekFocuses[1]]}のルーティン化`
        : DOMAIN_FOCUS_THEMES[focus]

    const successCriteria = isReviewWeek
      ? `今月の手立てを5日中4日実行できたらOK`
      : month === 1 && weekNum === 1
        ? `手立てを3日間試してみることが目標（完璧でなくてOK）`
        : `手立てを5日中3日実行できたらOK`

    return {
      week: weekNum,
      theme,
      focus_domain: focus,
      daily_tasks: dailyTasks,
      success_criteria: successCriteria,
    }
  })

  return weeks
}

/** カテゴリに応じた目安時間 */
function estimateDuration(category?: string): number {
  switch (category) {
    case 'kanji': return 10
    case 'math': return 10
    case 'attention': return 5
    case 'working_memory': return 3
    case 'processing_speed': return 5
    case 'motivation_emotion': return 3
    case 'study_habits': return 5
    case 'sensory': return 3
    default: return 5
  }
}

/** 調整ルールを生成 */
function generateAdjustmentRules(): AdjustmentRule[] {
  return [
    {
      trigger: '気分(Q3)が3日連続で「つかれてる」',
      action: '翌日のタスクを2つに減らし「休んでもOK」メッセージを表示',
    },
    {
      trigger: 'やりやすさ(Q2)の週平均が1.5以下',
      action: '現在の手立てが合っていない可能性あり。代替手立てを提案',
    },
    {
      trigger: '勉強開始の気持ち(Q7)が「すぐできた」が週4回以上',
      action: '取りかかりの手立ては定着。次のステップへ進む候補を提示',
    },
    {
      trigger: 'むずかしかった科目(Q6)が同一科目3日連続',
      action: 'その科目に特化した手立てを追加提案',
    },
    {
      trigger: '宿題完了率が2週連続で90%以上',
      action: '難易度を1段階上げた手立てを提案',
    },
  ]
}

/** 概要文を生成 */
function generateOverview(
  childName: string,
  month: number,
  lowDomains: DomainKey[],
  continued: StrategySelection[],
  newStrategies: StrategySelection[],
): string {
  if (month === 1) {
    const focusAreas = lowDomains
      .slice(0, 3)
      .map(d => DOMAIN_LABELS[d])
      .join('・')
    return `${childName}さんの${month}ヶ月目のプランです。${focusAreas}を重点的にサポートする手立てを${newStrategies.length}個選びました。まずは「やってみる」ことが目標です。完璧でなくてOK！`
  }

  const continuedNames = continued.map(s => s.label).join('・')
  const newNames = newStrategies.slice(0, 2).map(s => s.label).join('・')

  return `${childName}さんの${month}ヶ月目のプランです。${continued.length > 0 ? `前月効果のあった「${continuedNames}」を継続し、` : ''}新たに「${newNames}」などを追加しました。`
}
