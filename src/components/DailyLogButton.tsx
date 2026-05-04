'use client'

import { useState } from 'react'

interface DailyLogButtonProps {
  planId: string
  childId: string
}

const MOOD_OPTIONS = [
  { value: 1, label: '元気！', emoji: '😊' },
  { value: 2, label: 'ふつう', emoji: '😐' },
  { value: 3, label: 'つかれてる', emoji: '😴' },
]

export default function DailyLogButton({ planId, childId }: DailyLogButtonProps) {
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<1 | 2 | 3 | null>(null)
  const [done, setDone] = useState<boolean | null>(null)
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (mood === null || done === null) return
    setLoading(true)

    // DailyLogAnswers 形式に合わせる（簡易ログ）
    const answers = {
      Q1: done ? '宿題完了' : '宿題未完了',
      Q2: done ? 3 : 1,
      Q3: mood,
      Q4: 2,
      Q5: '',
      Q6: '',
      Q7: done ? 3 : 1,
      Q8: 2,
      Q9: 2,
      Q10: memo || '—',
    }

    try {
      await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, planId, answers }),
      })
      setSaved(true)
      setOpen(false)
    } catch {
      // エラーは無視してモーダルを閉じる
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="w-full py-3 bg-green-50 text-green-700 rounded-xl text-center text-sm font-medium">
        ✓ 今日のログを記録しました！
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-[#F7941D] text-white rounded-xl font-bold text-base hover:bg-[#E8850F] transition shadow-sm"
      >
        📝 今日の学習を記録する
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-[#1B2A4A] text-lg mb-5">今日の学習記録</h3>

            {/* 気分 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">今日の気分は？</p>
              <div className="grid grid-cols-3 gap-2">
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMood(opt.value as 1 | 2 | 3)}
                    className={`py-3 rounded-xl border-2 text-center transition ${
                      mood === opt.value
                        ? 'border-[#F7941D] bg-[#FFF8F0]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">{opt.emoji}</div>
                    <div className="text-xs text-gray-600 mt-1">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 宿題 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">今日のタスクはできましたか？</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: 'できた！', emoji: '⭕' },
                  { value: false, label: 'むずかしかった', emoji: '△' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setDone(opt.value)}
                    className={`py-3 rounded-xl border-2 text-center transition ${
                      done === opt.value
                        ? 'border-[#F7941D] bg-[#FFF8F0]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">{opt.emoji}</div>
                    <div className="text-xs text-gray-600 mt-1">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* メモ */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">一言メモ（任意）</p>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="気づいたことや一言など"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F7941D]"
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={mood === null || done === null || loading}
                className="flex-1 py-3 bg-[#F7941D] text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#E8850F] transition"
              >
                {loading ? '保存中...' : '記録する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
