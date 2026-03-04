import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
          ページが見つかりません
        </h1>
        <p className="text-gray-500 mb-8">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] transition text-center"
          >
            トップページへ
          </Link>
          <Link
            href="/parent/dashboard"
            className="text-[#F7941D] hover:underline text-sm"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </div>
  )
}
