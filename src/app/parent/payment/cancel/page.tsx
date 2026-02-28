import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">×</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">お支払いがキャンセルされました</h1>
        <p className="text-gray-500 mb-8">
          お支払いはキャンセルされています。<br />
          ご不明な点があればお問い合わせください。
        </p>
        <Link
          href="/parent/dashboard"
          className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
