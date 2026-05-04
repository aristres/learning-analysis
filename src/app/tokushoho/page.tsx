import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | Manabi Compass',
}

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-6">特定商取引法に基づく表記</h1>

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">販売業者</h2>
              <p className="text-gray-800">Manabi Compass 運営事務局</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">運営統括責任者</h2>
              <p className="text-gray-800">※公開時に記載</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">所在地</h2>
              <p className="text-gray-800">※請求があった場合に遅滞なく開示いたします</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">電話番号</h2>
              <p className="text-gray-800">※請求があった場合に遅滞なく開示いたします</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h2>
              <p className="text-gray-800">※公開時に記載</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">販売価格</h2>
              <div className="text-gray-800 space-y-1">
                <p>ベーシック診断: 1,480円（税込）</p>
                <p>30日学習プラン: 2,450円（税込）</p>
                <p>マンスリープラン: 1,980円/月（税込）</p>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">販売価格以外にかかる費用</h2>
              <p className="text-gray-800">
                インターネット接続料金、通信料金はお客様のご負担となります。
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">支払方法</h2>
              <p className="text-gray-800">
                クレジットカード決済（Stripe経由）
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">支払時期</h2>
              <p className="text-gray-800">
                ご注文時にお支払いが確定します。
                マンスリープランは毎月同日に自動課金されます。
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">商品の引渡時期</h2>
              <p className="text-gray-800">
                決済完了後、即時にサービスをご利用いただけます。
                診断レポートはAI分析完了後（通常1〜2分以内）に表示されます。
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">返品・キャンセルについて</h2>
              <p className="text-gray-800">
                デジタルコンテンツの性質上、決済完了後のキャンセル・返金は原則として行っておりません。
                ただし、サービスの不具合によりレポートが生成されなかった場合は、
                再生成または返金にて対応いたします。
              </p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">解約について</h2>
              <p className="text-gray-800">
                マンスリープランの解約は、マイページより次回請求日の前日までにお手続きください。
                解約後も、現在の請求期間の終了まではサービスをご利用いただけます。
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-1">動作環境</h2>
              <p className="text-gray-800">
                インターネットに接続可能なPC、スマートフォン、タブレット。
                推奨ブラウザ: Chrome、Safari、Firefox、Edge の最新版。
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 pb-8">
          <Link href="/" className="text-[#F7941D] hover:underline text-sm">
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
