'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type PlanType = 'plan_30day' | 'monthly'

interface Child {
  id: string
  name: string
  grade: string | null
}

const PLAN_INFO: Record<PlanType, { name: string; price: string; description: string; features: string[] }> = {
  plan_30day: {
    name: '30日プラン',
    price: '¥2,450',
    description: 'お子さまの学習特性に基づいた30日間の個別学習プランを生成します。',
    features: [
      '週別の学習メニュー（4週分）',
      '各教科ごとの具体的な手立て',
      '日次ログで学習記録',
      '学習スタイルに合わせた調整ルール',
    ],
  },
  monthly: {
    name: 'マンスリープラン',
    price: '¥2,980/月',
    description: '毎月自動更新で、継続的に個別プランを受け取れます。',
    features: [
      '毎月の学習プラン自動生成',
      '週別の学習メニュー',
      '日次ログで学習記録',
      '成長に合わせたプラン更新',
      'いつでも解約可能',
    ],
  },
}

function PlanCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get('type') as PlanType | null

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchChildren = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('children')
        .select('id, name, grade')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setChildren(data)
        setSelectedChildId(data[0].id)
      }
      setLoading(false)
    }

    fetchChildren()
  }, [router])

  if (!planType || !PLAN_INFO[planType]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-500 mb-4">無効なプランタイプです。</p>
          <Link
            href="/parent/dashboard"
            className="text-[#F7941D] hover:underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  const plan = PLAN_INFO[planType]

  const handlePurchase = async () => {
    if (!selectedChildId) {
      setError('お子さまを選択してください。')
      return
    }

    setPurchasing(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: planType,
          childId: selectedChildId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '決済セッションの作成に失敗しました。')
        setPurchasing(false)
        return
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        setError('決済URLの取得に失敗しました。')
        setPurchasing(false)
      }
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。')
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7941D] mx-auto mb-4" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">👶</div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
            お子さまを登録してください
          </h2>
          <p className="text-gray-500 mb-6">
            プランを購入するには、まずお子さまの情報を登録する必要があります。
          </p>
          <Link
            href="/parent/children/add"
            className="inline-block px-6 py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] transition"
          >
            お子さまを追加する
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B2A4A]">🧭 まなびコンパス</h1>
          <Link href="/parent/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← ダッシュボード
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* プラン詳細 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">{plan.name}</h2>
            <span className="text-2xl font-bold text-[#F7941D]">{plan.price}</span>
          </div>
          <p className="text-gray-600 mb-4">{plan.description}</p>

          <div className="bg-[#FFF8F0] rounded-lg p-4">
            <h3 className="font-medium text-[#1B2A4A] mb-2">含まれる内容</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* お子さま選択 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-[#1B2A4A] mb-3">お子さまを選択</h3>
          {children.length === 1 ? (
            <div className="flex items-center gap-3 p-3 bg-[#FFF8F0] rounded-lg border border-[#F7941D]/20">
              <div className="w-10 h-10 bg-[#F7941D]/10 rounded-full flex items-center justify-center text-[#F7941D] font-bold">
                {children[0].name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{children[0].name}</p>
                {children[0].grade && (
                  <p className="text-xs text-gray-500">{children[0].grade}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedChildId === child.id
                      ? 'bg-[#FFF8F0] border-[#F7941D]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="child"
                    value={child.id}
                    checked={selectedChildId === child.id}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="accent-[#F7941D]"
                  />
                  <div className="w-10 h-10 bg-[#F7941D]/10 rounded-full flex items-center justify-center text-[#F7941D] font-bold">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{child.name}</p>
                    {child.grade && (
                      <p className="text-xs text-gray-500">{child.grade}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 購入ボタン */}
        <button
          onClick={handlePurchase}
          disabled={purchasing || !selectedChildId}
          className="w-full py-4 bg-[#F7941D] text-white rounded-xl font-bold text-lg hover:bg-[#E8850F] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {purchasing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              決済ページへ移動中...
            </span>
          ) : (
            `${plan.price} で購入する`
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Stripeの安全な決済ページに移動します。
          {planType === 'monthly' && 'いつでもキャンセル可能です。'}
        </p>
      </main>
    </div>
  )
}

export default function PlanCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7941D] mx-auto mb-4" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      }
    >
      <PlanCheckoutContent />
    </Suspense>
  )
}
