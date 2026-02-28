import Link from 'next/link'

const pages = [
  { href: '/demo/dashboard', title: 'ダッシュボード', desc: '子ども一覧・診断履歴・料金プラン表示' },
  { href: '/demo/assessment/basic', title: 'ベーシック診断（20問）', desc: '有料20問フォーム・子ども選択付き' },
  { href: '/demo/report', title: '学習特性レポート', desc: '8領域スコア・強み/弱み・手立て・学習スタイル' },
  { href: '/demo/plan', title: '30日プラン', desc: '月別の手立て選出・週別メニュー・自動調整ルール' },
  { href: '/demo/growth-report', title: '成長レポート', desc: '月別スコア推移・完了率トレンド・効果的な手立てランキング' },
  { href: '/demo/child/daily-log', title: '日次ログ（子どもUI）', desc: '絵文字つき10問・スライド形式の子ども向けフォーム' },
  { href: '/demo/child/self-discovery', title: '学び発見（子どもUI）', desc: '子ども自身が学び方を知る8問の自己診断・マイレポート' },
]

export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full mb-3">
              DEMO MODE
            </span>
            <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">デモページ一覧</h1>
            <p className="text-gray-500 text-sm">
              モックデータで有料機能のUIを確認できます（認証・決済不要）
            </p>
          </div>

          <div className="space-y-4">
            {pages.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="block p-5 border rounded-xl hover:border-[#F7941D] hover:bg-[#FFF8F0] transition"
              >
                <p className="font-bold text-gray-800">{p.title}</p>
                <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="text-[#F7941D] hover:underline text-sm">
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
