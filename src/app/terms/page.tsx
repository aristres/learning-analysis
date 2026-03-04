import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | KIDDO Insight',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-6">利用規約</h1>
          <p className="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>

          <div className="prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed">
                本規約は、KIDDO Insight（以下「当サービス」）の利用に関する条件を定めるものです。
                ユーザーは、本規約に同意の上で当サービスをご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第2条（サービスの内容）</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスは、保護者が回答する質問を基に、お子さまの学習特性をAIで分析し、
                レポートおよび学習プランを提供するサービスです。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>無料診断（簡易8問、登録不要）</li>
                <li>ベーシック診断（詳細20問、有料）</li>
                <li>30日学習プラン（有料）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第3条（免責事項）</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスの分析結果・アドバイスは、教育的な情報提供を目的としたものであり、
                以下に該当するものではありません。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>医療診断（ADHD、LD、ASD等の診断）</li>
                <li>専門的な発達検査（WISC等）に代わるもの</li>
                <li>学校教育・塾における公式な評価</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                当サービスの情報に基づく判断は、ユーザーご自身の責任で行ってください。
                お子さまの発達にご心配がある場合は、医療機関・教育相談機関への相談をお勧めします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第4条（利用料金・支払い）</h2>
              <p className="text-gray-700 leading-relaxed">
                有料サービスの料金は、サービス上に表示される金額とします。
                支払いはStripe株式会社の決済システムを通じて行われます。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>決済完了後のキャンセル・返金は原則として行いません</li>
                <li>サービスの不具合によりレポートが生成されなかった場合は、再生成または返金で対応いたします</li>
                <li>マンスリープランの解約は、次回請求日の前日までに行ってください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第5条（禁止事項）</h2>
              <p className="text-gray-700 leading-relaxed">ユーザーは以下の行為を行ってはなりません。</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>他者になりすましてサービスを利用する行為</li>
                <li>サービスの運営を妨害する行為</li>
                <li>不正アクセスまたはそれに類する行為</li>
                <li>レポート内容を商用目的で再配布する行為</li>
                <li>その他、法令または公序良俗に反する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第6条（知的財産権）</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスに関するすべてのコンテンツ（テキスト、分析アルゴリズム、デザイン等）の
                知的財産権は、当サービス運営者に帰属します。
                ユーザーは、個人の学習支援目的に限り、レポート内容を利用できます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第7条（サービスの変更・終了）</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスは、事前に通知することなくサービスの内容を変更、
                または提供を終了することがあります。
                これによりユーザーに生じた損害について、当サービスは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第8条（個人情報の取り扱い）</h2>
              <p className="text-gray-700 leading-relaxed">
                個人情報の取り扱いについては、
                <Link href="/privacy" className="text-[#F7941D] hover:underline">
                  プライバシーポリシー
                </Link>
                をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">第9条（準拠法・管轄裁判所）</h2>
              <p className="text-gray-700 leading-relaxed">
                本規約の解釈にあたっては日本法を準拠法とします。
                当サービスに関して紛争が生じた場合は、
                東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
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
