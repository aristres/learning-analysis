import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { DbAssessment, DbDailyLog, AnswersJson, DomainKey } from '@/types'

// =============================================
// ドメイン定義
// =============================================

const DOMAIN_LABELS: Record<DomainKey, string> = {
  attention:          '集中のしやすさ',
  working_memory:     '手順の記憶',
  processing_speed:   '作業スピード',
  motivation_emotion: 'やる気・気持ち',
  study_habits:       '学習習慣',
  sensory:            '感覚の特徴',
  math_calculation:   '算数・計算',
  kanji_literacy:     '国語・漢字',
}

const DOMAIN_KEYS = Object.keys(DOMAIN_LABELS) as DomainKey[]

// =============================================
// ヘルパー
// =============================================

function scoreColor(score: number) {
  if (score >= 70) return 'bg-green-400'
  if (score >= 40) return 'bg-yellow-400'
  return 'bg-red-400'
}

function deltaLabel(delta: number) {
  if (delta > 5)  return { text: `+${delta}`, color: 'text-green-600', icon: '↑' }
  if (delta < -5) return { text: `${delta}`,  color: 'text-red-500',   icon: '↓' }
  return          { text: '±0',               color: 'text-gray-400',  icon: '→' }
}

function moodEmoji(mood: string | null) {
  if (mood === 'good')   return '😊'
  if (mood === 'tired')  return '😴'
  return '😐'
}

// =============================================
// メインページ
// =============================================

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 子ども情報
  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .single()

  if (!child) redirect('/parent/dashboard')

  // 診断履歴（全件）
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  // 日次ログ（直近30日）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('child_id', childId)
    .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('log_date', { ascending: false })

  const typedAssessments = (assessments ?? []) as DbAssessment[]
  const typedLogs = (logs ?? []) as DbDailyLog[]

  // ドメインスコアの変化（初回 vs 最新）
  const paidAssessments = typedAssessments.filter(a => a.payment_status === 'paid' && a.answers_json)
  const firstA  = paidAssessments[0]
  const latestA = paidAssessments[paidAssessments.length - 1]
  const hasComparison = paidAssessments.length >= 2 && firstA?.id !== latestA?.id

  const firstDomains  = (firstA?.answers_json  as AnswersJson | null)?.domains
  const latestDomains = (latestA?.answers_json as AnswersJson | null)?.domains

  // ログ統計
  const logCount = typedLogs.length
  const moodCounts = { good: 0, normal: 0, tired: 0 }
  typedLogs.forEach(l => {
    if (l.mood === 'good')   moodCounts.good++
    else if (l.mood === 'tired') moodCounts.tired++
    else moodCounts.normal++
  })

  // 連続記録日数（最新から遡る）
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const logDates = new Set(typedLogs.map(l => l.log_date))
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (logDates.has(key)) streak++
    else if (i > 0) break
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Link href="/parent/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ← ダッシュボード
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{child.name}さんの進捗</h1>
          <p className="text-sm text-gray-500 mt-1">{child.grade}</p>
        </div>

        {/* ========== 日次ログの記録状況 ========== */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#1B2A4A] mb-4">📝 学習ログ（直近30日）</h2>

          {logCount === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">まだログが記録されていません</p>
          ) : (
            <>
              {/* サマリー数値 */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#FFF8F0] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#F7941D]">{logCount}</p>
                  <p className="text-xs text-gray-500 mt-1">記録日数</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-500">{streak}</p>
                  <p className="text-xs text-gray-500 mt-1">連続記録日</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {logCount > 0 ? Math.round((moodCounts.good / logCount) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">元気な日の割合</p>
                </div>
              </div>

              {/* 気分の分布 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">気分の傾向</p>
                <div className="flex gap-2">
                  {[
                    { key: 'good',   label: '元気',      color: 'bg-green-400',  count: moodCounts.good },
                    { key: 'normal', label: 'ふつう',    color: 'bg-yellow-400', count: moodCounts.normal },
                    { key: 'tired',  label: 'つかれてる', color: 'bg-red-300',    count: moodCounts.tired },
                  ].map(m => (
                    <div key={m.key} className="flex-1 text-center">
                      <div className="text-lg">{moodEmoji(m.key)}</div>
                      <div
                        className={`${m.color} rounded-full mx-auto mt-1`}
                        style={{
                          height: `${Math.max(4, logCount > 0 ? (m.count / logCount) * 60 : 4)}px`,
                          width: '100%',
                          minHeight: '4px',
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">{m.count}日</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 直近ログ一覧 */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-1">直近の記録</p>
                {typedLogs.slice(0, 7).map(log => (
                  <div key={log.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="text-xl">{moodEmoji(log.mood)}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700">
                        {new Date(log.log_date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                      </p>
                      {(log.answers_json as unknown as Record<string, string> | null)?.Q10 &&
                        (log.answers_json as unknown as Record<string, string>).Q10 !== '—' && (
                        <p className="text-xs text-gray-400 truncate">
                          {(log.answers_json as unknown as Record<string, string>).Q10}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.mood === 'good'  ? 'bg-green-100 text-green-700' :
                      log.mood === 'tired' ? 'bg-red-100 text-red-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {log.mood === 'good' ? '元気' : log.mood === 'tired' ? '疲れ' : 'ふつう'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ========== 学習ドメインの変化 ========== */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#1B2A4A] mb-1">📊 学習特性の変化</h2>

          {!latestDomains ? (
            <p className="text-sm text-gray-400 text-center py-6">
              有料診断を受けるとここにドメインスコアが表示されます
            </p>
          ) : !hasComparison ? (
            <>
              <p className="text-xs text-gray-400 mb-4">
                ※ 2回目の診断を受けると変化が表示されます（現在: 1回目）
              </p>
              <div className="space-y-3">
                {DOMAIN_KEYS.map(key => {
                  const score = latestDomains[key]?.score ?? 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{DOMAIN_LABELS[key]}</span>
                        <span className="font-medium">{score}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${scoreColor(score)} h-2 rounded-full transition-all`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-1">
                初回（{new Date(firstA.created_at).toLocaleDateString('ja-JP')}）
                → 最新（{new Date(latestA.created_at).toLocaleDateString('ja-JP')}）
              </p>
              <div className="space-y-4 mt-4">
                {DOMAIN_KEYS.map(key => {
                  const prev  = firstDomains?.[key]?.score  ?? 0
                  const curr  = latestDomains[key]?.score ?? 0
                  const delta = curr - prev
                  const dl    = deltaLabel(delta)
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{DOMAIN_LABELS[key]}</span>
                        <span className={`font-bold ${dl.color}`}>
                          {dl.icon} {dl.text}　{curr}点
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-full h-3">
                        {/* 前回バー（薄色） */}
                        <div
                          className="absolute top-0 left-0 bg-gray-300 h-3 rounded-full"
                          style={{ width: `${prev}%` }}
                        />
                        {/* 現在バー */}
                        <div
                          className={`absolute top-0 left-0 ${scoreColor(curr)} h-3 rounded-full transition-all opacity-80`}
                          style={{ width: `${curr}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gray-300 rounded inline-block" />初回</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-400 rounded inline-block" />最新</span>
              </div>
            </>
          )}
        </section>

        {/* ========== 診断履歴 ========== */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-[#1B2A4A] mb-4">🗂️ 診断履歴</h2>

          {typedAssessments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">まだ診断を受けていません</p>
          ) : (
            <div className="space-y-2">
              {[...typedAssessments].reverse().map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7941D]/10 flex items-center justify-center text-[#F7941D] font-bold text-sm">
                    {typedAssessments.length - i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {a.type === 'basic' ? 'くわしいチェック' : 'かんたんチェック'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {a.payment_status === 'paid' ? '有料' : '無料'}
                    </span>
                    {a.payment_status === 'paid' && (
                      <Link
                        href={`/parent/report/${a.id}`}
                        className="text-xs text-[#F7941D] hover:underline"
                      >
                        レポート →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Link
              href={`/parent/assessment/basic?childId=${childId}`}
              className="block text-center py-2.5 border-2 border-dashed border-[#F7941D]/40 text-[#F7941D] text-sm rounded-xl hover:bg-[#FFF8F0] transition"
            >
              ＋ 新しく診断する
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
