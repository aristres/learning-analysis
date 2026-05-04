import Link from 'next/link'
import Header from '@/components/Header'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="mx-auto mb-8 text-3xl md:text-4xl font-bold">
            <span className="text-[#F7941D]">Manabi</span> Compass
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            お子さんの<br className="sm:hidden" />
            <span className="text-[#F7941D]">&ldquo;学び方の個性&rdquo;</span>を<br className="sm:hidden" />
            発見しよう
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
            たった3分の質問で、お子さんの学習の傾向を多角的にチェック。
            算数・国語の宿題対策を含む、家庭で使える手立てを提案します。
          </p>
          <Link
            href="/parent/assessment/free"
            className="inline-block px-10 py-4 bg-[#F7941D] text-white text-lg font-bold rounded-full hover:bg-[#E8850F] transition shadow-lg shadow-[#F7941D]/30 hover:shadow-xl"
          >
            無料で診断する（約3分）
          </Link>
          <p className="mt-4 text-sm text-white/50">登録不要・すぐに結果がわかります</p>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 80 1440 80V80H0V40Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-12">3ステップで完了</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📝', title: '質問に答える', desc: '8問の簡単な質問に回答（約3分）' },
              { icon: '🧠', title: 'AIが分析', desc: '8つの視点で学習の傾向と宿題の困りごとを把握' },
              { icon: '📊', title: 'レポートを受け取る', desc: '強み・課題・具体的な学習法を提案' },
            ].map((step, i) => (
              <div key={i} className="animate-fade-in-up">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full bg-[#F7941D] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-[#1B2A4A]">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Domains */}
      <section className="bg-white py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4">8つの視点で学習傾向を把握</h2>
          <p className="text-gray-500 mb-10">お子さんの学び方の特徴を多角的にチェックし、家庭での手立てにつなげます</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', label: '集中のしやすさ', color: 'bg-red-50 text-red-600' },
              { icon: '🧩', label: '手順の記憶', color: 'bg-purple-50 text-purple-600' },
              { icon: '⚡', label: '作業スピード', color: 'bg-yellow-50 text-yellow-600' },
              { icon: '💪', label: 'やる気・気持ち', color: 'bg-pink-50 text-pink-600' },
              { icon: '📚', label: '学習習慣', color: 'bg-green-50 text-green-600' },
              { icon: '👁️', label: '感覚の特徴', color: 'bg-teal-50 text-teal-600' },
              { icon: '🔢', label: '算数・計算', color: 'bg-orange-50 text-orange-600' },
              { icon: '✏️', label: '国語・漢字', color: 'bg-blue-50 text-blue-600' },
            ].map((d) => (
              <div
                key={d.label}
                className={`${d.color} rounded-2xl p-4 text-center`}
              >
                <div className="text-3xl mb-2">{d.icon}</div>
                <p className="text-sm font-medium">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8FAFC] py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-10">利用者の声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Y.Sさん',
                attr: '小3男子のママ',
                body: '息子が宿題を嫌がる理由がわからなかったのですが、ワーキングメモリの特性だとわかり、声かけの仕方を変えたら自分から取り組むようになりました。',
                rating: 5,
              },
              {
                name: 'M.Tさん',
                attr: '小1女子のパパ',
                body: '担任の先生との面談で「こういう特性があります」と具体的に伝えられたのが大きかったです。先生も対応を工夫してくれるようになりました。',
                rating: 5,
              },
              {
                name: 'A.Kさん',
                attr: '小5男子のママ',
                body: '塾選びで悩んでいたとき、視覚優位タイプとわかり映像授業の塾に決めました。成績が上がって本人も自信がついたようです。',
                rating: 4,
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 text-left">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={j < t.rating ? 'text-[#F7941D]' : 'text-gray-200'}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.body}</p>
                <div className="border-t pt-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFF8F0] text-[#F7941D] font-bold text-sm flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1B2A4A]">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.attr}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-10">料金プラン</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
              <div className="text-[#F7941D] font-bold text-lg mb-2">無料診断</div>
              <div className="text-4xl font-bold text-[#1B2A4A] mb-2">¥0</div>
              <p className="text-gray-500 text-sm mb-6">簡易 8問・傾向をチェック</p>
              <Link
                href="/parent/assessment/free"
                className="block w-full py-3 rounded-full border-2 border-[#F7941D] text-[#F7941D] font-medium hover:bg-[#FFF8F0] transition"
              >
                試してみる
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-2 border-[#F7941D] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-white text-xs font-bold px-4 py-1 rounded-full">
                おすすめ
              </div>
              <div className="text-[#F7941D] font-bold text-lg mb-2">ベーシック診断</div>
              <div className="text-4xl font-bold text-[#1B2A4A] mb-2">¥1,480</div>
              <p className="text-gray-500 text-sm mb-6">詳細 20問・完全レポート</p>
              <Link
                href="/signup"
                className="block w-full py-3 rounded-full bg-[#F7941D] text-white font-medium hover:bg-[#E8850F] transition"
              >
                はじめる
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
              <div className="text-[#F7941D] font-bold text-lg mb-2">１ヶ月継続プラン</div>
              <div className="text-4xl font-bold text-[#1B2A4A] mb-2">¥2,450<span className="text-lg font-normal">/月</span></div>
              <p className="text-gray-500 text-sm mb-6">週別メニュー・AIアドバイス・日次ログ</p>
              <Link
                href="/signup"
                className="block w-full py-3 rounded-full border-2 border-[#F7941D] text-[#F7941D] font-medium hover:bg-[#FFF8F0] transition"
              >
                はじめる
              </Link>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-14 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-[#1B2A4A] font-semibold border-b-2 border-gray-200 w-2/5">
                    機能
                  </th>
                  <th className="py-3 px-3 text-center text-[#1B2A4A] font-semibold border-b-2 border-gray-200 w-1/5">
                    無料
                  </th>
                  <th className="py-3 px-3 text-center font-semibold border-b-2 border-[#F7941D] w-1/5">
                    <span className="text-[#F7941D]">ベーシック</span>
                  </th>
                  <th className="py-3 px-3 text-center text-[#1B2A4A] font-semibold border-b-2 border-gray-200 w-1/5">
                    継続プラン
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  { feature: '質問数', free: '8問', basic: '20問', plan30: '20問' },
                  { feature: '8項目スコア', free: '簡易', basic: '✓', plan30: '✓' },
                  { feature: '強み・つまずき分析', free: '—', basic: '✓', plan30: '✓' },
                  { feature: '具体的な手立て提案', free: '—', basic: '✓', plan30: '✓' },
                  { feature: '学習スタイル判定', free: '—', basic: '✓', plan30: '✓' },
                  { feature: '困りやすい場面の解説', free: '—', basic: '✓', plan30: '✓' },
                  { feature: '算数・国語の具体的手立て', free: '—', basic: '✓', plan30: '✓' },
                  { feature: '週別学習メニュー', free: '—', basic: '—', plan30: '✓' },
                  { feature: '日次ログ（子どもUI）', free: '—', basic: '—', plan30: '✓' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="py-3 px-4 font-medium text-[#1B2A4A]">{row.feature}</td>
                    <td className="py-3 px-3 text-center">{row.free === '✓' ? <span className="text-[#43A047] font-bold">✓</span> : row.free === '—' ? <span className="text-gray-300">—</span> : row.free}</td>
                    <td className="py-3 px-3 text-center bg-[#FFF8F0]/50">{row.basic === '✓' ? <span className="text-[#43A047] font-bold">✓</span> : row.basic === '—' ? <span className="text-gray-300">—</span> : row.basic}</td>
                    <td className="py-3 px-3 text-center">{row.plan30 === '✓' ? <span className="text-[#43A047] font-bold">✓</span> : row.plan30 === '—' ? <span className="text-gray-300">—</span> : row.plan30}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B2A4A] text-white/60 text-sm text-center py-8">
        <p className="font-medium text-white/80 mb-1">Manabi Compass</p>
        <p>&copy; 2025 Manabi Compass</p>
        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
          <Link href="/privacy" className="text-white/40 hover:text-white/70 text-xs">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="text-white/40 hover:text-white/70 text-xs">
            利用規約
          </Link>
          <Link href="/tokushoho" className="text-white/40 hover:text-white/70 text-xs">
            特定商取引法に基づく表記
          </Link>
        </div>
        <Link href="/demo" className="text-white/40 hover:text-white/70 text-xs mt-2 inline-block">
          デモページを見る
        </Link>
      </footer>
    </main>
  )
}
