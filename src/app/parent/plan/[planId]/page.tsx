import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { PlanJson, DomainKey, StrategySelection } from '@/types'

// =============================================
// ドメインラベル・絵文字
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

const CATEGORY_EMOJI: Record<string, string> = {
  kanji: '✏️',
  math: '🔢',
  attention: '🎯',
  working_memory: '🧩',
  processing_speed: '⚡',
  motivation_emotion: '💪',
  study_habits: '📚',
  sensory: '👁️',
}

// =============================================
// StrategyCard コンポーネント
// =============================================

function StrategyCard({ s }: { s: StrategySelection }) {
  const parts = s.id.split('_')
  const category = parts[0]
  const emoji = CATEGORY_EMOJI[category] ?? '📌'

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-bold text-gray-800">{s.label}</p>
          <p className="text-sm text-gray-500 mt-1">{s.description}</p>
          <p className="text-xs text-[#F7941D] mt-2">💡 {s.reason}</p>
        </div>
      </div>
    </div>
  )
}

// =============================================
// メインページ（Server Component）
// =============================================

export default async function PlanPage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('plans')
    .select('*, children(name, grade)')
    .eq('id', planId)
    .eq('parent_id', user.id)
    .single()

  if (!plan) redirect('/parent/dashboard')

  const planJson = plan.plan_json as PlanJson | null
  const child = plan.children as { name: string; grade: string } | null
  const childName = child?.name ?? ''
  const grade = child?.grade ?? ''

  // plan_json がまだ生成されていない場合
  if (!planJson) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-2">プランを準備中です</h1>
          <p className="text-gray-500 text-sm mb-6">
            決済が完了しました。プランの生成には少し時間がかかる場合があります。
            しばらくしてからページを再読み込みしてください。
          </p>
          <a
            href={`/parent/plan/${planId}`}
            className="inline-block px-6 py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] transition mb-4"
          >
            再読み込み
          </a>
          <br />
          <a href="/parent/dashboard" className="text-sm text-gray-400 hover:underline">
            ダッシュボードに戻る
          </a>
        </div>
      </div>
    )
  }

  const totalStrategies =
    (planJson.continued_strategies?.length ?? 0) +
    (planJson.new_strategies?.length ?? 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">30日プラン</h1>
          <p className="text-gray-500 mt-1">
            {childName}さん（{grade}）のパーソナライズプラン
          </p>
        </div>

        {/* Overview Card */}
        <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] text-white rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">
            {planJson.month}ヶ月目のプラン
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            {planJson.overview}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl py-3 text-center">
              <p className="text-2xl font-bold">{totalStrategies}</p>
              <p className="text-xs text-white/60">手立て数</p>
            </div>
            <div className="bg-white/10 rounded-xl py-3 text-center">
              <p className="text-2xl font-bold text-[#43A047]">
                {planJson.continued_strategies?.length ?? 0}
              </p>
              <p className="text-xs text-white/60">継続</p>
            </div>
            <div className="bg-white/10 rounded-xl py-3 text-center">
              <p className="text-2xl font-bold text-[#2196F3]">
                {planJson.new_strategies?.length ?? 0}
              </p>
              <p className="text-xs text-white/60">新規</p>
            </div>
          </div>
        </div>

        {/* Focus Domains */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-400 rounded-full" />
            重点サポート領域
          </h3>
          <div className="flex flex-wrap gap-2">
            {planJson.child_profile?.low_domains?.map((d) => (
              <span
                key={d}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm"
              >
                {DOMAIN_LABELS[d]}（のびしろ）
              </span>
            ))}
            {planJson.child_profile?.improving_domains?.map((d) => (
              <span
                key={d}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
              >
                {DOMAIN_LABELS[d]}（改善中）
              </span>
            ))}
          </div>
        </div>

        {/* Continued Strategies */}
        {planJson.continued_strategies && planJson.continued_strategies.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
              🔄 継続する手立て
            </h3>
            <div className="space-y-3">
              {planJson.continued_strategies.map((s) => (
                <StrategyCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        )}

        {/* New Strategies */}
        {planJson.new_strategies && planJson.new_strategies.length > 0 && (
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
              ✨ 今月の手立て
            </h3>
            <div className="space-y-3">
              {planJson.new_strategies.map((s) => (
                <StrategyCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        )}

        {/* Retired Strategies */}
        {planJson.retired_strategies && planJson.retired_strategies.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
              🎓 卒業した手立て
            </h3>
            <ul className="space-y-2">
              {planJson.retired_strategies.map((s) => (
                <li key={s.id} className="text-gray-500 text-sm">
                  • 「{s.id}」{s.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weekly Menu */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            📅 週別メニュー
          </h3>
          <div className="space-y-6">
            {planJson.weeks?.map((week) => (
              <div key={week.week} className="border rounded-xl p-5">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-bold text-[#1B2A4A]">Week {week.week}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm text-gray-500">{week.theme}</span>
                </div>
                <div className="space-y-2">
                  {week.daily_tasks?.map((task, i) => {
                    const emoji = CATEGORY_EMOJI[task.category] ?? '📌'
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span>{emoji}</span>
                        <div>
                          <p className="text-sm text-gray-700">{task.task}</p>
                          <p className="text-xs text-gray-400">目安 {task.duration_minutes}分</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {week.success_criteria && (
                  <p className="text-xs text-[#43A047] mt-3">
                    ✓ 成功基準: {week.success_criteria}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Adjustment Rules */}
        {planJson.adjustment_rules && planJson.adjustment_rules.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-2 flex items-center gap-2">
              ⚙️ 自動調整ルール
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              日次ログのデータに基づいてプランを自動で調整します
            </p>
            <div className="space-y-3">
              {planJson.adjustment_rules.map((rule, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-amber-200">
                  <p className="font-medium text-sm text-[#1B2A4A]">
                    IF {rule.trigger}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    → {rule.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center py-4 flex justify-center gap-6 text-sm">
          <Link href="/parent/dashboard" className="text-[#F7941D] hover:underline">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
