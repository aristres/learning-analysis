import Link from 'next/link'
import { DEMO_CHILDREN, DEMO_ASSESSMENTS } from '@/lib/demo-data'

export default function DemoDashboard() {
  const children = DEMO_CHILDREN
  const assessments = DEMO_ASSESSMENTS

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* デモバナー */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-700">
        デモモード：モックデータを表示しています
      </div>

      {/* ナビ */}
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B2A4A]">KIDDO Insight</h1>
          <Link href="/demo" className="text-sm text-gray-500 hover:text-gray-700">
            デモ一覧へ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-[#1B2A4A]">ダッシュボード</h2>

        {/* お子さん一覧 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-700">お子さん</h3>
            <span className="text-sm text-gray-400">+ 追加</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((child) => (
              <div key={child.id} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{child.name}</p>
                    <p className="text-sm text-gray-500">{child.grade}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F7941D] font-bold">
                    {child.name.charAt(0)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/demo/assessment/basic"
                    className="text-center text-sm py-1.5 border border-[#F7941D] text-[#F7941D] rounded-lg hover:bg-[#FFF8F0]"
                  >
                    診断する
                  </Link>
                  <Link
                    href="/demo/report"
                    className="text-center text-sm py-1.5 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F]"
                  >
                    レポートを見る
                  </Link>
                  <Link
                    href="/demo/growth-report"
                    className="text-center text-sm py-1.5 border border-[#43A047] text-[#43A047] rounded-lg hover:bg-green-50"
                  >
                    📈 成長レポート
                  </Link>
                  <Link
                    href="/demo/child/self-discovery"
                    className="text-center text-sm py-1.5 border border-[#2196F3] text-[#2196F3] rounded-lg hover:bg-blue-50"
                  >
                    🔍 学び発見
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 料金プラン */}
        <section className="bg-[#FFF8F0] rounded-2xl p-6 border border-[#F7941D]/20">
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">プランをアップグレード</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="font-bold text-gray-800 mb-1">ベーシック診断</div>
              <div className="text-2xl font-bold text-[#F7941D] mb-1">¥1,480</div>
              <p className="text-xs text-gray-500 mb-3">20問・詳細レポート</p>
              <Link
                href="/demo/assessment/basic"
                className="block text-sm py-1.5 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F]"
              >
                購入する
              </Link>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-[#F7941D]">
              <div className="font-bold text-gray-800 mb-1">30日プラン</div>
              <div className="text-2xl font-bold text-[#F7941D] mb-1">¥2,450</div>
              <p className="text-xs text-gray-500 mb-3">週別メニュー・日次ログ</p>
              <span className="block text-sm py-1.5 bg-gray-300 text-white rounded-lg cursor-not-allowed">
                購入する
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="font-bold text-gray-800 mb-1">マンスリー</div>
              <div className="text-2xl font-bold text-[#F7941D] mb-1">¥2,980</div>
              <p className="text-xs text-gray-500 mb-3">月額・継続プラン</p>
              <span className="block text-sm py-1.5 bg-gray-300 text-white rounded-lg cursor-not-allowed">
                購入する
              </span>
            </div>
          </div>
        </section>

        {/* 診断履歴 */}
        <section>
          <h3 className="text-lg font-bold text-gray-700 mb-3">診断履歴</h3>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {assessments.map((a) => (
              <Link
                key={a.id}
                href="/demo/report"
                className="flex items-center justify-between px-5 py-4 hover:bg-[#FFF8F0] border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{a.children.name}</p>
                  <p className="text-sm text-gray-500">
                    {a.type === 'basic' ? 'ベーシック診断' : '無料診断'} ·{' '}
                    {new Date(a.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <span className="text-[#F7941D] text-sm">レポートを見る →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
