'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SUBJECTS = ['国語', '算数', '英語', '理科', '社会']

type QuestionStep =
  | { type: 'radio'; key: string; label: string; options: { label: string; value: number }[] }
  | { type: 'multi'; key: 'Q7'; label: string; options: string[] }
  | { type: 'subjects'; key: 'Q17'; label: string }

const QUESTION_STEPS: QuestionStep[] = [
  { type: 'radio', key: 'Q1', label: '集中して座っていられる時間はどの程度ですか？',
    options: [{ label: '5分以内', value: 1 }, { label: '10分程度', value: 2 }, { label: '20分以上', value: 3 }] },
  { type: 'radio', key: 'Q2', label: '学校の授業で話を聞く態度は？',
    options: [{ label: '聞き逃しが多い', value: 1 }, { label: '時々集中が切れる', value: 2 }, { label: '安定して聞ける', value: 3 }] },
  { type: 'radio', key: 'Q3', label: '作業に取りかかるまでの時間は？',
    options: [{ label: 'かなり遅い', value: 1 }, { label: '少し遅い', value: 2 }, { label: 'すぐ始められる', value: 3 }] },
  { type: 'radio', key: 'Q4', label: '手順が多い課題はどの程度苦手ですか？',
    options: [{ label: 'とても苦手', value: 1 }, { label: 'やや苦手', value: 2 }, { label: '問題なし', value: 3 }] },
  { type: 'radio', key: 'Q5', label: '忘れ物・提出物の頻度は？',
    options: [{ label: '多い', value: 1 }, { label: '時々ある', value: 2 }, { label: 'ほとんどない', value: 3 }] },
  { type: 'radio', key: 'Q6', label: '説明を聞いて理解できる割合は？',
    options: [{ label: '50%以下', value: 1 }, { label: '70%程度', value: 2 }, { label: '90%以上', value: 3 }] },
  { type: 'multi', key: 'Q7', label: '読む・書く・聞く・話すの中で得意なものは？',
    options: ['読む', '書く', '聞く', '話す'] },
  { type: 'radio', key: 'Q8', label: '計算や作業スピードは？',
    options: [{ label: '遅い', value: 1 }, { label: '普通', value: 2 }, { label: '速い', value: 3 }] },
  { type: 'radio', key: 'Q9', label: '文章題の理解は？',
    options: [{ label: '苦手', value: 1 }, { label: '普通', value: 2 }, { label: '得意', value: 3 }] },
  { type: 'radio', key: 'Q10', label: 'マルチタスク（複数の指示）への反応は？',
    options: [{ label: '混乱しやすい', value: 1 }, { label: 'やや苦手', value: 2 }, { label: '普通', value: 3 }] },
  { type: 'radio', key: 'Q11', label: '気分が変わりやすい（情緒変動）は？',
    options: [{ label: '大きい', value: 1 }, { label: '時々ある', value: 2 }, { label: '安定している', value: 3 }] },
  { type: 'radio', key: 'Q12', label: '苦手なことに対する粘り強さは？',
    options: [{ label: '低い', value: 1 }, { label: 'ふつう', value: 2 }, { label: '高い', value: 3 }] },
  { type: 'radio', key: 'Q13', label: '学習への自信は？',
    options: [{ label: '低い', value: 1 }, { label: '普通', value: 2 }, { label: '高い', value: 3 }] },
  { type: 'radio', key: 'Q14', label: '家での勉強量は？',
    options: [{ label: 'ほぼしない', value: 1 }, { label: '少し', value: 2 }, { label: '十分している方', value: 3 }] },
  { type: 'radio', key: 'Q15', label: '宿題のミスの量は？',
    options: [{ label: '多い', value: 1 }, { label: '普通', value: 2 }, { label: '少ない', value: 3 }] },
  { type: 'radio', key: 'Q16', label: '漢字の習得・暗記は得意ですか？',
    options: [{ label: '苦手', value: 1 }, { label: 'ふつう', value: 2 }, { label: '得意', value: 3 }] },
  { type: 'subjects', key: 'Q17', label: '教科別の得意・苦手を教えてください' },
  { type: 'radio', key: 'Q18', label: '音や声に敏感さは？',
    options: [{ label: '強い', value: 1 }, { label: '普通', value: 2 }, { label: 'ほぼない', value: 3 }] },
  { type: 'radio', key: 'Q19', label: '視覚情報（図表・動画）への反応は？',
    options: [{ label: '理解しやすい', value: 3 }, { label: '普通', value: 2 }, { label: '苦手', value: 1 }] },
  { type: 'radio', key: 'Q20', label: '1日の生活リズム・睡眠の質は？',
    options: [{ label: '悪い', value: 1 }, { label: '普通', value: 2 }, { label: '良い', value: 3 }] },
]

const TOTAL_QUESTIONS = QUESTION_STEPS.length

export default function BasicAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')

  const [currentStep, setCurrentStep] = useState(0) // 0=info, 1-20=questions, 21=loading
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [grade, setGrade] = useState('')
  const [childId, setChildId] = useState('')
  const [children, setChildren] = useState<{ id: string; name: string; grade: string }[]>([])
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [q7Skills, setQ7Skills] = useState<string[]>([])
  const [q17Good, setQ17Good] = useState<string[]>([])
  const [q17Weak, setQ17Weak] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('children').select('id, name, grade')
        if (data) setChildren(data)
      } catch {
        // Supabase unavailable
      }
    }
    loadChildren()
  }, [])

  const progress = currentStep === 0 ? 0 : (currentStep / TOTAL_QUESTIONS) * 100

  const goForward = () => {
    setDirection('forward')
    setCurrentStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection('backward')
    setCurrentStep((s) => s - 1)
  }

  const handleRadioAnswer = (qKey: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qKey]: value }))
    setTimeout(() => {
      setDirection('forward')
      setCurrentStep((s) => (s < TOTAL_QUESTIONS ? s + 1 : s))
    }, 300)
  }

  const handleSubmit = async () => {
    setCurrentStep(TOTAL_QUESTIONS + 1) // loading
    setError('')

    const rawAnswers = {
      ...answers,
      Q7: q7Skills,
      Q17: { good: q17Good, weak: q17Weak },
    }

    try {
      const res = await fetch('/api/assessment/basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, childId, grade, rawAnswers }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '診断に失敗しました')
      }

      const data = await res.json()
      router.push(`/parent/report/${data.assessmentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setCurrentStep(TOTAL_QUESTIONS) // back to last question
    }
  }

  // ── Loading ──
  if (currentStep === TOTAL_QUESTIONS + 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#F7941D] border-t-transparent mb-6" />
        <p className="text-[#1B2A4A] font-medium text-lg">詳細な学習特性を分析しています...</p>
        <p className="text-gray-400 text-sm mt-2">少々お待ちください（30秒程度）</p>
      </div>
    )
  }

  // ── Info Step ──
  if (currentStep === 0) {
    const canProceed = childId !== '' && grade !== ''
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF8F0] mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">ベーシック診断</h1>
              <p className="text-gray-500 text-sm">20問・詳細な学習特性レポートを生成します</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">お子さんを選択</label>
                <select
                  value={childId}
                  onChange={(e) => {
                    setChildId(e.target.value)
                    const child = children.find((c) => c.id === e.target.value)
                    if (child) setGrade(child.grade)
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent text-lg"
                >
                  <option value="">選択してください</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}（{c.grade}）</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">学年</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="小4"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7941D] focus:border-transparent text-lg"
                />
              </div>
            </div>

            <button
              onClick={goForward}
              disabled={!canProceed}
              className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              診断を始める
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question Slides ──
  const qIndex = currentStep - 1
  const q = QUESTION_STEPS[qIndex]
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
            {(q.type === 'multi' || q.type === 'subjects') && (
              <span className="block text-sm font-normal text-[#F7941D] mt-2">複数選択可</span>
            )}
          </h2>

          {/* Radio options */}
          {q.type === 'radio' && (
            <div className="space-y-3">
              {q.options.map((opt) => {
                const isSelected = answers[q.key] === opt.value
                return (
                  <button
                    key={opt.value}
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
          )}

          {/* Multi-select: Q7 skills */}
          {q.type === 'multi' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((skill) => {
                  const isChecked = q7Skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      onClick={() =>
                        setQ7Skills((prev) =>
                          prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill]
                        )
                      }
                      className={`py-4 px-4 text-lg rounded-xl border-2 transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                        isChecked
                          ? 'border-[#F7941D] bg-[#FFF8F0] text-[#1B2A4A] font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#F7941D]/50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                          isChecked ? 'border-[#F7941D] bg-[#F7941D]' : 'border-gray-300'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </span>
                      {skill}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={goForward}
                disabled={q7Skills.length === 0}
                className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                次へ
              </button>
            </>
          )}

          {/* Subjects: Q17 */}
          {q.type === 'subjects' && (
            <>
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-[#43A047] font-bold mb-3">得意な教科</p>
                    <div className="space-y-2">
                      {SUBJECTS.map((s) => {
                        const isChecked = q17Good.includes(s)
                        return (
                          <button
                            key={`good-${s}`}
                            onClick={() =>
                              setQ17Good((prev) =>
                                prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                              )
                            }
                            className={`w-full py-2 px-3 text-left rounded-lg border transition flex items-center gap-2 ${
                              isChecked
                                ? 'border-[#43A047] bg-green-50 text-[#43A047] font-medium'
                                : 'border-gray-200 text-gray-700 hover:border-[#43A047]/50'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                                isChecked ? 'border-[#43A047] bg-[#43A047]' : 'border-gray-300'
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              )}
                            </span>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-red-500 font-bold mb-3">苦手な教科</p>
                    <div className="space-y-2">
                      {SUBJECTS.map((s) => {
                        const isChecked = q17Weak.includes(s)
                        return (
                          <button
                            key={`weak-${s}`}
                            onClick={() =>
                              setQ17Weak((prev) =>
                                prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                              )
                            }
                            className={`w-full py-2 px-3 text-left rounded-lg border transition flex items-center gap-2 ${
                              isChecked
                                ? 'border-red-500 bg-red-50 text-red-500 font-medium'
                                : 'border-gray-200 text-gray-700 hover:border-red-300'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                                isChecked ? 'border-red-500 bg-red-500' : 'border-gray-300'
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                                </svg>
                              )}
                            </span>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={goForward}
                className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] transition"
              >
                次へ
              </button>
            </>
          )}

          {/* Submit button on last radio question */}
          {isLastQuestion && q.type === 'radio' && answers[q.key] !== undefined && (
            <button
              onClick={handleSubmit}
              className="mt-6 w-full py-4 bg-[#F7941D] text-white rounded-full font-bold text-lg hover:bg-[#E8850F] transition shadow-md"
            >
              レポートを生成する
            </button>
          )}

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          {/* Back button */}
          <button
            onClick={goBack}
            className="mt-4 w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition"
          >
            ← {currentStep === 1 ? '基本情報に戻る' : '前の質問に戻る'}
          </button>
        </div>
      </div>
    </div>
  )
}
