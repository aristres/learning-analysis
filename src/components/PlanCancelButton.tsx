'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PlanCancelButton({ planId }: { planId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    try {
      await fetch('/api/plan/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      router.refresh()
    } catch {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-700 mb-2">本当に解約しますか？プランの内容は削除されます。</p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '解約中...' : '解約する'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-3 w-full py-1.5 text-xs text-gray-400 hover:text-red-400 hover:underline"
    >
      プランを解約する
    </button>
  )
}
