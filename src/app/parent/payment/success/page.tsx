import Link from 'next/link'

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ productType?: string; assessmentId?: string; childId?: string }>
}) {
  const params = await searchParams
  const { productType, assessmentId, childId } = params

  const message =
    productType === 'basic_assessment'
      ? 'ベーシック診断の購入が完了しました'
      : productType === 'plan_30day'
      ? '30日プランの購入が完了しました'
      : productType === 'monthly'
      ? 'マンスリープランの購入が完了しました'
      : 'お支払いが完了しました'

  const nextHref =
    productType === 'basic_assessment' && assessmentId
      ? `/parent/assessment/basic?assessmentId=${assessmentId}&childId=${childId ?? ''}`
      : '/parent/dashboard'

  const nextLabel =
    productType === 'basic_assessment' ? '診断を完了する' : 'ダッシュボードへ'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{message}</h1>
        <p className="text-gray-500 mb-8">
          ご購入ありがとうございます。
        </p>
        <Link
          href={nextHref}
          className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          {nextLabel}
        </Link>
      </div>
    </div>
  )
}
