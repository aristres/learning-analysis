import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 管理者メールアドレス一覧
const ADMIN_EMAILS = ['sanaesuzuki16@gmail.com']

// 外部ダッシュボードリンク
const EXTERNAL_LINKS = [
  {
    label: 'Stripe ダッシュボード',
    desc: '決済・売上・サブスクリプション管理',
    href: 'https://dashboard.stripe.com/',
    icon: '💳',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    label: 'OpenAI ダッシュボード',
    desc: 'API使用量・コスト・モデル管理',
    href: 'https://platform.openai.com/usage',
    icon: '🤖',
    color: 'from-green-500 to-green-600',
  },
  {
    label: 'Supabase ダッシュボード',
    desc: 'DB・認証・ストレージ管理',
    href: 'https://supabase.com/dashboard',
    icon: '🗄️',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    label: 'Vercel ダッシュボード',
    desc: 'デプロイ・ログ・Analytics管理',
    href: 'https://vercel.com/dashboard',
    icon: '▲',
    color: 'from-gray-700 to-gray-900',
  },
]

export default async function AdminPage() {
  // ── 認証チェック ──────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/parent/dashboard')
  }

  // ── データ取得（service role で RLS バイパス） ──
  const admin = createAdminClient()

  const [
    assessmentsResult,
    freeResult,
    paidResult,
    allPlansResult,
    trialPlansResult,
    monthlyPlansResult,
    recentAssessmentsResult,
    recentPlansResult,
    allParentIdsResult,
    inquiriesResult,
    newInquiriesCountResult,
  ] = await Promise.all([
    admin.from('assessments').select('*', { count: 'exact', head: true }),
    admin.from('assessments').select('*', { count: 'exact', head: true }).eq('type', 'free'),
    admin.from('assessments').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
    admin.from('plans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('plans').select('*', { count: 'exact', head: true }).eq('type', '30day').eq('status', 'active'),
    admin.from('plans').select('*', { count: 'exact', head: true }).eq('type', 'monthly').eq('status', 'active'),
    admin.from('assessments')
      .select('id, type, payment_status, status, created_at, children(name, grade)')
      .order('created_at', { ascending: false })
      .limit(15),
    admin.from('plans')
      .select('id, type, status, end_date, created_at, children(name, grade)')
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('assessments').select('parent_id'),
    admin.from('contact_inquiries')
      .select('id, name, email, category, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    admin.from('contact_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  // ユニークユーザー数（診断を1回でも行ったことがあるユーザー）
  const uniqueUserCount = new Set(
    (allParentIdsResult.data ?? []).map((a) => a.parent_id)
  ).size

  const stats = {
    totalAssessments: assessmentsResult.count ?? 0,
    freeAssessments: freeResult.count ?? 0,
    paidAssessments: paidResult.count ?? 0,
    activePlans: allPlansResult.count ?? 0,
    trialPlans: trialPlansResult.count ?? 0,
    monthlyPlans: monthlyPlansResult.count ?? 0,
    uniqueUsers: uniqueUserCount,
  }

  const recentAssessments = (recentAssessmentsResult.data ?? []) as unknown as {
    id: string
    type: string
    payment_status: string
    status: string
    created_at: string
    children: { name: string; grade: string } | null
  }[]

  const recentPlans = (recentPlansResult.data ?? []) as unknown as {
    id: string
    type: string
    status: string
    end_date: string | null
    created_at: string
    children: { name: string; grade: string } | null
  }[]

  const inquiries = (inquiriesResult.data ?? []) as {
    id: string
    name: string
    email: string
    category: string
    message: string
    status: string
    created_at: string
  }[]
  const newInquiriesCount = newInquiriesCountResult.count ?? 0

  const CATEGORY_LABELS: Record<string, string> = {
    payment:   '💳 お支払い',
    report:    '📊 診断・レポート',
    plan:      '📋 プラン',
    technical: '⚙️ 技術的不具合',
    other:     '💬 その他',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
            <p className="text-white/50 text-xs">マナビコンパス 管理画面</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/demo"
            className="px-4 py-2 bg-[#F7941D] text-white rounded-lg text-sm font-medium hover:bg-[#E8850F] transition"
          >
            🎬 デモを見る
          </Link>
          <Link
            href="/parent/dashboard"
            className="text-white/60 hover:text-white text-sm transition"
          >
            ← ユーザー画面へ
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── KPIカード ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            サービス概況
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'ユニークユーザー', value: stats.uniqueUsers, icon: '👤', note: '診断実施ユーザー', color: 'text-blue-600' },
              { label: '無料診断', value: stats.freeAssessments, icon: '📝', note: '合計実施回数', color: 'text-gray-600' },
              { label: '有料診断', value: stats.paidAssessments, icon: '💰', note: '累計購入回数', color: 'text-green-600' },
              { label: 'アクティブプラン', value: stats.activePlans, icon: '📋', note: `試用${stats.trialPlans} / 月次${stats.monthlyPlans}`, color: 'text-purple-600' },
              { label: '未返信のお問い合わせ', value: newInquiriesCount, icon: '✉️', note: '要対応', color: newInquiriesCount > 0 ? 'text-red-500' : 'text-gray-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 外部リンク ── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            外部ダッシュボード
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gradient-to-br ${link.color} rounded-xl p-5 text-white hover:opacity-90 transition group`}
              >
                <div className="text-3xl mb-2">{link.icon}</div>
                <p className="font-bold text-sm">{link.label}</p>
                <p className="text-white/70 text-xs mt-1">{link.desc}</p>
                <p className="text-white/50 text-xs mt-2 group-hover:text-white/80 transition">
                  外部で開く →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* ── 診断一覧 ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              最近の診断（直近15件）
            </h2>
            <span className="text-xs text-gray-400">
              合計 {stats.totalAssessments} 件
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['お子さん', '種別', '状態', '支払', '実施日'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAssessments.map((a) => {
                  const child = a.children
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {child ? `${child.name}（${child.grade}）` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.type === 'basic'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {a.type === 'basic' ? 'くわしい' : 'かんたん'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.status === 'completed' ? '完了' : '進行中'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${
                          a.payment_status === 'paid'
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}>
                          {a.payment_status === 'paid' ? '¥1,480 済' : '無料'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(a.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  )
                })}
                {recentAssessments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      診断データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── プラン一覧 ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              プラン利用状況（直近10件）
            </h2>
            <span className="text-xs text-gray-400">
              アクティブ {stats.activePlans} 件
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['お子さん', 'プラン', '状態', '終了日', '購入日'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPlans.map((p) => {
                  const child = p.children
                  const isExpired = p.end_date
                    ? p.end_date < new Date().toISOString().split('T')[0]
                    : false
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {child ? `${child.name}（${child.grade}）` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.type === 'monthly'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {p.type === 'monthly' ? '１ヶ月継続' : '1週間お試し'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === 'active' && !isExpired
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'cancelled'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.status === 'active' && !isExpired
                            ? 'アクティブ'
                            : p.status === 'cancelled'
                            ? '解約済'
                            : '期限切れ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.end_date
                          ? new Date(p.end_date).toLocaleDateString('ja-JP')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  )
                })}
                {recentPlans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                      プランデータがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── お問い合わせ一覧 ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              お問い合わせ一覧（直近20件）
            </h2>
            <div className="flex items-center gap-2">
              {newInquiriesCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  未返信 {newInquiriesCount}件
                </span>
              )}
              <a
                href="/contact"
                target="_blank"
                className="text-xs text-gray-400 hover:text-gray-600 underline transition"
              >
                フォームを確認 →
              </a>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
              お問い合わせはまだありません
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                    inq.status === 'new'
                      ? 'border-red-400'
                      : inq.status === 'replied'
                      ? 'border-green-400'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          inq.status === 'new'
                            ? 'bg-red-100 text-red-600'
                            : inq.status === 'replied'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {inq.status === 'new' ? '未返信' : inq.status === 'replied' ? '返信済' : 'クローズ'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {CATEGORY_LABELS[inq.category] ?? inq.category}
                        </span>
                        <span className="text-xs text-gray-300">
                          {new Date(inq.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-0.5">
                        {inq.name}
                        <span className="text-gray-400 font-normal ml-2 text-xs">{inq.email}</span>
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{inq.message}</p>
                    </div>
                    <a
                      href={`mailto:${inq.email}?subject=【マナビコンパス】お問い合わせへのご返信&body=%0A%0A------%0A${encodeURIComponent(inq.name)}様のお問い合わせ内容：%0A${encodeURIComponent(inq.message)}`}
                      className="flex-shrink-0 px-3 py-1.5 text-xs bg-[#F7941D] text-white rounded-lg hover:bg-[#E8850F] transition font-medium"
                    >
                      返信する
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* フッター */}
        <div className="text-center text-xs text-gray-300 pb-4">
          管理者専用ページ — {user.email}
        </div>
      </div>
    </div>
  )
}
