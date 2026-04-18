'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DEMO_MONTHLY_REVIEWS, DEMO_ANSWERS_JSON } from '@/lib/demo-data'

const DOMAIN_LABELS: Record<string, string> = {
  attention: '集中のしやすさ',
  working_memory: '手順の記憶',
  processing_speed: '作業スピード',
  motivation_emotion: 'やる気・気持ち',
  study_habits: '学習習慣',
  sensory: '感覚の特徴',
  math_calculation: '算数・計算',
  kanji_literacy: '国語・漢字',
}

const DOMAIN_EMOJI: Record<string, string> = {
  attention: '🎯',
  working_memory: '🧩',
  processing_speed: '⚡',
  motivation_emotion: '💪',
  study_habits: '📚',
  sensory: '👁️',
  math_calculation: '🔢',
  kanji_literacy: '✏️',
}

function TrendBadge({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  if (trend === 'improving') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">↑ 改善</span>
  if (trend === 'declining') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">↓ 低下</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">→ 安定</span>
}

function ScoreBar({ score, maxScore = 100, color = 'bg-[#F7941D]' }: { score: number; maxScore?: number; color?: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(score / maxScore) * 100}%` }} />
    </div>
  )
}

export default function DemoGrowthReportPage() {
  const reviews = DEMO_MONTHLY_REVIEWS
  const initialDomains = DEMO_ANSWERS_JSON.domains
  const [selectedMonth, setSelectedMonth] = useState(reviews.length - 1)

  const currentReview = reviews[selectedMonth]

  // 初回スコア → 最新スコアの全期間変化
  const overallGrowth = Object.entries(initialDomains).map(([key, domain]) => {
    const latest = reviews[reviews.length - 1].domain_deltas.find(d => d.domain === key)
    return {
      domain: key,
      initial: domain.score,
      latest: latest?.current_score ?? domain.score,
      totalDelta: (latest?.current_score ?? domain.score) - domain.score,
    }
  })

  // 週次完了率のトレンド（全期間フラット化）
  const allWeeklyMetrics = reviews.flatMap((r, mi) =>
    r.weekly_metrics.map(w => ({ ...w, monthIndex: mi, globalWeek: mi * 4 + w.week }))
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* デモバッジ */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            DEMO MODE
          </span>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-3">
            <span className="text-2xl">📈</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">成長レポート</h1>
          <p className="text-gray-500">太郎さん（小4）· 3ヶ月間の記録</p>
        </div>

        {/* 全期間サマリー */}
        <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] rounded-2xl shadow-md p-6 text-white">
          <h2 className="text-lg font-bold mb-4">3ヶ月の成長サマリー</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#F7941D]">
                +{overallGrowth.reduce((sum, g) => sum + g.totalDelta, 0)}
              </div>
              <div className="text-xs text-white/60 mt-1">合計スコアUP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {overallGrowth.filter(g => g.totalDelta > 3).length}
              </div>
              <div className="text-xs text-white/60 mt-1">改善した領域</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">
                {allWeeklyMetrics[allWeeklyMetrics.length - 1]?.completion_rate ?? 0}%
              </div>
              <div className="text-xs text-white/60 mt-1">最新完了率</div>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {reviews[reviews.length - 1].ai_summary}
          </p>
        </div>

        {/* 月別タブ */}
        <div className="flex gap-2">
          {reviews.map((r, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                selectedMonth === i
                  ? 'bg-[#F7941D] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#F7941D]'
              }`}
            >
              {r.month}ヶ月目
            </button>
          ))}
        </div>

        {/* 選択月の詳細 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-1 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
            {currentReview.month}ヶ月目のまとめ
          </h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{currentReview.ai_summary}</p>

          {/* ドメインスコア変動 */}
          <div className="space-y-3 mt-4">
            {currentReview.domain_deltas.map((d) => (
              <div key={d.domain}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <span>{DOMAIN_EMOJI[d.domain]}</span>
                    {DOMAIN_LABELS[d.domain] ?? d.domain}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {d.previous_score} → <span className="font-bold text-[#1B2A4A]">{d.current_score}</span>
                    </span>
                    {d.delta !== 0 && (
                      <span className={`text-xs font-bold ${d.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {d.delta > 0 ? '+' : ''}{d.delta}
                      </span>
                    )}
                    <TrendBadge trend={d.trend} />
                  </div>
                </div>
                <ScoreBar score={d.current_score} />
              </div>
            ))}
          </div>
        </div>

        {/* 週次メトリクス */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#2196F3] rounded-full" />
            週ごとの記録
          </h2>
          <div className="space-y-4">
            {currentReview.weekly_metrics.map((w) => (
              <div key={w.week} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#1B2A4A] text-sm">Week {w.week}</span>
                  <span className="text-xs text-gray-400">
                    自分から始めた: {w.self_start_count}回
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">宿題の完了率</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ScoreBar score={w.completion_rate} color="bg-[#43A047]" />
                      </div>
                      <span className="text-sm font-bold text-[#43A047]">{w.completion_rate}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">気分スコア</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ScoreBar score={w.avg_mood} maxScore={3} color="bg-[#2196F3]" />
                      </div>
                      <span className="text-sm font-bold text-[#2196F3]">{w.avg_mood.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                {w.struggle_subjects.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-orange-500">苦戦:</span>
                    {w.struggle_subjects.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 全期間スコア推移 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#43A047] rounded-full" />
            全期間のスコア推移
          </h2>
          <div className="space-y-4">
            {overallGrowth
              .sort((a, b) => b.totalDelta - a.totalDelta)
              .map((g) => (
                <div key={g.domain}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      <span>{DOMAIN_EMOJI[g.domain]}</span>
                      {DOMAIN_LABELS[g.domain]}
                    </span>
                    <span className={`text-sm font-bold ${g.totalDelta > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {g.totalDelta > 0 ? '+' : ''}{g.totalDelta}点
                    </span>
                  </div>
                  {/* 初回→最新のバー比較 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-8">初回</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${g.initial}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-6">{g.initial}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#F7941D] w-8">最新</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#F7941D] h-1.5 rounded-full transition-all" style={{ width: `${g.latest}%` }} />
                      </div>
                      <span className="text-[10px] text-[#F7941D] font-bold w-6">{g.latest}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 効果的だった手立てランキング */}
        <div className="bg-green-50 rounded-2xl shadow-md p-6 border border-green-200">
          <h2 className="text-lg font-bold text-green-800 mb-3">効果のあった手立て</h2>
          {(() => {
            // 全月の手立てを集計
            const counts: Record<string, number> = {}
            reviews.forEach(r => {
              r.effective_strategies.forEach(s => {
                counts[s] = (counts[s] || 0) + 1
              })
            })
            const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
            return (
              <ul className="space-y-2">
                {sorted.map(([strategy, count], i) => (
                  <li key={strategy} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      i === 0 ? 'bg-[#F7941D]' : i === 1 ? 'bg-[#2196F3]' : 'bg-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{strategy}</span>
                    <span className="text-xs text-gray-400">{count}ヶ月連続</span>
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>

        {/* 完了率トレンド（全12週） */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
            宿題完了率の推移
          </h2>
          <div className="flex items-end gap-1 h-32">
            {allWeeklyMetrics.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-500 font-bold">{w.completion_rate}%</span>
                <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '100px' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all ${
                      w.monthIndex === 0 ? 'bg-orange-300' : w.monthIndex === 1 ? 'bg-[#F7941D]' : 'bg-[#E8850F]'
                    }`}
                    style={{ height: `${w.completion_rate}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">W{w.globalWeek}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-3 h-3 rounded bg-orange-300" />1ヶ月目</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-3 h-3 rounded bg-[#F7941D]" />2ヶ月目</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-3 h-3 rounded bg-[#E8850F]" />3ヶ月目</span>
          </div>
        </div>

        {/* ナビ */}
        <div className="text-center pb-8">
          <Link href="/demo/report" className="text-[#F7941D] hover:underline text-sm">
            学習特性レポートを見る
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link href="/demo/dashboard" className="text-gray-500 hover:underline text-sm">
            ダッシュボード
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link href="/demo" className="text-gray-500 hover:underline text-sm">
            デモ一覧
          </Link>
        </div>
      </div>
    </div>
  )
}
