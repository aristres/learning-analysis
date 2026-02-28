// =============================================
// ドメイン型定義
// =============================================

export type UserRole = 'parent' | 'child'
export type AssessmentType = 'free' | 'basic'
export type AssessmentStatus = 'in_progress' | 'completed' | 'error'
export type PaymentStatus = 'unpaid' | 'paid' | 'free'
export type PlanType = '30day' | 'monthly'
export type PlanStatus = 'active' | 'paused' | 'completed' | 'cancelled'
export type ProductType = 'basic_assessment' | 'plan_30day' | 'monthly'
export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'past_due' | 'incomplete'
export type DomainLevel = 'low' | 'middle' | 'high'

// DB テーブル型
export interface DbUser {
  id: string
  email: string | null
  role: UserRole
  display_name: string | null
  created_at: string
  updated_at: string
}

export interface DbChild {
  id: string
  parent_id: string
  user_id: string | null
  name: string
  grade: string
  birth_year: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbAssessment {
  id: string
  child_id: string
  parent_id: string
  type: AssessmentType
  status: AssessmentStatus
  payment_status: PaymentStatus
  answers_json: AnswersJson | null
  result_json: AssessmentResult | null
  created_at: string
  completed_at: string | null
}

export interface DbAnswer {
  id: string
  assessment_id: string
  question_key: string
  answer_value: number | string | string[]
  created_at: string
}

export interface DbPlan {
  id: string
  child_id: string
  parent_id: string
  assessment_id: string | null
  type: PlanType
  status: PlanStatus
  plan_json: PlanJson | null
  start_date: string
  end_date: string | null
  created_at: string
}

export interface DbDailyLog {
  id: string
  child_id: string
  plan_id: string | null
  log_date: string
  answers_json: DailyLogAnswers
  mood: 'good' | 'normal' | 'tired' | null
  summary: string | null
  created_at: string
}

export interface DbSubscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_payment_intent_id: string | null
  product_type: ProductType
  status: SubscriptionStatus
  amount: number | null
  currency: string
  child_id: string | null
  assessment_id: string | null
  plan_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

// =============================================
// 診断回答 JSON
// =============================================

export interface DomainScore {
  score: number      // 0〜100
  level: DomainLevel // low/middle/high
  items: string[]
}

export interface AnswersJson {
  grade: string
  raw_scores: {
    Q1: number
    Q2: number
    Q3: number
    Q4: number
    Q5: number
    Q6: number
    Q7: string[] // ['読む', '書く', '聞く', '話す'] から複数選択
    Q8: number
    Q9: number
    Q10: number
    Q11: number
    Q12: number
    Q13: number
    Q14: number
    Q15: number
    Q16: number
    Q17: { good: string[]; weak: string[] }
    Q18: number
    Q19: number
    Q20: number
  }
  domains: {
    attention: DomainScore
    working_memory: DomainScore
    processing_speed: DomainScore
    motivation_emotion: DomainScore
    study_habits: DomainScore
    sensory: DomainScore
    math_calculation: DomainScore
    kanji_literacy: DomainScore
  }
  flags: {
    low_attention: boolean
    low_working_memory: boolean
    slow_processing: boolean
    low_motivation: boolean
    fragile_emotion: boolean
    weak_study_habit: boolean
  }
}

// 無料診断用（Q1〜Q8のみ）
export type FreeAnswersRaw = {
  Q1: number // 集中が続かない: よくある=1, 時々=2, あまりない=3
  Q2: string[] // 覚え方タイプ: 複数選択
  Q3: number // 宿題開始: 自分で=3, 声かけ=2, 渋る=1
  Q4: number // 気が散り: 多い=1, 普通=2, 少ない=3
  Q5: number // 苦手への反応: すぐ嫌=1, 少し=2, 普通=3
  Q6: number // わからない時: 諦める=1, 少し=2, 粘る=3
  Q7: number // 生活リズム: 不規則=1, やや=2, 整=3
  Q8: string[] // 得意スタイル: 複数選択
}

// =============================================
// LLM 出力型
// =============================================

export interface AssessmentResult {
  summary: string
  strengths: string[]
  weaknesses: string[]
  risk_situations: string[]
  home_strategies: string[]
  math_strategies: string[]
  japanese_strategies: string[]
  study_style: {
    type: string
    description: string
  }
}

// =============================================
// 30日プラン
// =============================================

export interface WeekMenu {
  week: number    // 1〜4
  theme: string
  daily_tasks: string[]
}

export interface PlanJson {
  overview: string
  weeks: WeekMenu[]
}

// =============================================
// 子どもUI 日次ログ
// =============================================

export interface DailyLogAnswers {
  Q1: string  // 先にやる宿題
  Q2: number  // やりやすさ 1〜3
  Q3: number  // 気分 1=元気, 2=ふつう, 3=つかれてる → mood変換
  Q4: number  // 学校理解度 1〜3
  Q5: string  // 楽しかった科目
  Q6: string  // むずかしかった科目
  Q7: number  // 勉強開始気持ち 1〜3
  Q8: number  // ていねいさ 1〜3
  Q9: number  // 勉強時間 1〜3
  Q10: string // 明日がんばること
}

// =============================================
// 月次振り返り（成長レポート）
// =============================================

export interface MonthlyReviewAnswers {
  R1: number  // 宿題の取りかかり改善 1〜3
  R2: number  // 手順を覚える力の変化 1〜3
  R3: number  // 算数への取り組み 1〜3
  R4: number  // 漢字への抵抗感 1〜3
  R5: string  // 効果的だった手立て（自由選択）
}

export interface DomainDelta {
  domain: string
  previous_score: number
  current_score: number
  delta: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface WeeklyMetrics {
  week: number
  avg_mood: number
  completion_rate: number
  self_start_count: number
  struggle_subjects: string[]
}

export interface MonthlyReviewJson {
  month: number
  review_answers: MonthlyReviewAnswers
  domain_deltas: DomainDelta[]
  weekly_metrics: WeeklyMetrics[]
  effective_strategies: string[]
  ai_summary: string
}

export interface DbMonthlyReview {
  id: string
  child_id: string
  parent_id: string
  month: number
  review_json: MonthlyReviewJson
  created_at: string
}

// =============================================
// 子ども自己診断（学び発見）
// =============================================

export interface ChildSelfQuestion {
  key: string
  label: string
  emoji: string
  options: { label: string; value: number | string }[]
}

export interface ChildSelfResult {
  learning_type: {
    type: string       // 例: '目で見てわかるタイプ'
    emoji: string
    description: string
  }
  strengths: string[]     // 子ども向けにわかりやすい言葉
  tips: string[]          // 子ども向けの具体的アドバイス
  challenge: string       // 今週のチャレンジ
}

export interface DbChildSelfAssessment {
  id: string
  child_id: string
  answers_json: Record<string, number | string>
  result_json: ChildSelfResult
  created_at: string
}

// =============================================
// API レスポンス型
// =============================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

// Stripe Checkout セッション作成リクエスト
export interface CreateCheckoutRequest {
  productType: ProductType
  childId: string
  assessmentId?: string
}

export interface CreateCheckoutResponse {
  sessionUrl: string
}

// 診断送信リクエスト
export interface SubmitAssessmentRequest {
  childId: string
  type: AssessmentType
  rawAnswers: Record<string, number | string | string[]>
}

// 診断結果レスポンス
export interface AssessmentResultResponse {
  assessmentId: string
  result: AssessmentResult
  answersJson: AnswersJson
}
