'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'payment',   label: '💳 お支払い・請求について' },
  { value: 'report',    label: '📊 診断・レポートについて' },
  { value: 'plan',      label: '📋 プランの使い方について' },
  { value: 'technical', label: '⚙️ 技術的な不具合について' },
  { value: 'other',     label: '💬 その他' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValid =
    form.name.trim().length > 0 &&
    form.email.includes('@') &&
    form.category !== '' &&
    form.message.trim().length >= 10

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || status === 'submitting') return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '送信に失敗しました')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    }
  }

  // ── 送信完了画面 ────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">
            お問い合わせを受け付けました
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            通常3営業日以内にご登録のメールアドレスへご返信します。<br />
            しばらくお待ちください。
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 space-y-1 mb-6">
            <p><span className="text-gray-400">お名前：</span>{form.name}</p>
            <p><span className="text-gray-400">メール：</span>{form.email}</p>
            <p><span className="text-gray-400">種別：</span>
              {CATEGORIES.find((c) => c.value === form.category)?.label}
            </p>
          </div>
          <Link
            href="/parent/dashboard"
            className="inline-block px-6 py-3 bg-[#F7941D] text-white rounded-full font-medium hover:bg-[#E8850F] transition text-sm"
          >
            ダッシュボードへ戻る
          </Link>
        </div>
      </div>
    )
  }

  // ── フォーム画面 ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#FFF8F0] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">お問い合わせ</h1>
          <p className="text-gray-400 text-sm">
            ご質問・ご不明点はこちらからお気軽にどうぞ
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* お名前 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                お名前 <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40 focus:border-[#F7941D] transition"
                required
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス <span className="text-red-400 text-xs">必須</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40 focus:border-[#F7941D] transition"
                required
              />
              <p className="text-xs text-gray-400 mt-1">ご返信はこちらのアドレスに送信します</p>
            </div>

            {/* お問い合わせ種別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                お問い合わせの種別 <span className="text-red-400 text-xs">必須</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40 focus:border-[#F7941D] transition bg-white"
                required
              >
                <option value="" disabled>選択してください</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* お問い合わせ内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                お問い合わせ内容 <span className="text-red-400 text-xs">必須</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="ご質問・ご不明な点をできるだけ詳しくご記入ください"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F7941D]/40 focus:border-[#F7941D] transition resize-none"
                required
                minLength={10}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length} 文字</p>
            </div>

            {/* エラー表示 */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={!isValid || status === 'submitting'}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition ${
                isValid && status !== 'submitting'
                  ? 'bg-[#F7941D] text-white hover:bg-[#E8850F] shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {status === 'submitting' ? '送信中…' : '送信する'}
            </button>

          </form>

          {/* 補足 */}
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-400 text-center">
              通常3営業日以内にご返信します
            </p>
            <p className="text-xs text-gray-300 text-center">
              直接メールの場合：
              <a href="mailto:sanaesuzuki16@gmail.com" className="underline hover:text-gray-500 transition">
                sanaesuzuki16@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
