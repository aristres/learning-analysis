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
      ? 'くわしいチェックの購入が完了しました'
      : productType === 'plan_30day'
      ? '30日プランの購入が完了しました'
      : productType === 'monthly'
      ? 'マンスリープランの購入が完了しました'
      : 'お支払いが完了しました'

  const nextHref =
    productType === 'basic_assessment'
      ? `/parent/assessment/basic?childId=${childId ?? ''}&paid=1`
      : '/parent/dashboard'

  const nextLabel =
    productType === 'basic_assessment' ? 'チェックを始める' : 'ダッシュボードへ'

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
          className="inline-block px-8 py-3 bg-[#F7941D] text-white rounded-lg font-medium hover:bg-[#E8850F] transition"
        >
          {nextLabel}
        </Link>
      </div>
    </div>
  )
}
