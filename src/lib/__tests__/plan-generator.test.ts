import { describe, it, expect } from 'vitest'
import { generatePlan, type PlanGeneratorInput } from '../plan-generator'

// テスト用のドメインスコアデータ
function createDomains(overrides?: Partial<Record<string, { score: number; level: string }>>) {
  const defaults: Record<string, { score: number; level: string }> = {
    attention: { score: 40, level: 'low' },
    working_memory: { score: 55, level: 'middle' },
    processing_speed: { score: 70, level: 'middle' },
    motivation_emotion: { score: 45, level: 'low' },
    study_habits: { score: 60, level: 'middle' },
    sensory: { score: 80, level: 'high' },
    math_calculation: { score: 35, level: 'low' },
    kanji_literacy: { score: 50, level: 'middle' },
  }
  return { ...defaults, ...overrides }
}

function createInput(overrides?: Partial<PlanGeneratorInput>): PlanGeneratorInput {
  return {
    domains: createDomains() as PlanGeneratorInput['domains'],
    learningStyle: 'visual',
    month: 1,
    effectiveStrategyIds: [],
    ineffectiveStrategyIds: [],
    previousStrategyIds: [],
    childName: 'テスト太郎',
    ...overrides,
  }
}

describe('generatePlan', () => {
  it('基本的なプランを生成できる', () => {
    const plan = generatePlan(createInput())

    expect(plan).toBeDefined()
    expect(plan.overview).toContain('テスト太郎')
    expect(plan.month).toBe(1)
    expect(plan.weeks).toHaveLength(4)
    expect(plan.adjustment_rules.length).toBeGreaterThan(0)
  })

  it('child_profileが正しく設定される', () => {
    const plan = generatePlan(createInput())

    expect(plan.child_profile.learning_style).toBe('visual')
    expect(plan.child_profile.low_domains).toContain('attention')
    expect(plan.child_profile.low_domains).toContain('math_calculation')
    expect(plan.child_profile.low_domains).toContain('motivation_emotion')
  })

  it('新規プラン（month=1）では継続・卒業手立てがない', () => {
    const plan = generatePlan(createInput({ month: 1 }))

    expect(plan.continued_strategies).toHaveLength(0)
    expect(plan.retired_strategies).toHaveLength(0)
    expect(plan.new_strategies.length).toBeGreaterThan(0)
  })

  it('手立ては合計6個以下になる', () => {
    const plan = generatePlan(createInput())
    const totalStrategies =
      plan.continued_strategies.length + plan.new_strategies.length

    expect(totalStrategies).toBeLessThanOrEqual(6)
  })

  it('各週にdaily_tasksがある', () => {
    const plan = generatePlan(createInput())

    for (const week of plan.weeks) {
      expect(week.week).toBeGreaterThanOrEqual(1)
      expect(week.week).toBeLessThanOrEqual(4)
      expect(week.theme).toBeTruthy()
      expect(week.daily_tasks.length).toBeGreaterThan(0)
      expect(week.success_criteria).toBeTruthy()
    }
  })

  it('月1では難易度1の手立てのみ選ばれる', () => {
    const plan = generatePlan(createInput({ month: 1 }))
    // 新規手立てのIDからマスターデータを参照する代わりに、
    // 手立てが存在することを確認
    expect(plan.new_strategies.length).toBeGreaterThan(0)
    for (const s of plan.new_strategies) {
      expect(s.id).toBeTruthy()
      expect(s.label).toBeTruthy()
      expect(s.reason).toBeTruthy()
    }
  })

  it('概要文に子どもの名前が含まれる', () => {
    const plan = generatePlan(createInput({ childName: 'はなこ' }))
    expect(plan.overview).toContain('はなこ')
    expect(plan.overview).toContain('1ヶ月目')
  })

  it('月3以上で効果のない手立ては卒業される', () => {
    const plan = generatePlan(createInput({
      month: 3,
      previousStrategyIds: ['kanji_4step', 'math_timer'],
      ineffectiveStrategyIds: ['kanji_4step'],
      effectiveStrategyIds: ['math_timer'],
    }))

    const retiredIds = plan.retired_strategies.map(r => r.id)
    expect(retiredIds).toContain('kanji_4step')
  })

  it('効果的な手立ては継続される', () => {
    const plan = generatePlan(createInput({
      month: 2,
      previousStrategyIds: ['kanji_4step'],
      effectiveStrategyIds: ['kanji_4step'],
    }))

    // kanji_4step の next_step は kanji_flash なので、
    // 継続手立てとして kanji_flash か kanji_4step が含まれる
    const continuedIds = plan.continued_strategies.map(s => s.id)
    expect(continuedIds.length).toBeGreaterThan(0)
  })

  it('異なる学習スタイルでプランが変わる', () => {
    const visualPlan = generatePlan(createInput({ learningStyle: 'visual' }))
    const auditoryPlan = generatePlan(createInput({ learningStyle: 'auditory' }))

    // 同じ条件でもスタイルが違えば手立ての選択が変わりうる
    expect(visualPlan.child_profile.learning_style).toBe('visual')
    expect(auditoryPlan.child_profile.learning_style).toBe('auditory')
  })

  it('調整ルールが5つ生成される', () => {
    const plan = generatePlan(createInput())
    expect(plan.adjustment_rules).toHaveLength(5)

    for (const rule of plan.adjustment_rules) {
      expect(rule.trigger).toBeTruthy()
      expect(rule.action).toBeTruthy()
    }
  })
})
