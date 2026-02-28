import type { DbChild, DbAssessment, AnswersJson, AssessmentResult, MonthlyReviewJson, ChildSelfResult } from '@/types'

// =============================================
// デモ用モックデータ
// =============================================

export const DEMO_CHILDREN: DbChild[] = [
  {
    id: 'demo-child-1',
    parent_id: 'demo-parent',
    user_id: null,
    name: '太郎',
    grade: '小4',
    birth_year: 2016,
    notes: null,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'demo-child-2',
    parent_id: 'demo-parent',
    user_id: null,
    name: '花子',
    grade: '小2',
    birth_year: 2018,
    notes: null,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
]

export const DEMO_ANSWERS_JSON: AnswersJson = {
  grade: '小4',
  raw_scores: {
    Q1: 2, Q2: 2, Q3: 1, Q4: 1, Q5: 2,
    Q6: 2, Q7: ['読む', '聞く'], Q8: 2, Q9: 1, Q10: 1,
    Q11: 2, Q12: 1, Q13: 2, Q14: 2, Q15: 2,
    Q16: 2,
    Q17: { good: ['算数', '理科'], weak: ['国語'] },
    Q18: 1, Q19: 3, Q20: 2,
  },
  domains: {
    attention:          { score: 45, level: 'middle', items: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] },
    working_memory:     { score: 35, level: 'low',    items: ['Q4', 'Q5', 'Q6', 'Q10'] },
    processing_speed:   { score: 50, level: 'middle', items: ['Q3', 'Q8', 'Q15'] },
    motivation_emotion: { score: 50, level: 'middle', items: ['Q11', 'Q12', 'Q13'] },
    study_habits:       { score: 38, level: 'low',    items: ['Q3', 'Q14', 'Q15', 'Q20'] },
    sensory:            { score: 75, level: 'high',   items: ['Q18', 'Q19'] },
    math_calculation:   { score: 55, level: 'middle', items: ['Q8', 'Q9', 'Q15'] },
    kanji_literacy:     { score: 35, level: 'low',    items: ['Q6', 'Q9', 'Q16'] },
  },
  flags: {
    low_attention: false,
    low_working_memory: true,
    slow_processing: false,
    low_motivation: false,
    fragile_emotion: false,
    weak_study_habit: true,
  },
}

export const DEMO_RESULT: AssessmentResult = {
  summary:
    '太郎さんは、視覚的な情報を処理する力が特に高く、図や表を使った学習に大きな力を発揮します。一方で、複数の手順を頭の中に保持しながら作業を進めることに課題があり、一度に多くのことを求められると混乱しやすい傾向があります。学習習慣の面では、取りかかりの遅さが見られますが、始めてしまえば一定の集中力を保てるため、始めの一歩をサポートする工夫が効果的です。',
  strengths: [
    '視覚情報（図表・イラスト・動画）を素早く理解し、記憶に残しやすい力がある',
    '興味のある分野（算数・理科）では集中を持続させることができる',
    '一度理解したルールやパターンを別の場面に応用する力がある',
  ],
  weaknesses: [
    '手順が3つ以上ある課題では、途中で何をすべきか忘れやすい',
    '学習の取りかかりに時間がかかり、声かけなしでは始められないことが多い',
    '苦手意識のある教科（国語）では粘り強さが下がりやすい',
  ],
  risk_situations: [
    '板書を写しながら先生の話を聞く場面で、片方に集中すると片方を聞き逃す',
    '長文読解の問題で、文章を読み返す回数が多くなり時間が足りなくなる',
    '複数の提出物がある日に、優先順位がつけられず何も手をつけられない',
  ],
  home_strategies: [
    '宿題は「やることリスト」を付箋3枚に分けて机に貼り、終わったら1枚ずつ剥がす',
    '学習の前に「今日は15分だけ」と短い目標時間を一緒に決め、タイマーを見える位置にセットする',
  ],
  math_strategies: [
    '計算ドリルは1ページを半分に折り、見える量を減らして「5問ずつクリア」方式にする',
    '文章題は問題文の数字と「聞かれていること」を色ペンで囲んでから立式する',
    '九九や暗算は「タイムアタックゲーム」にして、記録更新を楽しむ仕組みにする',
  ],
  japanese_strategies: [
    '漢字は「見る→なぞる→隠して書く→確認」の4ステップを1文字3分のペースで行う',
    '書き取りは大きなマス目のノートを使い、部首ごとに色分けして構造を視覚化する',
    '国語の長文は段落ごとにマーカーで色分けし、「見える形」にしてから取り組む',
  ],
  study_style: {
    type: '視覚優位型',
    description:
      '目で見た情報を効率よく処理できるため、文字だけの説明よりも、図解・フローチャート・色分けを使った教材がもっとも理解を深めやすいスタイルです。',
  },
}

// =============================================
// 成長レポート用モックデータ（3ヶ月分）
// =============================================

export const DEMO_MONTHLY_REVIEWS: MonthlyReviewJson[] = [
  {
    month: 1,
    review_answers: { R1: 2, R2: 1, R3: 2, R4: 1, R5: 'やることリスト付箋' },
    domain_deltas: [
      { domain: 'attention', previous_score: 45, current_score: 48, delta: 3, trend: 'improving' },
      { domain: 'working_memory', previous_score: 35, current_score: 37, delta: 2, trend: 'stable' },
      { domain: 'processing_speed', previous_score: 50, current_score: 52, delta: 2, trend: 'stable' },
      { domain: 'motivation_emotion', previous_score: 50, current_score: 55, delta: 5, trend: 'improving' },
      { domain: 'study_habits', previous_score: 38, current_score: 44, delta: 6, trend: 'improving' },
      { domain: 'sensory', previous_score: 75, current_score: 75, delta: 0, trend: 'stable' },
      { domain: 'math_calculation', previous_score: 55, current_score: 58, delta: 3, trend: 'improving' },
      { domain: 'kanji_literacy', previous_score: 35, current_score: 38, delta: 3, trend: 'improving' },
    ],
    weekly_metrics: [
      { week: 1, avg_mood: 2.1, completion_rate: 60, self_start_count: 1, struggle_subjects: ['国語', '漢字'] },
      { week: 2, avg_mood: 2.3, completion_rate: 65, self_start_count: 2, struggle_subjects: ['漢字'] },
      { week: 3, avg_mood: 2.5, completion_rate: 72, self_start_count: 3, struggle_subjects: ['漢字'] },
      { week: 4, avg_mood: 2.6, completion_rate: 78, self_start_count: 3, struggle_subjects: [] },
    ],
    effective_strategies: ['やることリスト付箋', 'タイマー15分'],
    ai_summary: '1ヶ月目は学習習慣の改善が最も顕著でした。付箋を使ったやることリストが特に効果を発揮し、宿題の完了率が60%から78%に向上しました。漢字への苦手意識はまだ残っていますが、取りかかりの速さは改善しています。',
  },
  {
    month: 2,
    review_answers: { R1: 3, R2: 2, R3: 2, R4: 2, R5: '漢字4ステップ' },
    domain_deltas: [
      { domain: 'attention', previous_score: 48, current_score: 52, delta: 4, trend: 'improving' },
      { domain: 'working_memory', previous_score: 37, current_score: 42, delta: 5, trend: 'improving' },
      { domain: 'processing_speed', previous_score: 52, current_score: 54, delta: 2, trend: 'stable' },
      { domain: 'motivation_emotion', previous_score: 55, current_score: 60, delta: 5, trend: 'improving' },
      { domain: 'study_habits', previous_score: 44, current_score: 52, delta: 8, trend: 'improving' },
      { domain: 'sensory', previous_score: 75, current_score: 76, delta: 1, trend: 'stable' },
      { domain: 'math_calculation', previous_score: 58, current_score: 63, delta: 5, trend: 'improving' },
      { domain: 'kanji_literacy', previous_score: 38, current_score: 45, delta: 7, trend: 'improving' },
    ],
    weekly_metrics: [
      { week: 1, avg_mood: 2.5, completion_rate: 75, self_start_count: 3, struggle_subjects: ['漢字'] },
      { week: 2, avg_mood: 2.7, completion_rate: 80, self_start_count: 4, struggle_subjects: [] },
      { week: 3, avg_mood: 2.6, completion_rate: 82, self_start_count: 4, struggle_subjects: [] },
      { week: 4, avg_mood: 2.8, completion_rate: 85, self_start_count: 5, struggle_subjects: [] },
    ],
    effective_strategies: ['漢字4ステップ', '5問ずつクリア方式', 'タイマー15分'],
    ai_summary: '2ヶ月目は漢字の取り組みに大きな進歩がありました。4ステップ法が定着し、漢字テストの点数が向上しています。学習習慣スコアが52点に到達し「平均的」レベルに改善。自分から宿題を始められる回数も週5回に増えました。',
  },
  {
    month: 3,
    review_answers: { R1: 3, R2: 2, R3: 3, R4: 2, R5: 'タイムアタック計算' },
    domain_deltas: [
      { domain: 'attention', previous_score: 52, current_score: 55, delta: 3, trend: 'improving' },
      { domain: 'working_memory', previous_score: 42, current_score: 46, delta: 4, trend: 'improving' },
      { domain: 'processing_speed', previous_score: 54, current_score: 58, delta: 4, trend: 'improving' },
      { domain: 'motivation_emotion', previous_score: 60, current_score: 65, delta: 5, trend: 'improving' },
      { domain: 'study_habits', previous_score: 52, current_score: 58, delta: 6, trend: 'improving' },
      { domain: 'sensory', previous_score: 76, current_score: 77, delta: 1, trend: 'stable' },
      { domain: 'math_calculation', previous_score: 63, current_score: 70, delta: 7, trend: 'improving' },
      { domain: 'kanji_literacy', previous_score: 45, current_score: 50, delta: 5, trend: 'improving' },
    ],
    weekly_metrics: [
      { week: 1, avg_mood: 2.7, completion_rate: 83, self_start_count: 5, struggle_subjects: [] },
      { week: 2, avg_mood: 2.8, completion_rate: 88, self_start_count: 5, struggle_subjects: [] },
      { week: 3, avg_mood: 2.9, completion_rate: 90, self_start_count: 6, struggle_subjects: [] },
      { week: 4, avg_mood: 3.0, completion_rate: 92, self_start_count: 6, struggle_subjects: [] },
    ],
    effective_strategies: ['タイムアタック計算', '漢字4ステップ', '付箋リスト'],
    ai_summary: '3ヶ月目は算数の伸びが目立ちました。タイムアタック方式が楽しいと感じており、計算スピードが向上。全体的にスコアが改善し、特に「要サポート」だった学習習慣と漢字が「平均的」レベルに到達しました。',
  },
]

// =============================================
// 子ども自己診断デモ結果
// =============================================

export const DEMO_CHILD_SELF_RESULT: ChildSelfResult = {
  learning_type: {
    type: '目で見てわかるタイプ',
    emoji: '👀',
    description: 'きみは、絵や図を見るとすぐにわかるタイプだよ！ノートに色をつけたり、図をかいたりすると、もっとおぼえやすくなるよ。',
  },
  strengths: [
    '絵や図を見て、パッとわかる力がすごい！',
    'すきな教科にはすごく集中できるよ',
    'ルールを覚えたら、ほかのところでも使えるよ',
  ],
  tips: [
    'べんきょうの前に「今日やること」を3つ書き出してみよう',
    'むずかしい漢字は、大きく書いて色をぬってみよう',
    '計算は5問ずつに分けて、タイマーでチャレンジしてみよう',
    'つかれたら5分休けいしてOK！むりしなくていいよ',
  ],
  challenge: '今週は「宿題を始める前に、やることを3つ紙に書く」にチャレンジしてみよう！',
}

export const DEMO_ASSESSMENTS: (DbAssessment & { children: { name: string } })[] = [
  {
    id: 'demo-assessment-1',
    child_id: 'demo-child-1',
    parent_id: 'demo-parent',
    type: 'basic',
    status: 'completed',
    payment_status: 'paid',
    answers_json: DEMO_ANSWERS_JSON,
    result_json: DEMO_RESULT,
    created_at: '2025-02-10T14:30:00Z',
    completed_at: '2025-02-10T14:31:00Z',
    children: { name: '太郎' },
  },
  {
    id: 'demo-assessment-2',
    child_id: 'demo-child-2',
    parent_id: 'demo-parent',
    type: 'free',
    status: 'completed',
    payment_status: 'free',
    answers_json: null,
    result_json: null,
    created_at: '2025-02-05T10:00:00Z',
    completed_at: '2025-02-05T10:01:00Z',
    children: { name: '花子' },
  },
  {
    id: 'demo-assessment-3',
    child_id: 'demo-child-1',
    parent_id: 'demo-parent',
    type: 'free',
    status: 'completed',
    payment_status: 'free',
    answers_json: null,
    result_json: null,
    created_at: '2025-01-20T09:00:00Z',
    completed_at: '2025-01-20T09:01:00Z',
    children: { name: '太郎' },
  },
]
