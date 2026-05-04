import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { DbChild, DbAssessment, DbPlan } from '@/types'
import PlanCancelButton from '@/components/PlanCancelButton'
import PlanDetailModal from '@/components/PlanDetailModal'

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 子ども一覧
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true })

  // 直近の診断（有料購入済みのみ表示）
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*, children(name)')
    .eq('parent_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5)

  // アクティブプラン
  const { data: plans } = await supabase
    .from('plans')
    .select('*, children(name)')
    .eq('parent_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビ */}
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1B2A4A]">Manabi Compass</h1>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-gray-500 hover:text-gray-700">ログアウト</button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">ダッシュボード</h2>

        {/* お子さん一覧 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-700">お子さん</h3>
            <Link
              href="/parent/children/add"
              className="text-sm text-[#F7941D] hover:underline"
            >
              + 追加
            </Link>
          </div>

          {children && children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(children as DbChild[]).map((child) => (
                <div key={child.id} className="bg-white rounded-xl shadow-sm p-5 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{child.name}</p>
                      <p className="text-sm text-gray-500">{child.grade}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F7941D] font-bold">
                      {child.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/parent/assessment/basic?childId=${child.id}`}
                      className="flex-1 text-center text-sm py-1.5 border border-[#F7941D] text-[#F7941D] rounded-lg hover:bg-[#FFF8F0]"
                    >
                      チェックする
                    </Link>
                    <Link
                      href={`/parent/children/${child.id}/progress`}
                      className="flex-1 text-center text-sm py-1.5 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F]"
                    >
                      進捗を見る
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border">
              <p className="text-gray-500 mb-4">まだお子さんが登録されていません</p>
              <Link
                href="/parent/children/add"
                className="inline-block px-6 py-2 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F]"
              >
                お子さんを追加する
              </Link>
            </div>
          )}
        </section>

        {/* 料金プラン CTA */}
        <section className="bg-[#FFF8F0] rounded-xl p-6 border border-[#F7941D]/20">
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-1">プランを選ぶ</h3>
          <p className="text-xs text-gray-500 mb-4">各プランの「詳しく見る」で機能の詳細を確認できます</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* くわしいチェック */}
            <div className="bg-white rounded-xl p-4 border flex flex-col">
              <div className="font-bold text-gray-800 mb-0.5">くわしいチェック</div>
              <div className="text-xl font-bold text-[#F7941D] mb-1">¥1,480</div>
              <p className="text-xs text-gray-400 mb-1">買い切り</p>
              <p className="text-xs text-gray-500 mb-4 flex-1">学習特性の詳細診断＋個別レポート生成</p>
              <PlanDetailModal planKey="basic_assessment" trigger={
                <button className="w-full text-sm py-2 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F] transition">
                  詳しく見る
                </button>
              } />
            </div>

            {/* 1週間お試し */}
            <div className="bg-white rounded-xl p-4 border flex flex-col">
              <div className="font-bold text-gray-800 mb-0.5">1週間お試し</div>
              <div className="text-xl font-bold text-[#F7941D] mb-1">¥980</div>
              <p className="text-xs text-gray-400 mb-1">7日間限定・自動継続なし</p>
              <p className="text-xs text-gray-500 mb-4 flex-1">マンスリーの全機能を1週間体験できます</p>
              <PlanDetailModal planKey="plan_30day" trigger={
                <button className="w-full text-sm py-2 border border-[#F7941D] text-[#F7941D] rounded-lg hover:bg-[#FFF8F0] transition">
                  詳しく見る
                </button>
              } />
            </div>

            {/* マンスリー */}
            <div className="bg-white rounded-xl p-4 border-2 border-[#F7941D] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-white text-xs font-bold px-3 py-0.5 rounded-full">おすすめ</div>
              <div className="font-bold text-gray-800 mb-0.5">１ヶ月継続プラン</div>
              <div className="text-xl font-bold text-[#F7941D] mb-1">¥2,450<span className="text-sm font-normal">/月</span></div>
              <p className="text-xs text-gray-400 mb-1">毎月自動更新</p>
              <p className="text-xs text-gray-500 mb-4 flex-1">AIアドバイス＋毎月プラン更新で継続サポート</p>
              <PlanDetailModal planKey="monthly" trigger={
                <button className="w-full text-sm py-2 bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F] transition">
                  詳しく見る
                </button>
              } />
            </div>

          </div>
        </section>

        {/* アクティブプラン */}
        {plans && plans.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3">📋 アクティブプラン</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(plans as (DbPlan & { children: { name: string } | null })[]).map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-5 border">
                  <Link
                    href={`/parent/plan/${p.id}`}
                    className="block hover:opacity-80 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-800">
                        {p.children?.name ?? '—'}の{p.type === '30day' ? '1週間お試し' : '１ヶ月継続'}プラン
                      </p>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        実施中
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {p.start_date && new Date(p.start_date).toLocaleDateString('ja-JP')} 〜{' '}
                      {p.end_date && new Date(p.end_date).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-[#F7941D] text-sm mt-2">プランを見る →</p>
                  </Link>
                  <PlanCancelButton planId={p.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 過去のレポート */}
        {assessments && assessments.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-700 mb-3">📄 過去のレポート</h3>
            <div className="space-y-3">
              {(assessments as (DbAssessment & { children: { name: string } | null })[]).map((a) => (
                <Link
                  key={a.id}
                  href={`/parent/report/${a.id}`}
                  className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border hover:border-[#F7941D] transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {a.children?.name ?? '—'}さんのレポート
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.type === 'basic' ? 'くわしいチェック' : 'かんたんチェック'} ·{' '}
                      {new Date(a.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        a.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {a.payment_status === 'paid' ? '閲覧可' : '購入で全表示'}
                    </span>
                    <span className="text-[#F7941D] text-sm">見る →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
