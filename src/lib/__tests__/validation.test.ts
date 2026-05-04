import { describe, it, expect } from 'vitest'
import {
  FreeAssessmentSchema,
  CheckoutSchema,
  DailyLogSchema,
  PlanGenerationSchema,
  validateInput,
} from '../validation'

describe('FreeAssessmentSchema', () => {
  it('有効なデータを受け入れる', () => {
    const valid = {
      grade: '小3',
      rawAnswers: {
        Q1: 2,
        Q2: ['集中が続かない'],
        Q3: 1,
        Q4: 3,
        Q5: 2,
        Q6: 1,
        Q7: 3,
        Q8: ['算数'],
      },
    }
    const result = FreeAssessmentSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('学年が空の場合はエラー', () => {
    const invalid = {
      grade: '',
      rawAnswers: {
        Q1: 2, Q2: [], Q3: 1, Q4: 3, Q5: 2, Q6: 1, Q7: 3, Q8: [],
      },
    }
    const result = FreeAssessmentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('Q1が範囲外の場合はエラー', () => {
    const invalid = {
      grade: '小1',
      rawAnswers: {
        Q1: 5, Q2: [], Q3: 1, Q4: 3, Q5: 2, Q6: 1, Q7: 3, Q8: [],
      },
    }
    const result = FreeAssessmentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('CheckoutSchema', () => {
  it('有効な商品タイプを受け入れる', () => {
    const valid = {
      productType: 'basic_assessment',
      childId: 'child-123',
    }
    const result = CheckoutSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('無効な商品タイプはエラー', () => {
    const invalid = {
      productType: 'invalid_type',
      childId: 'child-123',
    }
    const result = CheckoutSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('childIdが空の場合はエラー', () => {
    const invalid = {
      productType: 'basic_assessment',
      childId: '',
    }
    const result = CheckoutSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('DailyLogSchema', () => {
  it('有効なデータを受け入れる', () => {
    const valid = {
      childId: 'child-123',
      planId: 'plan-456',
      answers: {
        Q1: '計算',
        Q2: 2,
        Q3: 1,
        Q4: 3,
        Q5: '読む',
        Q6: '書く',
        Q7: 2,
        Q8: 3,
        Q9: 2,
        Q10: '計算',
      },
    }
    const result = DailyLogSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})

describe('PlanGenerationSchema', () => {
  it('有効なデータを受け入れる', () => {
    const valid = {
      childId: 'child-123',
      assessmentId: 'assessment-456',
    }
    const result = PlanGenerationSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('childIdが空の場合はエラー', () => {
    const invalid = {
      childId: '',
      assessmentId: 'assessment-456',
    }
    const result = PlanGenerationSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('validateInput', () => {
  it('成功時にデータを返す', () => {
    const result = validateInput(CheckoutSchema, {
      productType: 'basic_assessment',
      childId: 'child-123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.productType).toBe('basic_assessment')
    }
  })

  it('失敗時にエラーメッセージを返す', () => {
    const result = validateInput(CheckoutSchema, {
      productType: 'invalid',
      childId: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })
})
