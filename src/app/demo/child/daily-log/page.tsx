'use client'

import { useState } from 'react'

const QUESTIONS = [
  {
    key: 'Q1', type: 'choice' as const,
    label: '今日の宿題、どれを先にやる？', emoji: '📚',
    options: [
      { label: '計算', value: '計算' }, { label: '読書', value: '読書' },
      { label: '書く課題', value: '書く課題' }, { label: 'プリント', value: 'プリント' },
    ],
  },
  {
    key: 'Q2', type: 'scale' as const,
    label: '今日の宿題はやりやすかった？', emoji: '✏️',
    options: [
      { label: 'すごくやりやすい', value: 3, color: 'bg-green-100 border-green-400' },
      { label: 'ふつう', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: 'むずかしい', value: 1, color: 'bg-red-100 border-red-400' },
    ],
  },
  {
    key: 'Q3', type: 'scale' as const,
    label: 'いまの気分は？', emoji: '😊',
    options: [
      { label: '元気！', value: 1, color: 'bg-green-100 border-green-400' },
      { label: 'ふつう', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: 'つかれてる', value: 3, color: 'bg-blue-100 border-blue-400' },
    ],
  },
  {
    key: 'Q4', type: 'scale' as const,
    label: '学校で一番わかったところは？', emoji: '🏫',
    options: [
      { label: 'よくわかった', value: 3, color: 'bg-green-100 border-green-400' },
      { label: 'ふつう', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: 'よくわからなかった', value: 1, color: 'bg-red-100 border-red-400' },
    ],
  },
  {
    key: 'Q5', type: 'choice' as const,
    label: '今日の勉強の中で楽しかったのは？', emoji: '🌟',
    options: [
      { label: '計算', value: '計算' }, { label: '読む', value: '読む' },
      { label: '書く', value: '書く' }, { label: '話す', value: '話す' },
      { label: '特になし', value: '特になし' },
    ],
  },
  {
    key: 'Q6', type: 'choice' as const,
    label: 'むずかしかったところは？', emoji: '🤔',
    options: [
      { label: '計算', value: '計算' }, { label: '読む', value: '読む' },
      { label: '書く', value: '書く' }, { label: '話す', value: '話す' },
      { label: '特になし', value: '特になし' },
    ],
  },
  {
    key: 'Q7', type: 'scale' as const,
    label: '勉強を始めるときの気持ちは？', emoji: '🚀',
    options: [
      { label: 'すぐできた', value: 3, color: 'bg-green-100 border-green-400' },
      { label: 'ちょっといや', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: 'かなりいや', value: 1, color: 'bg-red-100 border-red-400' },
    ],
  },
  {
    key: 'Q8', type: 'scale' as const,
    label: '今日、ていねいにできた？', emoji: '✍️',
    options: [
      { label: 'できた', value: 3, color: 'bg-green-100 border-green-400' },
      { label: 'まあまあ', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: 'できなかった', value: 1, color: 'bg-red-100 border-red-400' },
    ],
  },
  {
    key: 'Q9', type: 'scale' as const,
    label: '今日の学習の時間は？', emoji: '⏱️',
    options: [
      { label: '長かった', value: 3, color: 'bg-green-100 border-green-400' },
      { label: 'ふつう', value: 2, color: 'bg-yellow-100 border-yellow-400' },
      { label: '短かった', value: 1, color: 'bg-red-100 border-red-400' },
    ],
  },
  {
    key: 'Q10', type: 'choice' as const,
    label: '明日はどれをがんばりたい？', emoji: '🌅',
    options: [
      { label: '計算', value: '計算' }, { label: '読書', value: '読書' },
      { label: '書く課題', value: '書く課題' }, { label: 'プリント', value: 'プリント' },
    ],
  },
]

export default function DemoDailyLogPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [step, setStep] = useState<'form' | 'done'>('form')

  const q = QUESTIONS[currentQ]
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100

  const handleAnswer = (value: number | string) => {
    const newAnswers = { ...answers, [q.key]: value }
    setAnswers(newAnswers)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1)
    } else {
      // デモ: 送信せず完了画面へ
      setStep('done')
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
        <div className="text-center mb-4">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            DEMO MODE
          </span>
        </div>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">おつかれさま！</h1>
        <p className="text-xl text-gray-600 mb-2">きょうもよくがんばったね</p>
        <p className="text-gray-500 mb-6">またあしたもがんばろう！</p>
        <a href="/demo" className="text-[#F7941D] hover:underline text-sm">
          デモ一覧に戻る
        </a>
      </div>
    )
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
          className="h-2 bg-[#F7941D] transition-all duration-300"
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
                className={`w-full py-4 px-5 text-xl font-medium rounded-2xl border-2 transition active:scale-95 ${
                  q.type === 'scale'
                    ? (opt as { color: string }).color
                    : 'bg-white border-gray-200 hover:border-[#F7941D] hover:bg-[#FFF8F0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 戻るボタン */}
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ((prev) => prev - 1)}
              className="mt-6 w-full py-2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ← まえのもんに戻る
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
