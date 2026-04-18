import Link from 'next/link'
import { DEMO_RESULT, DEMO_ANSWERS_JSON } from '@/lib/demo-data'
import type { SubTag } from '@/types'

const DOMAIN_LABELS: Record<string, string> = {
  attention: '集中のしやすさ',
  working_memory: '手順の記憶',
  processing_speed: '作業スピード',
  motivation_emotion: 'やる気・気持ち',
  study_habits: '学習習慣',
  sensory: '感覚の特徴',
  math_calculation: '算数・計算',
  kanji_literacy: '国語・漢字',
}

const LEVEL_BAR_COLORS: Record<string, string> = {
  low: 'bg-orange-400',
  middle: 'bg-blue-400',
  high: 'bg-green-500',
}

const LEVEL_BADGE_COLORS: Record<string, string> = {
  low: 'bg-orange-100 text-orange-700',
  middle: 'bg-blue-100 text-blue-700',
  high: 'bg-green-100 text-green-700',
}

const LEVEL_LABELS: Record<string, string> = {
  low: 'のびしろ',
  middle: '標準的',
  high: '強み',
}

const TYPE_EMOJI: Record<string, string> = {
  visual: '👁️',
  auditory: '👂',
  kinesthetic: '🤲',
  reflective: '🧠',
  intuitive: '⚡',
  systematic: '📋',
}

const SUB_TAG_LABELS: Record<SubTag, string> = {
  needs_attention_support: '集中の手立てが役立つ',
  strong_working_memory: '記憶・手順が得意',
  needs_emotional_support: '気持ちのサポートが効果的',
  visual_strength: '視覚情報が得意',
  sound_sensitive: '音の多い環境が苦手な傾向',
  math_strength: '算数が得意',
  language_strength: '国語・読解が得意',
  needs_routine_support: 'リズムづくりがのびしろ',
  self_starter: '自分から始める力◎',
  emotionally_resilient: '気持ちが安定している',
}

const SUB_TAG_COLORS: Record<SubTag, string> = {
  needs_attention_support: 'bg-orange-100 text-orange-700',
  strong_working_memory: 'bg-green-100 text-green-700',
  needs_emotional_support: 'bg-purple-100 text-purple-700',
  visual_strength: 'bg-blue-100 text-blue-700',
  sound_sensitive: 'bg-yellow-100 text-yellow-700',
  math_strength: 'bg-green-100 text-green-700',
  language_strength: 'bg-blue-100 text-blue-700',
  needs_routine_support: 'bg-orange-100 text-orange-700',
  self_starter: 'bg-green-100 text-green-700',
  emotionally_resilient: 'bg-teal-100 text-teal-700',
}

export default function DemoReportPage() {
  const result = DEMO_RESULT
  const answersJson = DEMO_ANSWERS_JSON
  const child = { name: '太郎', grade: '小4' }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* デモバッジ */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            DEMO MODE
          </span>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FFF8F0] mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">学習特性レポート</h1>
          <p className="text-gray-500">
            {child.name}さん（{child.grade}）
          </p>
          <p className="text-xs text-gray-400 mt-1">
            くわしいチェック · 2025/02/10
          </p>
        </div>

        {/* v2 TypeBanner */}
        {result.v2?.learning_type && (
          <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] rounded-2xl shadow-md p-6 text-white">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">学習タイプ</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{TYPE_EMOJI[result.v2.learning_type.primary_type] ?? '📚'}</span>
              <h2 className="text-2xl font-bold">{result.v2.learning_type.type_label}</h2>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {result.v2.learning_type.type_description}
            </p>
            {result.v2.learning_type.sub_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.v2.learning_type.sub_tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${SUB_TAG_COLORS[tag]}`}
                  >
                    {SUB_TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
            )}
            <p className="text-white/40 text-xs mt-4 leading-relaxed">
              {result.v2.learning_type.modality_note}
            </p>
          </div>
        )}

        {/* サマリー */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
            お子さんの特徴
          </h2>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>

        {/* 領域別の傾向（スコア数値なし） */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#2196F3] rounded-full" />
            領域別の傾向
          </h2>
          <div className="space-y-3">
            {Object.entries(answersJson.domains).map(([key, domain]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{DOMAIN_LABELS[key] ?? key}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_BADGE_COLORS[domain.level]}`}>
                    {LEVEL_LABELS[domain.level]}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${LEVEL_BAR_COLORS[domain.level]} h-2 rounded-full transition-all`}
                    style={{ width: domain.level === 'low' ? '25%' : domain.level === 'middle' ? '55%' : '85%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 強み */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#43A047] rounded-full" />
            強み
          </h2>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#43A047] font-bold mt-0.5">✓</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* つまずきやすい傾向 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-400 rounded-full" />
            つまずきやすい傾向
          </h2>
          <ul className="space-y-2">
            {result.weaknesses.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">△</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 困りやすい場面 */}
        <div className="bg-amber-50 rounded-2xl shadow-md p-6 border border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-3">困りやすい場面</h2>
          <ul className="space-y-2">
            {result.risk_situations.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 家庭での手立て */}
        <div className="bg-green-50 rounded-2xl shadow-md p-6 border border-green-200">
          <h2 className="text-lg font-bold text-green-800 mb-3">今日から使える手立て</h2>
          <ul className="space-y-2">
            {result.home_strategies.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">→</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 算数・計算の手立て */}
        {result.math_strategies && result.math_strategies.length > 0 && (
          <div className="bg-orange-50 rounded-2xl shadow-md p-6 border border-orange-200">
            <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🔢</span>
              算数・計算の手立て
            </h2>
            <ul className="space-y-2">
              {result.math_strategies.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold mt-0.5">→</span>
                  <span className="text-gray-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 国語・漢字の手立て */}
        {result.japanese_strategies && result.japanese_strategies.length > 0 && (
          <div className="bg-blue-50 rounded-2xl shadow-md p-6 border border-blue-200">
            <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-xl">✏️</span>
              国語・漢字の手立て
            </h2>
            <ul className="space-y-2">
              {result.japanese_strategies.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">→</span>
                  <span className="text-gray-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 学習スタイル */}
        <div className="bg-blue-50 rounded-2xl shadow-md p-6 border border-[#2196F3]/30">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">
            学習スタイル：{result.study_style.type}
          </h2>
          <p className="text-gray-700">{result.study_style.description}</p>
        </div>

        <div className="text-center pb-8">
          <Link href="/demo/dashboard" className="text-[#F7941D] hover:underline text-sm">
            ダッシュボードへ戻る
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link href="/demo" className="text-gray-500 hover:underline text-sm">
            デモ一覧
          </Link>
        </div>
      </div>
    </div>
  )
}
