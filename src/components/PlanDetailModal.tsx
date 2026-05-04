'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlanInfo {
  type: 'basic_assessment' | 'plan_30day' | 'monthly'
  name: string
  price: string
  tagline: string
  description: string
  features: { emoji: string; text: string }[]
  note?: string
  ctaLabel: string
  href?: string  // assessment は href遷移
}

const PLANS: Record<string, PlanInfo> = {
  basic_assessment: {
    type: 'basic_assessment',
    name: 'くわしいチェック',
    price: '¥1,480',
    tagline: '一度きりの詳細診断',
    description: '20問の質問でお子さんの学習特性を徹底分析。詳細レポートを生成します。',
    features: [
      { emoji: '🧠', text: '学習タイプ診断（6タイプ分類）' },
      { emoji: '📊', text: '8領域のドメインスコア' },
      { emoji: '💡', text: '強み・のびしろの詳細分析' },
      { emoji: '📚', text: '算数・国語ごとの具体的アドバイス' },
      { emoji: '🏠', text: '家庭でできる手立て一覧' },
    ],
    note: '※ 買い切りプランです。レポートはいつでも見返せます。',
    ctaLabel: 'チェックを始める',
    href: '/parent/assessment/basic',
  },
  plan_30day: {
    type: 'plan_30day',
    name: '1週間お試しプラン',
    price: '¥980',
    tagline: '7日間限定トライアル',
    description: 'まずは1週間、１ヶ月継続プランの機能をすべてお試しいただけます。',
    features: [
      { emoji: '📅', text: '7日間の個別学習プラン' },
      { emoji: '📚', text: '今日の宿題アドバイス（AI）' },
      { emoji: '📝', text: '日次ログで学習を記録' },
      { emoji: '📊', text: '進捗・気分の振り返り' },
      { emoji: '✅', text: '自動継続なし・1回限り' },
    ],
    note: '※ 試用期間終了後は自動更新しません。',
    ctaLabel: '1週間試してみる',
  },
  monthly: {
    type: 'monthly',
    name: '１ヶ月継続プラン',
    price: '¥2,450/月',
    tagline: '毎月自動更新・継続伴走型',
    description: '毎月プランが自動更新され、お子さんの成長に合わせて伴走し続けます。',
    features: [
      { emoji: '🔄', text: '毎月の学習プラン自動生成' },
      { emoji: '📅', text: '週別メニュー（4週分）' },
      { emoji: '🤖', text: '今日の宿題アドバイス（AI・毎日利用可）' },
      { emoji: '📝', text: '日次ログで学習記録' },
      { emoji: '📈', text: '進捗・ドメインスコアの変化を確認' },
      { emoji: '🔓', text: 'いつでも解約可能' },
    ],
    note: '※ 毎月自動更新されます。ダッシュボードからいつでも解約できます。',
    ctaLabel: '１ヶ月継続プランを始める',
  },
}

interface Props {
  planKey: string
  trigger: React.ReactNode
}

export default function PlanDetailModal({ planKey, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const plan = PLANS[planKey]
  if (!plan) return <>{trigger}</>

  const handlePurchase = async () => {
    if (plan.href) {
      router.push(plan.href)
      return
    }
    setLoading(true)
    router.push(`/parent/payment/plan?type=${plan.type}`)
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2B4BAF] text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/60 mb-1">{plan.tagline}</p>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#F7941D]">{plan.price}</p>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-3 leading-relaxed">{plan.description}</p>
            </div>

            {/* 機能一覧 */}
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">含まれる機能</p>
              <ul className="space-y-3 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl leading-none">{f.emoji}</span>
                    <span className="text-sm text-gray-700">{f.text}</span>
                  </li>
                ))}
              </ul>

              {plan.note && (
                <p className="text-xs text-gray-400 mb-5">{plan.note}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
                >
                  閉じる
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#F7941D] text-white rounded-xl font-bold text-sm hover:bg-[#E8850F] transition disabled:opacity-50"
                >
                  {loading ? '移動中...' : plan.ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
