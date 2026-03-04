import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | KIDDO Insight',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-6">プライバシーポリシー</h1>
          <p className="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>

          <div className="prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">1. 事業者情報</h2>
              <p className="text-gray-700 leading-relaxed">
                KIDDO Insight（以下「当サービス」）は、お子さまの学習特性を分析し、
                家庭での学習支援に役立つ情報を提供するサービスです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">2. 収集する情報</h2>
              <p className="text-gray-700 leading-relaxed">当サービスでは以下の情報を収集します。</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>メールアドレス（アカウント作成時）</li>
                <li>お子さまのニックネーム・学年</li>
                <li>診断質問への回答データ</li>
                <li>お支払い情報（Stripe経由で処理、当サービスではカード情報を保持しません）</li>
                <li>アクセスログ・利用状況（Vercel Analytics）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">3. 情報の利用目的</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>学習特性の分析・レポートの生成</li>
                <li>個別最適化された学習プランの作成</li>
                <li>サービスの改善・新機能の開発</li>
                <li>お問い合わせへの対応</li>
                <li>利用規約違反への対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">4. AIによるデータ処理</h2>
              <p className="text-gray-700 leading-relaxed">
                診断回答データは、OpenAI社のAPIを利用してAI分析を行います。
                送信されるデータにはお子さまの氏名・個人を特定できる情報は含まれず、
                学年と回答内容のみが処理されます。
                OpenAI社のプライバシーポリシーに基づき、API経由のデータはモデルの学習には使用されません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">5. 第三者提供</h2>
              <p className="text-gray-700 leading-relaxed">
                以下の場合を除き、収集した個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                <li>ご本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>サービス提供に必要な業務委託先（Supabase、Stripe、OpenAI、Vercel）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">6. データの保管・削除</h2>
              <p className="text-gray-700 leading-relaxed">
                お客様のデータはSupabase（クラウドデータベース）に保管されます。
                アカウント削除をご希望の場合は、お問い合わせいただければ
                関連データを速やかに削除いたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">7. Cookie の利用</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスでは、認証状態の維持およびアクセス解析のためにCookieを使用します。
                ブラウザの設定でCookieを無効にすることも可能ですが、
                一部のサービスが正常に動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">8. 免責事項</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスで提供する分析結果・アドバイスは、医療診断や専門的な発達検査に代わるものではありません。
                お子さまの発達にご心配がある場合は、専門機関への相談をお勧めいたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">9. お問い合わせ</h2>
              <p className="text-gray-700 leading-relaxed">
                プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">10. ポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                本ポリシーは必要に応じて改定されることがあります。
                重要な変更がある場合は、サービス上でお知らせいたします。
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
