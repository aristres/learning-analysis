'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DEMO_ANSWERS_JSON, DEMO_MONTHLY_REVIEWS } from '@/lib/demo-data'
import { generatePlan, type PlanGeneratorInput } from '@/lib/plan-generator'
import type { PlanJson, DomainKey } from '@/types'

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
// 月ごとのプランを生成
// =============================================

function buildPlans(): PlanJson[] {
  const domains = DEMO_ANSWERS_JSON.domains
  const reviews = DEMO_MONTHLY_REVIEWS

  // 1ヶ月目: 初回
  const plan1 = generatePlan({
    domains,
    learningStyle: 'visual',
    month: 1,
    effectiveStrategyIds: [],
    ineffectiveStrategyIds: [],
    previousStrategyIds: [],
    childName: '太郎',
  })

  // 2ヶ月目: 1ヶ月目の結果を反映
  const month1Review = reviews[0]
  const plan1AllIds = [
    ...plan1.continued_strategies.map(s => s.id),
    ...plan1.new_strategies.map(s => s.id),
  ]
  // 1ヶ月目のドメインスコアを更新
  const updatedDomains1 = { ...domains }
  for (const delta of month1Review.domain_deltas) {
    const key = delta.domain as DomainKey
    if (updatedDomains1[key]) {
      updatedDomains1[key] = {
        ...updatedDomains1[key],
        score: delta.current_score,
        level: delta.current_score >= 65 ? 'high' : delta.current_score >= 45 ? 'middle' : 'low',
      }
    }
  }

  const plan2 = generatePlan({
    domains: updatedDomains1,
    learningStyle: 'visual',
    month: 2,
    effectiveStrategyIds: plan1AllIds.slice(0, 2), // 上位2つが効果的だった想定
    ineffectiveStrategyIds: [],
    previousStrategyIds: plan1AllIds,
    childName: '太郎',
  })

  // 3ヶ月目: 2ヶ月目の結果を反映
  const month2Review = reviews[1]
  const plan2AllIds = [
    ...plan2.continued_strategies.map(s => s.id),
    ...plan2.new_strategies.map(s => s.id),
  ]
  const updatedDomains2 = { ...updatedDomains1 }
  for (const delta of month2Review.domain_deltas) {
    const key = delta.domain as DomainKey
    if (updatedDomains2[key]) {
      updatedDomains2[key] = {
        ...updatedDomains2[key],
        score: delta.current_score,
        level: delta.current_score >= 65 ? 'high' : delta.current_score >= 45 ? 'middle' : 'low',
      }
    }
  }

  const plan3 = generatePlan({
    domains: updatedDomains2,
    learningStyle: 'visual',
    month: 3,
    effectiveStrategyIds: plan2AllIds.slice(0, 2),
    ineffectiveStrategyIds: [plan2AllIds[plan2AllIds.length - 1] ?? ''],
    previousStrategyIds: plan2AllIds,
    childName: '太郎',
  })

  return [plan1, plan2, plan3]
}

// =============================================
// メインページ
// =============================================

export default function DemoPlanPage() {
  const plans = useMemo(() => buildPlans(), [])
  const [selectedMonth, setSelectedMonth] = useState(0)
  const plan = plans[selectedMonth]

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* デモバッジ */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            DEMO MODE
          </span>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">30日プラン</h1>
          <p className="text-gray-500">太郎さん（小4）のパーソナライズプラン</p>
        </div>

        {/* 月別タブ */}
        <div className="flex gap-2">
          {plans.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                selectedMonth === i
                  ? 'bg-[#F7941D] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#F7941D]'
              }`}
            >
              {i + 1}ヶ月目
            </button>
          ))}
        </div>

        {/* 概要 */}
        <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2C3E6B] rounded-2xl shadow-md p-6 text-white">
          <h2 className="text-lg font-bold mb-2">{plan.month}ヶ月目のプラン</h2>
          <p className="text-white/80 text-sm leading-relaxed">{plan.overview}</p>
          <div className="flex gap-3 mt-4">
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
              <div className="text-xl font-bold text-[#F7941D]">
                {plan.new_strategies.length + plan.continued_strategies.length}
              </div>
              <div className="text-[10px] text-white/60">手立て数</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
              <div className="text-xl font-bold text-green-400">
                {plan.continued_strategies.length}
              </div>
              <div className="text-[10px] text-white/60">継続</div>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
              <div className="text-xl font-bold text-blue-300">
                {plan.new_strategies.length}
              </div>
              <div className="text-[10px] text-white/60">新規</div>
            </div>
            {plan.retired_strategies.length > 0 && (
              <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
                <div className="text-xl font-bold text-gray-400">
                  {plan.retired_strategies.length}
                </div>
                <div className="text-[10px] text-white/60">卒業</div>
              </div>
            )}
          </div>
        </div>

        {/* 重点エリア */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-400 rounded-full" />
            重点サポート領域
          </h2>
          <div className="flex flex-wrap gap-2">
            {plan.child_profile.low_domains.map(d => (
              <span key={d} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                {DOMAIN_LABELS[d]}（要サポート）
              </span>
            ))}
            {plan.child_profile.improving_domains.map(d => (
              <span key={d} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                {DOMAIN_LABELS[d]}（改善中）
              </span>
            ))}
          </div>
        </div>

        {/* 継続する手立て */}
        {plan.continued_strategies.length > 0 && (
          <div className="bg-green-50 rounded-2xl shadow-md p-6 border border-green-200">
            <h2 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🔄</span>
              継続する手立て
            </h2>
            <div className="space-y-3">
              {plan.continued_strategies.map(s => (
                <StrategyCard key={s.id} strategy={s} variant="continued" />
              ))}
            </div>
          </div>
        )}

        {/* 新しい手立て */}
        <div className="bg-blue-50 rounded-2xl shadow-md p-6 border border-blue-200">
          <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-xl">✨</span>
            {plan.month === 1 ? '今月の手立て' : '新しい手立て'}
          </h2>
          <div className="space-y-3">
            {plan.new_strategies.map(s => (
              <StrategyCard key={s.id} strategy={s} variant="new" />
            ))}
          </div>
        </div>

        {/* 卒業した手立て */}
        {plan.retired_strategies.length > 0 && (
          <div className="bg-gray-50 rounded-2xl shadow-md p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-600 mb-3 flex items-center gap-2">
              <span className="text-xl">🎓</span>
              卒業した手立て
            </h2>
            <div className="space-y-2">
              {plan.retired_strategies.map(s => (
                <div key={s.id} className="flex items-start gap-2 text-sm text-gray-500">
                  <span className="mt-0.5">•</span>
                  <span>{s.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 週別プラン */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
            週別メニュー
          </h2>
          <div className="space-y-4">
            {plan.weeks.map(week => (
              <div key={week.week} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#1B2A4A]">Week {week.week}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-sm text-gray-600">{week.theme}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {week.daily_tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {CATEGORY_EMOJI[task.category] ?? '📌'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{task.task}</p>
                        <p className="text-xs text-gray-400 mt-0.5">目安 {task.duration_minutes}分</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-[#43A047] font-medium">
                      ✓ 成功基準: {week.success_criteria}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 自動調整ルール */}
        <div className="bg-[#FFF8F0] rounded-2xl shadow-md p-6 border border-[#F7941D]/20">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            自動調整ルール
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            日次ログのデータに基づいてプランを自動で調整します
          </p>
          <div className="space-y-3">
            {plan.adjustment_rules.map((rule, i) => (
              <div key={i} className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="text-[#F7941D]">IF</span> {rule.trigger}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-[#2196F3]">→</span> {rule.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ナビ */}
        <div className="text-center pb-8">
          <Link href="/demo/growth-report" className="text-[#43A047] hover:underline text-sm">
            成長レポートを見る
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link href="/demo/report" className="text-[#F7941D] hover:underline text-sm">
            学習特性レポート
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

// =============================================
// 手立てカード
// =============================================

function StrategyCard({
  strategy,
  variant,
}: {
  strategy: { id: string; label: string; description: string; reason: string }
  variant: 'continued' | 'new'
}) {
  const emoji = CATEGORY_EMOJI[strategy.id.split('_')[0]] ?? '📌'
  const bgColor = variant === 'continued' ? 'bg-white' : 'bg-white'
  const accentColor = variant === 'continued' ? 'text-green-600' : 'text-blue-600'

  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{emoji}</span>
        <div className="flex-1">
          <p className="font-bold text-[#1B2A4A] text-sm">{strategy.label}</p>
          <p className="text-sm text-gray-600 mt-0.5">{strategy.description}</p>
          <p className={`text-xs ${accentColor} mt-2`}>
            💡 {strategy.reason}
          </p>
        </div>
      </div>
    </div>
  )
}
