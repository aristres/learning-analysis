'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── デモ用モックデータ ──────────────────────────────────────────
const DEMO_CHILD = { name: '太郎', grade: '小4' }

const DEMO_QUESTIONS = [
  { q: '宿題に取り掛かるのにどれくらい時間がかかりますか？', a: 'いつも30分以上かかる' },
  { q: '先生の話を聞きながらノートを取れますか？', a: 'どちらか一方しかできない' },
  { q: '計算ミスはどれくらいありますか？', a: 'たまにある' },
  { q: '好きなことをしているときの集中力は？', a: 'とても集中できる' },
  { q: '漢字の書き取りは得意ですか？', a: 'あまり得意ではない' },
  { q: '一度に複数のことを頼むとどうなりますか？', a: '混乱しやすい' },
  { q: '特に得意・好きな教科は？', a: '算数・理科' },
  { q: '1日の学習時間はどれくらいですか？', a: '30〜60分' },
]

const FREE_RESULT = {
  summary:
    '太郎さんは、視覚的な情報を処理する力が高く、図や表を使った学習に力を発揮します。一方で、複数の手順を同時に…',
  strengths: [
    '視覚情報（図・イラスト）を素早く理解する力がある',
    '興味ある分野では高い集中力を維持できる',
    '一度覚えたルールを応用する力がある',
  ],
  strategies_count: 4,
}

const PAID_RESULT = {
  type_label: '見てわかるタイプ',
  type_emoji: '👁️',
  type_desc:
    '視覚的な情報（図・絵・文字）を通じて理解しやすい傾向があります。板書を写すことや、図解・動画を使った学習が合いやすいと考えられます。',
  summary:
    '太郎さんは、視覚的な情報を処理する力が特に高く、図や表を使った学習に大きな力を発揮します。一方で、複数の手順を頭の中に保持しながら作業を進めることに課題があり、一度に多くのことを求められると混乱しやすい傾向があります。学習習慣の面では、取りかかりの遅さが見られますが、始めてしまえば一定の集中力を保てるため、始めの一歩をサポートする工夫が効果的です。',
  domains: [
    { key: '集中のしやすさ', score: 45, level: 'middle' },
    { key: '手順の記憶',     score: 35, level: 'low' },
    { key: '作業スピード',   score: 50, level: 'middle' },
    { key: 'やる気・気持ち', score: 50, level: 'middle' },
    { key: '学習習慣',       score: 38, level: 'low' },
    { key: '感覚の特徴',     score: 75, level: 'high' },
    { key: '算数・計算',     score: 55, level: 'middle' },
    { key: '国語・漢字',     score: 35, level: 'low' },
  ],
  strengths: [
    '視覚情報（図表・イラスト・動画）を素早く理解し、記憶に残しやすい力がある',
    '興味のある分野（算数・理科）では集中を持続させることができる',
    '一度理解したルールやパターンを別の場面に応用する力がある',
  ],
  home_strategies: [
    '宿題は「やることリスト」を付箋3枚に分けて机に貼り、終わったら1枚ずつ剥がす',
    '学習の前に「今日は15分だけ」と短い目標時間を決め、タイマーを見える位置にセット',
    '計算ドリルは1ページを折り、「5問ずつクリア」方式にする',
    '漢字は「見る→なぞる→隠して書く→確認」の4ステップで1文字ずつ',
  ],
}

const DEMO_PLAN = {
  week_tasks: [
    '【月】宿題リストを付箋に書いてから取り組む',
    '【火】漢字4ステップ法を3文字チャレンジ',
    '【水】算数タイムアタック（5問×3セット）',
    '【木】音読は「どこで区切るか」を意識して1回',
    '【金】週の振り返り：できたことを3つ書き出す',
  ],
  today_homework: ['計算', '漢字（書き）', '音読'],
  homework_advice:
    '計算は時間を計ってゲーム感覚でやると集中できます。漢字は「見る→なぞる→隠す→書く」の4ステップで取り組みましょう。音読は区切りを意識しながら読むと理解力が上がります。今日も一緒に頑張りましょう！',
}

// ── ジャーニー定義 ──────────────────────────────────────────────
type Step = { id: string; label: string; duration: number }

const JOURNEYS: {
  id: string
  label: string
  icon: string
  color: string
  desc: string
  steps: Step[]
}[] = [
  {
    id: 'visitor',
    label: '来訪者',
    icon: '👀',
    color: 'from-gray-500 to-gray-600',
    desc: '未登録・未ログインのユーザーが最初に体験する流れ',
    steps: [
      { id: 'landing',      label: 'トップページ',       duration: 3000 },
      { id: 'free_q',       label: 'かんたんチェック（回答）', duration: 6000 },
      { id: 'free_result',  label: 'かんたんチェック結果', duration: 5000 },
      { id: 'cta',          label: '有料誘導CTA',        duration: 3000 },
    ],
  },
  {
    id: 'registered',
    label: '登録者',
    icon: '📝',
    color: 'from-blue-500 to-blue-600',
    desc: 'ログイン済みだが有料診断未購入のユーザー',
    steps: [
      { id: 'dashboard_free', label: 'ダッシュボード（無料）', duration: 3000 },
      { id: 'basic_start',    label: 'くわしいチェック開始',  duration: 3000 },
      { id: 'paywall',        label: '支払い画面',             duration: 4000 },
      { id: 'plan_upsell',    label: 'プラン紹介',             duration: 3000 },
    ],
  },
  {
    id: 'paid',
    label: '有料利用者',
    icon: '⭐',
    color: 'from-[#F7941D] to-[#E8850F]',
    desc: '有料診断を購入し、プランを活用しているユーザー',
    steps: [
      { id: 'dashboard_paid', label: 'ダッシュボード（有料）', duration: 3000 },
      { id: 'paid_report',    label: 'くわしいチェックレポート', duration: 6000 },
      { id: 'plan_page',      label: '学習プランページ',       duration: 5000 },
      { id: 'homework',       label: '宿題アドバイス',         duration: 4000 },
    ],
  },
]

// ── スクリーンレンダラー ──────────────────────────────────────────

function ScreenLanding() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 bg-gradient-to-b from-[#EEF2FF] to-white rounded-2xl">
      <div className="text-5xl mb-4">🧭</div>
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">マナビコンパス</h1>
      <p className="text-gray-500 mb-6 text-sm">お子さんの学習特性を8領域で分析。<br />家庭でできる具体的な手立てをご提案します。</p>
      <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-sm">
        {['📝 8問の無料チェック', '📊 学習特性を分析', '🏠 家庭での手立て提案'].map((t) => (
          <div key={t} className="bg-white rounded-xl p-3 shadow-sm text-xs text-gray-600 font-medium">{t}</div>
        ))}
      </div>
      <div className="w-full max-w-xs">
        <div className="bg-[#F7941D] text-white rounded-full py-3 px-6 font-bold text-sm shadow-md">
          かんたんチェックを始める（無料）
        </div>
        <p className="text-xs text-gray-400 mt-2">登録不要・約2分で完了</p>
      </div>
    </div>
  )
}

function ScreenFreeQ({ progress }: { progress: number }) {
  const idx = Math.min(Math.floor((progress / 100) * DEMO_QUESTIONS.length), DEMO_QUESTIONS.length - 1)
  const q = DEMO_QUESTIONS[idx]
  return (
    <div className="flex flex-col h-full px-6 py-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">質問 {idx + 1} / {DEMO_QUESTIONS.length}</span>
        <span className="text-xs text-[#F7941D] font-medium">かんたんチェック</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div className="bg-[#F7941D] h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / DEMO_QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="bg-[#F8FAFC] rounded-2xl p-5 mb-6 flex-1 flex flex-col justify-center">
        <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">{q.q}</p>
        <div className="space-y-2">
          {['ほとんどない', 'たまにある', idx < 4 ? q.a : 'いつもある', 'とてもよくある'].map((opt, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm border transition-all ${
                opt === q.a
                  ? 'bg-[#F7941D] text-white border-[#F7941D] font-medium'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenFreeResult() {
  return (
    <div className="flex flex-col h-full px-5 py-6 space-y-3 overflow-y-auto">
      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
        <div className="text-3xl mb-1">📊</div>
        <h2 className="font-bold text-[#1B2A4A]">かんたんチェック結果</h2>
        <p className="text-xs text-gray-400">{DEMO_CHILD.name}さん（{DEMO_CHILD.grade}）</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">お子さんの特徴（一部）</p>
        <p className="text-sm text-gray-700 leading-relaxed">{FREE_RESULT.summary}</p>
        <p className="text-xs text-[#F7941D] mt-2 font-medium">🔒 続きはくわしいチェックで確認できます</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">見つかった強み</p>
        <div className="flex items-start gap-2 mb-2">
          <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
          <span className="text-sm text-gray-700">{FREE_RESULT.strengths[0]}</span>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2 border border-dashed border-gray-200 flex items-center gap-2">
          <span>🔒</span>
          <span className="text-xs text-gray-400">他に <b className="text-gray-500">2個</b> の強みが見つかりました</span>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">家庭でできる手立て</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-2">
            <span>🔒</span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full" />
          </div>
        ))}
        <p className="text-xs text-center text-gray-400">くわしいチェックで{FREE_RESULT.strategies_count}個の手立てを確認</p>
      </div>
    </div>
  )
}

function ScreenCTA() {
  return (
    <div className="flex flex-col h-full justify-center px-6 py-8 space-y-4">
      <div className="text-center mb-2">
        <div className="text-4xl mb-3">🔓</div>
        <h2 className="text-xl font-bold text-[#1B2A4A]">くわしいチェックで<br />すべてが開示されます</h2>
      </div>
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2B4BAF] rounded-2xl p-5 text-white">
        <p className="font-bold mb-3">くわしいチェック（¥1,480）でできること</p>
        <ul className="space-y-2 text-sm">
          {[
            '📊 8領域スコアの完全開示＋レーダーチャート',
            '✅ 強み・つまずき傾向の詳細分析',
            '🏠 家庭でできる手立て4選',
            '🔢 算数・📖 国語の個別アドバイス',
            '📋 7日間学習プランの生成（オプション）',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-white/90">
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 bg-[#F7941D] rounded-xl py-3 text-center font-bold text-white shadow">
          くわしいチェックを始める（¥1,480）
        </div>
      </div>
    </div>
  )
}

function ScreenDashboardFree() {
  return (
    <div className="flex flex-col h-full px-5 py-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🧭</span>
        <span className="font-bold text-[#1B2A4A]">マナビコンパス</span>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs text-gray-400 mb-1">登録済みのお子さん</p>
        <p className="font-bold text-gray-800">{DEMO_CHILD.name}（{DEMO_CHILD.grade}）</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-3">無料診断の結果</p>
        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400 mb-2">かんたんチェック済み</p>
          <p className="text-xs text-gray-300">詳細レポートは有料で確認できます</p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] rounded-xl p-4 border border-[#F7941D]/20">
        <p className="text-sm font-bold text-[#1B2A4A] mb-2">📋 くわしいチェックで<br />詳細レポートを取得する</p>
        <div className="bg-[#F7941D] rounded-lg py-2 text-center text-white text-sm font-medium">
          くわしいチェックへ（¥1,480）
        </div>
      </div>
    </div>
  )
}

function ScreenBasicStart() {
  return (
    <div className="flex flex-col h-full px-6 py-8 space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-1">くわしいチェック</h2>
        <p className="text-xs text-gray-400">20問 / 所要時間：約5〜10分</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
        {['集中力・注意力（5問）', '記憶・情報処理（4問）', 'やる気・感情（4問）', '学習習慣（4問）', '教科別傾向（3問）'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-xs text-[#1B2A4A] font-bold">{i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#F7941D] text-white rounded-xl py-3 text-center font-bold">
        チェックを始める
      </div>
      <p className="text-xs text-center text-gray-400">※ 結果確認には¥1,480のお支払いが必要です</p>
    </div>
  )
}

function ScreenPaywall() {
  return (
    <div className="flex flex-col h-full justify-center px-6 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">続きを見るには購入が必要です</h3>
        <p className="text-sm text-gray-500 mb-4">領域別スコア・強み・手立てなど詳細レポートの全項目が閲覧できます</p>
        <div className="bg-[#FFF8F0] rounded-xl p-3 mb-4 text-left space-y-1">
          {['✓ 領域別スコアとレーダーチャート', '✓ 強み・のびしろ詳細分析', '✓ 家庭でできる手立て4選', '✓ 算数・国語の個別アドバイス'].map((t) => (
            <p key={t} className="text-xs text-gray-600">{t}</p>
          ))}
        </div>
        <div className="bg-[#F7941D] text-white rounded-xl py-3 font-bold">
          ¥1,480 で購入してレポートを見る
        </div>
        <p className="text-xs text-gray-400 mt-2">Stripe の安全な決済画面に遷移します</p>
      </div>
    </div>
  )
}

function ScreenPlanUpsell() {
  return (
    <div className="flex flex-col h-full px-5 py-6 space-y-3">
      <h2 className="font-bold text-[#1B2A4A]">プランで学習を継続サポート</h2>
      {[
        { name: '1週間お試しプラン', price: '¥980', duration: '7日間', features: ['宿題アドバイス機能', '日次ログ記録', '7日間の学習プラン'] },
        { name: '１ヶ月継続プラン', price: '¥2,450/月', duration: '30日間', features: ['1週間の全機能', '診断何度でも無料', '月次成長レポート', 'AI学習相談'] },
      ].map((plan) => (
        <div key={plan.name} className={`bg-white rounded-xl p-4 shadow-sm border ${plan.name.includes('月') ? 'border-[#F7941D]' : 'border-gray-100'}`}>
          {plan.name.includes('月') && <span className="text-xs bg-[#F7941D] text-white px-2 py-0.5 rounded-full font-medium">おすすめ</span>}
          <p className="font-bold text-gray-800 mt-1">{plan.name}</p>
          <p className="text-xl font-bold text-[#F7941D]">{plan.price}</p>
          <p className="text-xs text-gray-400 mb-2">{plan.duration}間利用可能</p>
          <ul className="space-y-1">
            {plan.features.map((f) => <li key={f} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span>{f}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ScreenDashboardPaid() {
  return (
    <div className="flex flex-col h-full px-5 py-6 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🧭</span>
        <span className="font-bold text-[#1B2A4A]">マナビコンパス</span>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">太</div>
          <div>
            <p className="font-bold text-gray-800">{DEMO_CHILD.name}（{DEMO_CHILD.grade}）</p>
            <p className="text-xs text-gray-400">くわしいチェック済み ✅</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] rounded-xl p-4 text-white">
        <p className="text-xs text-white/60 mb-1">学習タイプ</p>
        <p className="font-bold text-lg">👁️ 見てわかるタイプ</p>
        <p className="text-xs text-white/70 mt-1">視覚優位・図解学習が効果的</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">レポート</p>
          <p className="text-sm font-bold text-[#F7941D]">閲覧可能 ✅</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">アクティブプラン</p>
          <p className="text-sm font-bold text-green-600">1週間お試し</p>
        </div>
      </div>
    </div>
  )
}

function ScreenPaidReport() {
  const colorMap: Record<string, string> = { high: 'bg-green-500', middle: 'bg-blue-400', low: 'bg-orange-400' }
  const widthMap: Record<string, string> = { high: '85%', middle: '55%', low: '25%' }
  return (
    <div className="flex flex-col h-full px-5 py-4 space-y-3 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] rounded-xl p-4 text-white">
        <p className="text-white/60 text-xs mb-1">学習タイプ</p>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{PAID_RESULT.type_emoji}</span>
          <span className="text-xl font-bold">{PAID_RESULT.type_label}</span>
        </div>
        <p className="text-xs text-white/70 mt-2 leading-relaxed">{PAID_RESULT.type_desc}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">8領域の学習特性マップ</p>
        {PAID_RESULT.domains.map((d) => (
          <div key={d.key} className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{d.key}</span>
              <span className="font-bold">{d.score}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`${colorMap[d.level]} h-2 rounded-full`} style={{ width: widthMap[d.level] }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <p className="text-xs font-bold text-green-800 mb-2">家庭でできる手立て</p>
        {PAID_RESULT.home_strategies.map((s, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="text-green-600 font-bold text-sm mt-0.5">→</span>
            <span className="text-xs text-gray-700">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenPlanPage() {
  const today = new Date().getDay()
  const dayIndex = today === 0 ? 4 : Math.min(today - 1, 4)
  return (
    <div className="flex flex-col h-full px-5 py-4 space-y-3 overflow-y-auto">
      <div>
        <p className="text-xs text-gray-400">1週間お試しプラン</p>
        <h2 className="font-bold text-[#1B2A4A]">{DEMO_CHILD.name}さんの学習プラン</h2>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-2">今週のタスク</p>
        {DEMO_PLAN.week_tasks.map((t, i) => (
          <div key={i} className={`flex items-start gap-2 mb-2 p-2 rounded-lg ${i === dayIndex ? 'bg-[#FFF3E0] border border-[#F7941D]/30' : ''}`}>
            <span className={`text-base ${i < dayIndex ? '✅' : i === dayIndex ? '▶️' : '⬜'}`}>
              {i < dayIndex ? '✅' : i === dayIndex ? '▶️' : '⬜'}
            </span>
            <span className={`text-xs ${i === dayIndex ? 'text-[#1B2A4A] font-medium' : 'text-gray-600'}`}>{t}</span>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs font-bold text-blue-800 mb-2">💪 今日のメッセージ</p>
        <p className="text-xs text-gray-700">毎日少しずつの積み重ねが、大きな力になります。今日もお子さんの頑張りを見守ってあげてください！</p>
      </div>
    </div>
  )
}

function ScreenHomework() {
  return (
    <div className="flex flex-col h-full px-5 py-4 space-y-3">
      <p className="text-xs font-bold text-gray-500">今日の宿題を選択</p>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_PLAN.today_homework.map((hw, i) => (
          <div
            key={hw}
            className={`rounded-xl p-2 text-center text-xs font-medium border ${
              i < 2 ? 'bg-[#F7941D] text-white border-[#F7941D]' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {hw}
          </div>
        ))}
        {['作文', '日記', 'その他'].map((hw) => (
          <div key={hw} className="rounded-xl p-2 text-center text-xs font-medium border bg-white text-gray-400 border-gray-100">
            {hw}
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex-1">
        <p className="text-xs font-bold text-blue-800 mb-2">🤖 AIアドバイス</p>
        <p className="text-xs text-gray-700 leading-relaxed">{DEMO_PLAN.homework_advice}</p>
      </div>
    </div>
  )
}

// ── スクリーンマッピング ────────────────────────────────────────

function renderScreen(stepId: string, progress: number) {
  switch (stepId) {
    case 'landing':          return <ScreenLanding />
    case 'free_q':           return <ScreenFreeQ progress={progress} />
    case 'free_result':      return <ScreenFreeResult />
    case 'cta':              return <ScreenCTA />
    case 'dashboard_free':   return <ScreenDashboardFree />
    case 'basic_start':      return <ScreenBasicStart />
    case 'paywall':          return <ScreenPaywall />
    case 'plan_upsell':      return <ScreenPlanUpsell />
    case 'dashboard_paid':   return <ScreenDashboardPaid />
    case 'paid_report':      return <ScreenPaidReport />
    case 'plan_page':        return <ScreenPlanPage />
    case 'homework':         return <ScreenHomework />
    default:                 return null
  }
}

// ── メインコンポーネント ────────────────────────────────────────

export default function DemoPage() {
  const [activeJourney, setActiveJourney] = useState(0)
  const [activeStep, setActiveStep]       = useState(0)
  const [progress, setProgress]           = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)

  const journey = JOURNEYS[activeJourney]
  const step    = journey.steps[activeStep]

  // ステップ内のプログレス（0→100）を刻み、完了で次へ
  const tick = useCallback(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        // 次のステップへ
        setActiveStep((s) => {
          if (s + 1 < journey.steps.length) return s + 1
          setIsPlaying(false)
          return s
        })
        return 0
      }
      return prev + 2 // 50ms × 50回 = 100% で duration に近似
    })
  }, [journey.steps.length])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(tick, step.duration / 50)
    return () => clearInterval(interval)
  }, [isPlaying, step.duration, tick])

  const handlePlay = () => {
    setActiveStep(0)
    setProgress(0)
    setIsPlaying(true)
  }

  const handleJourneySwitch = (idx: number) => {
    setActiveJourney(idx)
    setActiveStep(0)
    setProgress(0)
    setIsPlaying(false)
  }

  const handleStepClick = (idx: number) => {
    setActiveStep(idx)
    setProgress(0)
    setIsPlaying(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <h1 className="text-lg font-bold">ユーザー体験デモ</h1>
            <p className="text-white/50 text-xs">各ユーザータイプの画面フローを確認</p>
          </div>
        </div>
        <Link href="/admin" className="text-white/60 hover:text-white text-sm transition">
          ← 管理画面へ
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ジャーニータブ */}
        <div className="flex gap-3 mb-6">
          {JOURNEYS.map((j, i) => (
            <button
              key={j.id}
              onClick={() => handleJourneySwitch(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                activeJourney === i
                  ? `bg-gradient-to-r ${j.color} text-white shadow-md`
                  : 'bg-white text-gray-600 shadow-sm hover:shadow-md'
              }`}
            >
              <span className="text-lg">{j.icon}</span>
              {j.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* 左：ステップリスト + コントロール */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 mb-1">
                {journey.icon} {journey.label}のジャーニー
              </p>
              <p className="text-xs text-gray-400 mb-4">{journey.desc}</p>

              {/* ステップリスト */}
              <div className="space-y-2">
                {journey.steps.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(i)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                      activeStep === i
                        ? 'bg-[#F7941D]/10 border border-[#F7941D]/30 font-medium text-[#F7941D]'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      activeStep === i
                        ? 'bg-[#F7941D] text-white'
                        : i < activeStep
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < activeStep ? '✓' : i + 1}
                    </span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* 再生コントロール */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
                    isPlaying
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-[#F7941D] text-white hover:bg-[#E8850F] shadow-md'
                  }`}
                >
                  {isPlaying ? '⏸ 一時停止' : '▶ デモ開始'}
                </button>
                <button
                  onClick={() => { setActiveStep(0); setProgress(0); setIsPlaying(false) }}
                  className="px-3 py-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition text-sm"
                >
                  ↺
                </button>
              </div>

              {/* ステップ内プログレス */}
              {isPlaying && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{step.label}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#F7941D] h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 凡例 */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-2">📌 このデモについて</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                実際のサービスと同じUIをモックデータで再現しています。
                「デモ開始」で自動進行、各ステップボタンで手動移動ができます。
              </p>
            </div>
          </div>

          {/* 右：スマホプレビュー */}
          <div className="md:col-span-3 flex justify-center items-start">
            <div className="relative">
              {/* スマホフレーム */}
              <div className="w-[320px] bg-white rounded-[36px] shadow-2xl border-4 border-gray-200 overflow-hidden">
                {/* ステータスバー */}
                <div className="bg-gray-800 px-6 py-2 flex justify-between items-center">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs">●●●</span>
                  </div>
                </div>
                {/* ステップラベル */}
                <div className={`bg-gradient-to-r ${journey.color} px-4 py-1.5 text-center`}>
                  <span className="text-white text-xs font-medium">
                    {journey.icon} {step.label}
                  </span>
                </div>
                {/* コンテンツエリア */}
                <div className="h-[560px] overflow-hidden bg-[#F8FAFC]">
                  <div key={`${activeJourney}-${activeStep}`} className="animate-fade-in h-full">
                    {renderScreen(step.id, progress)}
                  </div>
                </div>
                {/* ホームバー */}
                <div className="bg-white py-2 flex justify-center">
                  <div className="w-24 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
