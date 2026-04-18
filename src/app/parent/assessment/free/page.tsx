'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const FREE_QUESTIONS = [
  {
    key: 'Q1',
    type: 'radio' as const,
    label: 'お子さんは「集中が続かない」様子がどの程度ありますか？',
    options: [
      { label: 'よくある', value: 1 },
      { label: '時々ある', value: 2 },
      { label: 'あまりない', value: 3 },
    ],
  },
  {
    key: 'Q2',
    type: 'multi' as const,
    label: '新しいことを覚えるとき、お子さんはどのタイプですか？',
    options: [
      { label: '言葉で説明されると理解しやすい', value: '聞く' },
      { label: '見本があると理解しやすい', value: '見る' },
      { label: 'やってみないと理解できない', value: '体感' },
    ],
  },
  {
    key: 'Q3',
    type: 'radio' as const,
    label: '宿題を始めるタイミングはどうですか？',
    options: [
      { label: '自分で始められる', value: 3 },
      { label: '声かけで始められる', value: 2 },
      { label: '声かけしても渋る', value: 1 },
    ],
  },
  {
    key: 'Q4',
    type: 'radio' as const,
    label: '気が散りやすさはどの程度ありますか？',
    options: [
      { label: '多い', value: 1 },
      { label: '普通', value: 2 },
      { label: '少ない', value: 3 },
    ],
  },
  {
    key: 'Q5',
    type: 'radio' as const,
    label: '苦手な課題に向き合うときの反応は？',
    options: [
      { label: 'すぐ嫌がる', value: 1 },
      { label: '少し渋る', value: 2 },
      { label: '普通に取りかかる', value: 3 },
    ],
  },
  {
    key: 'Q6',
    type: 'radio' as const,
    label: 'わからない問題があった時の行動は？',
    options: [
      { label: 'すぐ諦める', value: 1 },
      { label: '少し考えて諦める', value: 2 },
      { label: '粘って取り組む', value: 3 },
    ],
  },
  {
    key: 'Q7',
    type: 'radio' as const,
    label: '朝・夜の生活リズムは？',
    options: [
      { label: '整っている', value: 3 },
      { label: 'やや不規則', value: 2 },
      { label: '不規則', value: 1 },
    ],
  },
  {
    key: 'Q8',
    type: 'multi' as const,
    label: 'お子さんの得意だと思う学習スタイルは？',
    options: [
      { label: '読むと理解する', value: '読む' },
      { label: '書くと理解する', value: '書く' },
      { label: '聞くと理解する', value: '聞く' },
      { label: '動くと理解する', value: '体感' },
    ],
  },
]

const GRADES = ['小1', '小2', '小3', '小4', '小5', '小6', '中1', '中2', '中3']
const TOTAL_QUESTIONS = FREE_QUESTIONS.length

export default function FreeAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0) // 0=info, 1-8=questions, 9=loading, 10=result
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [grade, setGrade] = useState('')
  const [childName, setChildName] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({})
  const [result, setResult] = useState<{
    summary: string
    strengths: string[]
    home_strategies: string[]
  } | null>(null)
  const [error, setError] = useState('')

  const progress = currentStep === 0 ? 0 : (currentStep / TOTAL_QUESTIONS) * 100

  const goForward = () => {
    setDirection('forward')
    setCurrentStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection('backward')
    setCurrentStep((s) => s - 1)
  }

  const handleRadioAnswer = (qKey: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [qKey]: value }))
    // Auto-advance after short delay
    setTimeout(() => {
      setDirection('forward')
      setCurrentStep((s) => {
        if (s < TOTAL_QUESTIONS) return s + 1
        return s
      })
    }, 300)
  }

  const handleMultiToggle = (qKey: string, val: string) => {
    setMultiAnswers((prev) => {
      const current = prev[qKey] ?? []
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
      return { ...prev, [qKey]: next }
    })
  }

  const handleSubmit = async () => {
    setCurrentStep(TOTAL_QUESTIONS + 1) // loading
    setError('')

    try {
      let childId = 'guest'
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: child, error: childError } = await supabase
            .from('children')
            .insert({ parent_id: user.id, name: childName, grade })
            .select('id')
            .single()
          if (!childError && child) childId = child.id
        }
      } catch {
        // Guest mode
      }

      const res = await fetch('/api/assessment/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, grade, rawAnswers: { ...answers, ...multiAnswers } }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '診断に失敗しました')
      }

      const data = await res.json()
      setResult(data.result)
      setCurrentStep(TOTAL_QUESTIONS + 2) // result
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      setCurrentStep(TOTAL_QUESTIONS) // back to last question
    }
  }

  // ── Loading ──
  if (currentStep === TOTAL_QUESTIONS + 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#F7941D] border-t-transparent mb-6" />
        <p className="text-[#1B2A4A] font-medium text-lg">学習特性を分析しています...</p>
        <p className="text-gray-400 text-sm mt-2">少々お待ちください</p>
      </div>
    )
  }

  // ── Result ──
  if (currentStep === TOTAL_QUESTIONS + 2 && result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF8F0] mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] mb-1">かんたんチェックレポート</h1>
              <p className="text-gray-500 text-sm">{childName}さん（{grade}）</p>
            </div>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#F7941D] rounded-full" />
                お子さんの特徴
              </h2>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#43A047] rounded-full" />
                強み
              </h2>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#43A047] mt-1 font-bold">✓</span>
                    <span className="text-gray-700">{s}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#2196F3] rounded-full" />
                すぐ使える手立て
              </h2>
              <ul className="space-y-2">
                {result.home_strategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#2196F3] mt-1">●</span>
                    <span className="text-gray-700">{s}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="border-t border-gray-100 pt-6 text-center">
              <p className="text-gray-500 text-sm mb-4">
                より詳しい分析・家庭学習プランは「くわしいチェック」で
              </p>
              <a
                href="/signup"
                className="inline-block px-8 py-3 bg-[#F7941D] text-white rounded-full font-medium hover:bg-[#E8850F] transition shadow-md"
              >
                くわしいチェックへ（¥1,480）
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Intro / Info Step ──
  if (currentStep === 0) {
    const canProceed = childName.trim() !== '' && grade !== ''
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF8F0] mb-4">
                <span className="text-3xl">🧒</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">かんたんチェック（無料）</h1>
              <p className="text-gray-500 text-sm">
                約3分・8問で学習の傾向を把握できます
              </p>
            </div>

            {/* アンカー教示 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
              <p className="text-sm text-amber-800 leading-relaxed">
                💡 <span className="font-medium">回答のコツ：</span>「昨日の様子」ではなく、<span className="font-medium">最近2週間の典型的な日</span>を思い浮かべながら答えてください。
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  お子さんの名前
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="太郎"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  学年
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent text-lg"
                >
                  <option value="">選択してください</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={goForward}
              disabled={!canProceed}
              className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              チェックを始める
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question Slides ──
  const qIndex = currentStep - 1
  const q = FREE_QUESTIONS[qIndex]
  const isLastQuestion = currentStep === TOTAL_QUESTIONS
  const animClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-[#F7941D] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div key={currentStep} className={`w-full max-w-md ${animClass}`}>
          {/* Question counter */}
          <p className="text-center text-gray-400 text-sm font-medium mb-6">
            {currentStep} / {TOTAL_QUESTIONS}
          </p>

          {/* Question text */}
          <h2 className="text-center text-xl md:text-2xl font-bold text-[#1B2A4A] mb-8 leading-relaxed">
            {q.label}
            {q.type === 'multi' && (
              <span className="block text-sm font-normal text-[#F7941D] mt-2">複数選択可</span>
            )}
          </h2>

          {/* Answer options */}
          {q.type === 'radio' ? (
            <div className="space-y-3">
              {q.options.map((opt) => {
                const isSelected = answers[q.key] === opt.value
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleRadioAnswer(q.key, opt.value)}
                    className={`w-full py-4 px-6 text-left text-lg rounded-xl border-2 transition active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#F7941D] bg-[#FFF8F0] text-[#1B2A4A] font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#F7941D]/50 hover:bg-[#FFFCF8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {q.options.map((opt) => {
                  const selected = multiAnswers[q.key] ?? []
                  const isChecked = selected.includes(String(opt.value))
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => handleMultiToggle(q.key, String(opt.value))}
                      className={`w-full py-4 px-6 text-left text-lg rounded-xl border-2 transition flex items-center gap-3 active:scale-[0.98] ${
                        isChecked
                          ? 'border-[#F7941D] bg-[#FFF8F0] text-[#1B2A4A] font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#F7941D]/50 hover:bg-[#FFFCF8]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                          isChecked
                            ? 'border-[#F7941D] bg-[#F7941D]'
                            : 'border-gray-300'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              {/* Next button for multi-select */}
              <button
                onClick={() => {
                  if (isLastQuestion) {
                    handleSubmit()
                  } else {
                    goForward()
                  }
                }}
                disabled={(multiAnswers[q.key]?.length ?? 0) === 0}
                className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isLastQuestion ? '結果を見る' : '次へ'}
              </button>
            </>
          )}

          {/* If last question and radio type, show submit button */}
          {isLastQuestion && q.type === 'radio' && answers[q.key] !== undefined && (
            <button
              onClick={handleSubmit}
              className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] transition"
            >
              結果を見る
            </button>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}

          {/* Back button */}
          {currentStep > 1 && (
            <button
              onClick={goBack}
              className="mt-4 w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              ← 前の質問に戻る
            </button>
          )}
          {currentStep === 1 && (
            <button
              onClick={goBack}
              className="mt-4 w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              ← 基本情報に戻る
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
