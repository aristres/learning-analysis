import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { PlanJson, DomainKey, StrategySelection } from '@/types'
import DailyLogButton from '@/components/DailyLogButton'

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
// 進捗に応じた励ましメッセージ
// =============================================

function getEncouragement(dayNumber: number): { message: string; emoji: string } {
  if (dayNumber <= 3)  return { emoji: '🌱', message: 'スタートです！最初の3日が一番大事。一緒に頑張りましょう。' }
  if (dayNumber <= 7)  return { emoji: '🌿', message: '1週間に近づいています。この調子で続けていきましょう！' }
  if (dayNumber <= 14) return { emoji: '✨', message: '1週間達成！お子さんのペースをつかんできた頃ですね。' }
  if (dayNumber <= 21) return { emoji: '💪', message: '折り返し地点！ここまで来たら後半も大丈夫です。' }
  if (dayNumber <= 28) return { emoji: '🌟', message: 'もう少しでゴールです！最後まで一緒に走り切りましょう。' }
  return { emoji: '🎉', message: '30日プラン達成おめでとうございます！素晴らしい取り組みでした。' }
}

// =============================================
// 調整ルールをやさしい言葉で表示
// =============================================

function AdjustmentTip({ trigger, action }: { trigger: string; action: string }) {
  // 技術的な変数参照（Q2, Q3 など）を除去して読みやすくする
  const cleanTrigger = trigger
    .replace(/\(Q\d+\)/g, '')
    .replace(/週平均が\d+(\.\d+)?以下/g, 'が低い日が続いた')
    .replace(/週\d+回以上/g, 'が週に何度も続いた')
    .replace(/\d+日連続で/g, '何日も続けて')
    .replace(/\d+週連続で/g, '数週間続けて')
    .replace(/\d+%以上/g, '多くできた')

  const cleanAction = action
    .replace(/メッセージを表示/g, '声をかけてあげましょう')
    .replace(/提案/g, 'お知らせします')
    .replace(/候補を提示/g, 'をご提案します')
    .replace(/手立てを追加/g, '方法を追加で')

  return (
    <div className="bg-white rounded-xl p-4 border border-amber-100">
      <p className="text-sm text-gray-700">
        <span className="font-medium text-amber-700">もし</span>
        {cleanTrigger}場合は、
      </p>
      <p className="text-sm text-gray-600 mt-1 pl-3 border-l-2 border-amber-300">
        {cleanAction}
      </p>
    </div>
  )
}

// =============================================
// 手立てカード
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
    .select('*, children(id, name, grade)')
    .eq('id', planId)
    .eq('parent_id', user.id)
    .single()

  if (!plan) redirect('/parent/dashboard')

  const planJson = plan.plan_json as PlanJson | null
  const child = plan.children as { id: string; name: string; grade: string } | null
  const childName = child?.name ?? ''
  const grade = child?.grade ?? ''
  const childId = child?.id ?? ''

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

  // 進捗計算
  const startDate = new Date(plan.start_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  startDate.setHours(0, 0, 0, 0)
  const dayNumber = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const totalDays = 30
  const progressPercent = Math.min(100, Math.round((dayNumber / totalDays) * 100))
  const weekNumber = Math.min(4, Math.ceil(dayNumber / 7))
  const currentWeek = planJson.weeks?.find(w => w.week === weekNumber)
  const encouragement = getEncouragement(dayNumber)

  const totalStrategies =
    (planJson.continued_strategies?.length ?? 0) +
    (planJson.new_strategies?.length ?? 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ナビ */}
        <div className="flex items-center justify-between">
          <Link href="/parent/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ← ダッシュボード
          </Link>
          <p className="text-sm text-gray-500">{childName}さん（{grade}）</p>
        </div>

        {/* 進捗バナー */}
        <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/70 text-sm">30日プラン</p>
              <p className="text-2xl font-bold">{dayNumber}日目 <span className="text-base font-normal text-white/70">/ 30日</span></p>
            </div>
            <div className="text-4xl">{encouragement.emoji}</div>
          </div>
          {/* プログレスバー */}
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
            <div
              className="bg-white rounded-full h-2.5 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-white/90">{encouragement.message}</p>
        </div>

        {/* 今日のタスク */}
        {currentWeek && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F7941D]/20">
            <h2 className="font-bold text-[#1B2A4A] mb-1 flex items-center gap-2">
              📅 今週のテーマ
            </h2>
            <p className="text-[#F7941D] text-sm mb-4">{currentWeek.theme}</p>
            <div className="space-y-3">
              {currentWeek.daily_tasks?.map((task, i) => {
                const emoji = CATEGORY_EMOJI[task.category] ?? '📌'
                return (
                  <div key={i} className="flex items-start gap-3 bg-[#FFF8F0] rounded-xl p-3">
                    <span className="text-xl mt-0.5">{emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task.task}</p>
                      <p className="text-xs text-gray-400 mt-0.5">目安 {task.duration_minutes}分</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {currentWeek.success_criteria && (
              <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                <span>✓</span> 今週の目標：{currentWeek.success_criteria}
              </p>
            )}
          </div>
        )}

        {/* 今日のログ記録 */}
        {childId && (
          <DailyLogButton planId={planId} childId={childId} />
        )}

        {/* 手立て概要 */}
        <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] text-white rounded-2xl p-5">
          <h2 className="text-base font-bold mb-1">{planJson.month}ヶ月目のプラン概要</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-4">{planJson.overview}</p>
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
              <p className="text-2xl font-bold text-[#90CAF9]">
                {planJson.new_strategies?.length ?? 0}
              </p>
              <p className="text-xs text-white/60">新規</p>
            </div>
          </div>
        </div>

        {/* 重点領域 */}
        {(planJson.child_profile?.low_domains?.length > 0 || planJson.child_profile?.improving_domains?.length > 0) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-400 rounded-full" />
              重点サポート領域
            </h3>
            <div className="flex flex-wrap gap-2">
              {planJson.child_profile?.low_domains?.map((d) => (
                <span key={d} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                  {DOMAIN_LABELS[d]}（のびしろ）
                </span>
              ))}
              {planJson.child_profile?.improving_domains?.map((d) => (
                <span key={d} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                  {DOMAIN_LABELS[d]}（改善中）
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 継続手立て */}
        {planJson.continued_strategies && planJson.continued_strategies.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4">🔄 続けてほしい取り組み</h3>
            <div className="space-y-3">
              {planJson.continued_strategies.map((s) => (
                <StrategyCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        )}

        {/* 新規手立て */}
        {planJson.new_strategies && planJson.new_strategies.length > 0 && (
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4">✨ 今月試してほしい手立て</h3>
            <div className="space-y-3">
              {planJson.new_strategies.map((s) => (
                <StrategyCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        )}

        {/* 週別メニュー */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-[#1B2A4A] mb-4">📅 4週間のスケジュール</h3>
          <div className="space-y-5">
            {planJson.weeks?.map((week) => (
              <div
                key={week.week}
                className={`border rounded-xl p-5 ${week.week === weekNumber ? 'border-[#F7941D] bg-[#FFF8F0]' : ''}`}
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-bold text-[#1B2A4A]">
                    Week {week.week}
                    {week.week === weekNumber && (
                      <span className="ml-2 text-xs bg-[#F7941D] text-white px-2 py-0.5 rounded-full">今週</span>
                    )}
                  </span>
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
                  <p className="text-xs text-[#43A047] mt-3">✓ 目標：{week.success_criteria}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* やさしい調整アドバイス */}
        {planJson.adjustment_rules && planJson.adjustment_rules.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-1">💬 こんなときのアドバイス</h3>
            <p className="text-xs text-gray-500 mb-4">
              お子さんの様子に合わせて、対応方法を参考にしてください。
            </p>
            <div className="space-y-3">
              {planJson.adjustment_rules.map((rule, i) => (
                <AdjustmentTip key={i} trigger={rule.trigger} action={rule.action} />
              ))}
            </div>
          </div>
        )}

        {/* 卒業した手立て */}
        {planJson.retired_strategies && planJson.retired_strategies.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#1B2A4A] mb-4">🎓 達成した取り組み</h3>
            <ul className="space-y-2">
              {planJson.retired_strategies.map((s) => (
                <li key={s.id} className="text-gray-500 text-sm">
                  • {s.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* フッター */}
        <div className="text-center py-4">
          <Link href="/parent/dashboard" className="text-[#F7941D] text-sm hover:underline">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
