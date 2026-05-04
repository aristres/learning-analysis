'use client'

import { useState } from 'react'

interface PaywallButtonProps {
  assessmentId: string
  childId: string
}

export default function PaywallButton({ assessmentId, childId }: PaywallButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePurchase = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'basic_assessment',
          childId,
          assessmentId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '決済セッションの作成に失敗しました')
        setLoading(false)
        return
      }
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full py-4 bg-[#F7941D] text-white rounded-xl font-bold text-lg hover:bg-[#E8850F] disabled:opacity-50 transition shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            決済ページへ移動中...
          </span>
        ) : (
          '¥1,480 で全レポートを見る'
        )}
      </button>
      <p className="text-xs text-gray-400 mt-2">Stripeの安全な決済ページに移動します</p>
    </div>
  )
}
