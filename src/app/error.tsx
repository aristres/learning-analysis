'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          エラーが発生しました
        </h1>
        <p className="text-gray-500 mb-8">
          申し訳ございません。予期しないエラーが発生しました。
          <br />
          しばらくしてからもう一度お試しください。
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] transition"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="text-[#F7941D] hover:underline text-sm"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
