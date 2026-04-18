'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DEMO_CHILD_SELF_RESULT } from '@/lib/demo-data'
import type { ChildSelfResult } from '@/types'

// =============================================
// 子ども向け自己診断の質問（8問）
// =============================================

const QUESTIONS = [
  {
    key: 'S1', emoji: '📖',
    label: 'べんきょうのとき、どうやるとわかりやすい？',
    options: [
      { label: '絵や図を見る', value: 'visual', emoji: '🖼️' },
      { label: '声に出して読む', value: 'auditory', emoji: '🗣️' },
      { label: '自分で書いてみる', value: 'kinesthetic', emoji: '✍️' },
    ],
  },
  {
    key: 'S2', emoji: '⏰',
    label: 'しゅくだいを始めるとき、どんな気持ち？',
    options: [
      { label: 'すぐやりたい！', value: 3, emoji: '🚀' },
      { label: 'まあいいか', value: 2, emoji: '😐' },
      { label: 'やりたくない…', value: 1, emoji: '😩' },
    ],
  },
  {
    key: 'S3', emoji: '🔢',
    label: '算数の計算もんだい、どう思う？',
    options: [
      { label: 'すき！', value: 3, emoji: '😄' },
      { label: 'ふつう', value: 2, emoji: '🙂' },
      { label: 'にがて…', value: 1, emoji: '😣' },
    ],
  },
  {
    key: 'S4', emoji: '✏️',
    label: '漢字をおぼえるのは？',
    options: [
      { label: 'とくい！', value: 3, emoji: '💪' },
      { label: 'ふつう', value: 2, emoji: '🙂' },
      { label: 'にがて…', value: 1, emoji: '😥' },
    ],
  },
  {
    key: 'S5', emoji: '🎯',
    label: 'べんきょう中、どのくらい集中できる？',
    options: [
      { label: 'ずっと集中できる', value: 3, emoji: '🧘' },
      { label: 'ときどき気が散る', value: 2, emoji: '🦋' },
      { label: 'すぐ他のことを考えちゃう', value: 1, emoji: '💭' },
    ],
  },
  {
    key: 'S6', emoji: '📝',
    label: 'やることがたくさんあるとき、どうする？',
    options: [
      { label: 'じゅんばんを決める', value: 3, emoji: '📋' },
      { label: 'とりあえず始める', value: 2, emoji: '🏃' },
      { label: 'なにからやるかまよう', value: 1, emoji: '🤯' },
    ],
  },
  {
    key: 'S7', emoji: '💡',
    label: 'わからないもんだいがあったらどうする？',
    options: [
      { label: 'もう一回やってみる', value: 3, emoji: '🔄' },
      { label: 'だれかに聞く', value: 2, emoji: '🙋' },
      { label: 'あきらめちゃう', value: 1, emoji: '😔' },
    ],
  },
  {
    key: 'S8', emoji: '🌟',
    label: 'じぶんのいいところは？（一番近いものをえらんでね）',
    options: [
      { label: 'がんばりやさん', value: 'effort', emoji: '💪' },
      { label: 'ひらめきがすごい', value: 'creative', emoji: '✨' },
      { label: 'ていねいにできる', value: 'careful', emoji: '🎨' },
      { label: 'やさしい', value: 'kind', emoji: '💗' },
    ],
  },
]

// =============================================
// 結果表示コンポーネント
// =============================================

function ResultPage({ result, onRetry }: { result: ChildSelfResult; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-md mx-auto space-y-5">
        {/* デモバッジ */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            DEMO MODE
          </span>
        </div>

        {/* 学習タイプ */}
        <div className="bg-gradient-to-br from-[#2B4BAF] to-[#3D6DD4] rounded-2xl shadow-lg p-6 text-center text-white">
          <div className="text-6xl mb-3">{result.learning_type.emoji}</div>
          <h1 className="text-2xl font-bold mb-2">きみは…</h1>
          <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-xl font-bold mb-3">
            {result.learning_type.type}
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            {result.learning_type.description}
          </p>
        </div>

        {/* きみのすごいところ */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            きみのすごいところ
          </h2>
          <ul className="space-y-3">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-3">
                <span className="text-green-500 text-xl mt-0.5">✓</span>
                <span className="text-gray-700 font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* やってみよう！ */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            やってみよう！
          </h2>
          <ul className="space-y-3">
            {result.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
                <span className="text-[#2196F3] font-bold text-lg mt-0.5">{i + 1}</span>
                <span className="text-gray-700">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 今週のチャレンジ */}
        <div className="bg-[#FFF8F0] rounded-2xl shadow-md p-6 border-2 border-[#F7941D]/30">
          <h2 className="text-lg font-bold text-[#F7941D] mb-2 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            今週のチャレンジ
          </h2>
          <p className="text-gray-700 font-medium text-lg leading-relaxed">
            {result.challenge}
          </p>
        </div>

        {/* ナビ */}
        <div className="text-center pb-8 space-y-3">
          <button
            onClick={onRetry}
            className="block w-full py-3 rounded-full bg-[#F7941D] text-white font-bold hover:bg-[#E8850F] transition"
          >
            もういちどやる
          </button>
          <div>
            <Link href="/demo/child/daily-log" className="text-[#F7941D] hover:underline text-sm">
              今日のきろくをつける
            </Link>
            <span className="mx-3 text-gray-300">|</span>
            <Link href="/demo" className="text-gray-500 hover:underline text-sm">
              デモ一覧
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// メインページ
// =============================================

export default function DemoChildSelfDiscoveryPage() {
  const [currentQ, setCurrentQ] = useState(-1) // -1 = 開始画面
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [result, setResult] = useState<ChildSelfResult | null>(null)

  // 開始画面
  if (currentQ === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F8FAFC] flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm">
          {/* デモバッジ */}
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full mb-6">
            DEMO MODE
          </span>

          <div className="text-7xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-[#1B2A4A] mb-3">
            じぶんの学び方を<br />発見しよう！
          </h1>
          <p className="text-gray-500 mb-2">
            8つのかんたんなしつもんに答えて、<br />
            じぶんの「とくい」を見つけよう
          </p>
          <p className="text-sm text-gray-400 mb-8">
            ⏱️ 2分くらいでおわるよ
          </p>
          <button
            onClick={() => setCurrentQ(0)}
            className="w-full py-4 bg-[#F7941D] text-white text-xl font-bold rounded-2xl hover:bg-[#E8850F] transition shadow-lg shadow-[#F7941D]/30 active:scale-95"
          >
            はじめる！
          </button>
          <Link href="/demo" className="inline-block mt-6 text-gray-400 hover:text-gray-600 text-sm">
            デモ一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  // 結果表示
  if (result) {
    return (
      <ResultPage
        result={result}
        onRetry={() => {
          setCurrentQ(-1)
          setAnswers({})
          setResult(null)
        }}
      />
    )
  }

  // 質問フォーム
  const q = QUESTIONS[currentQ]
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100

  const handleAnswer = (value: number | string) => {
    const newAnswers = { ...answers, [q.key]: value }
    setAnswers(newAnswers)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      // デモ: 固定結果を表示
      setResult(DEMO_CHILD_SELF_RESULT)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* デモバナー */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-center text-xs text-amber-700">
        DEMO MODE
      </div>

      {/* プログレスバー */}
      <div className="h-2 bg-gray-200">
        <div
          className="h-2 bg-[#F7941D] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* 問番号 */}
          <p className="text-center text-gray-400 text-sm font-medium mb-4">
            {currentQ + 1} / {QUESTIONS.length}
          </p>

          {/* 絵文字 */}
          <div className="text-center text-6xl mb-4">{q.emoji}</div>

          {/* 質問文 */}
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-8 leading-snug">
            {q.label}
          </h2>

          {/* 選択肢 */}
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => handleAnswer(opt.value)}
                className="w-full py-4 px-5 text-xl font-medium rounded-2xl border-2 bg-white border-gray-200 hover:border-[#F7941D] hover:bg-[#FFF8F0] transition active:scale-95 flex items-center gap-3"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* 戻るボタン */}
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ(prev => prev - 1)}
              className="mt-6 w-full py-2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ← まえのもんだいに戻る
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
