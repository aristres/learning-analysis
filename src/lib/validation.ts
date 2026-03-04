import { z } from 'zod'

// =============================================
// 無料診断
// =============================================

export const FreeAssessmentSchema = z.object({
  childId: z.string().optional(),
  grade: z.string().min(1, '学年は必須です'),
  rawAnswers: z.object({
    Q1: z.number().min(1).max(3),
    Q2: z.array(z.string()),
    Q3: z.number().min(1).max(3),
    Q4: z.number().min(1).max(3),
    Q5: z.number().min(1).max(3),
    Q6: z.number().min(1).max(3),
    Q7: z.number().min(1).max(3),
    Q8: z.array(z.string()),
  }),
})

// =============================================
// ベーシック診断
// =============================================

export const BasicAssessmentSchema = z.object({
  assessmentId: z.string().optional(),
  childId: z.string().min(1, '子どもIDは必須です'),
  grade: z.string().min(1, '学年は必須です'),
  rawAnswers: z.record(z.string(), z.union([
    z.number(),
    z.string(),
    z.array(z.string()),
    z.object({ good: z.array(z.string()), weak: z.array(z.string()) }),
  ])),
})

// =============================================
// チェックアウト
// =============================================

export const CheckoutSchema = z.object({
  productType: z.enum(['basic_assessment', 'plan_30day', 'monthly']),
  childId: z.string().min(1),
  assessmentId: z.string().optional(),
})

// =============================================
// 日次ログ
// =============================================

export const DailyLogSchema = z.object({
  childId: z.string().min(1),
  planId: z.string().optional(),
  answers: z.object({
    Q1: z.string(),
    Q2: z.number().min(1).max(3),
    Q3: z.number().min(1).max(3),
    Q4: z.number().min(1).max(3),
    Q5: z.string(),
    Q6: z.string(),
    Q7: z.number().min(1).max(3),
    Q8: z.number().min(1).max(3),
    Q9: z.number().min(1).max(3),
    Q10: z.string(),
  }),
})

// =============================================
// プラン生成
// =============================================

export const PlanGenerationSchema = z.object({
  childId: z.string().min(1, '子どもIDは必須です'),
  assessmentId: z.string().min(1, '診断IDは必須です'),
})

// =============================================
// バリデーションヘルパー
// =============================================

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const messages = result.error.issues.map((i) => i.message).join(', ')
  return { success: false, error: messages }
}
