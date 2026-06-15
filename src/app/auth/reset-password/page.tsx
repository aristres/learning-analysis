'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const supabase = createClient()
      supabase.auth.exchangeCodeForSession(code)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('パスワードの更新に失敗しました。もう一度お試しください。')
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (done) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        <p className="text-green-600 font-medium">パスワードを更新しました。ログイン画面へ移動します。</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-center text-[#1B2A4A] mb-6">パスワード再設定</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F7941D]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F7941D]" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] disabled:opacity-50 transition">
          {loading ? '更新中...' : 'パスワードを更新する'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <Suspense fallback={<div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center"><p className="text-gray-500">読み込み中...</p></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
