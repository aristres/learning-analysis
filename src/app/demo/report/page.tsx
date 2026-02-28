import Link from 'next/link'
import { DEMO_RESULT, DEMO_ANSWERS_JSON } from '@/lib/demo-data'

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

const LEVEL_COLORS: Record<string, string> = {
  low: 'bg-orange-100 text-orange-700',
  middle: 'bg-blue-100 text-blue-700',
  high: 'bg-green-100 text-green-700',
}

const LEVEL_LABELS: Record<string, string> = {
  low: '要サポート',
  middle: '平均的',
  high: '強み',
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
            ベーシック診断 · 2025/02/10
          </p>
        </div>

        {/* サマリー */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
            お子さんの特徴
          </h2>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>

        {/* ドメインスコア */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#2196F3] rounded-full" />
            領域別スコア
          </h2>
          <div className="space-y-3">
            {Object.entries(answersJson.domains).map(([key, domain]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{DOMAIN_LABELS[key] ?? key}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[domain.level]}`}
                  >
                    {LEVEL_LABELS[domain.level]}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#F7941D] h-2 rounded-full transition-all"
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400 mt-0.5">{domain.score}点</div>
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
