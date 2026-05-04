'use client'

import { useState } from 'react'

interface HomeworkAdvisorProps {
  planId: string
  childId: string
  grade: string
}

// 宿題の選択肢定義
const ELEMENTARY = [
  { id: 'calc',         label: '計算',      emoji: '🔢' },
  { id: 'word_problem', label: '文章題',    emoji: '📖' },
  { id: 'drawing',      label: '作図',      emoji: '📐' },
  { id: 'kanji',        label: '漢字',      emoji: '✏️' },
  { id: 'kanji_problem',label: '漢字問題',  emoji: '📝' },
  { id: 'reading',      label: '文章問題',  emoji: '📚' },
  { id: 'essay',        label: '作文',      emoji: '🖊️' },
  { id: 'diary',        label: '日記',      emoji: '📔' },
  { id: 'self_study',   label: '自主学習',  emoji: '⭐' },
]

const MIDDLE_ONLY = [
  { id: 'social_work',  label: '社会ワーク',    emoji: '🌍' },
  { id: 'science_work', label: '理科ワーク',    emoji: '🔬' },
  { id: 'vocab',        label: '英単語',        emoji: '🔤' },
  { id: 'grammar',      label: '英文法',        emoji: '📋' },
  { id: 'reading_en',   label: '英文読解',      emoji: '📖' },
  { id: 'listening',    label: 'リスニング',    emoji: '🎧' },
  { id: 'writing_en',   label: '英作文',        emoji: '✍️' },
]

export default function HomeworkAdvisor({ planId, childId, grade }: HomeworkAdvisorProps) {
  const isMiddle = grade.includes('中学') || grade.includes('中1') || grade.includes('中2') || grade.includes('中3')
  const homeworkList = isMiddle ? [...ELEMENTARY, ...MIDDLE_ONLY] : ELEMENTARY

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<{ text: string; homework: string[] } | null>(null)
  const [error, setError] = useState('')

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setAdvice(null)
  }

  const canSubmit = selected.size > 0 || (showCustom && customText.trim())

  const handleGetAdvice = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setAdvice(null)
    try {
      const res = await fetch('/api/plan/homework-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          childId,
          selectedHomework: Array.from(selected),
          customHomework: showCustom && customText.trim() ? customText.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'アドバイスの取得に失敗しました')
      } else {
        setAdvice({ text: data.advice, homework: data.homework })
      }
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelected(new Set())
    setShowCustom(false)
    setCustomText('')
    setAdvice(null)
    setError('')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
      <h2 className="font-bold text-[#1B2A4A] mb-1 flex items-center gap-2 text-base">
        📚 今日の宿題は何ですか？
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        宿題の種類を選ぶと、お子さんの学習特性に合わせたアドバイスが届きます
      </p>

      {/* 宿題ボタン一覧 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {homeworkList.map(hw => (
          <button
            key={hw.id}
            onClick={() => toggle(hw.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
              selected.has(hw.id)
                ? 'border-[#F7941D] bg-[#FFF8F0] text-[#F7941D]'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50'
            }`}
          >
            <span>{hw.emoji}</span>
            {hw.label}
          </button>
        ))}

        {/* その他ボタン */}
        <button
          onClick={() => { setShowCustom(v => !v); setAdvice(null) }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
            showCustom
              ? 'border-purple-400 bg-purple-50 text-purple-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50'
          }`}
        >
          ＋ その他
        </button>
      </div>

      {/* その他入力欄 */}
      {showCustom && (
        <div className="mb-4">
          <input
            type="text"
            value={customText}
            onChange={e => { setCustomText(e.target.value); setAdvice(null) }}
            placeholder="例：理科の観察日記、読書感想文など"
            className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 bg-purple-50"
          />
        </div>
      )}

      {/* 選択中の表示 */}
      {(selected.size > 0 || (showCustom && customText)) && !advice && (
        <p className="text-xs text-gray-500 mb-3">
          選択中：
          {[...Array.from(selected).map(id => homeworkList.find(h => h.id === id)?.label ?? id),
            ...(showCustom && customText ? [customText] : [])
          ].join('・')}
        </p>
      )}

      {/* アドバイス結果 */}
      {advice && (
        <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-medium text-blue-600 mb-2">
            📋 今日の宿題：{advice.homework.join('・')}
          </p>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {advice.text}
          </div>
        </div>
      )}

      {/* エラー */}
      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {/* ボタン類 */}
      <div className="flex gap-2">
        {!advice ? (
          <button
            onClick={handleGetAdvice}
            disabled={!canSubmit || loading}
            className="flex-1 py-3 bg-[#1B2A4A] text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-[#2B3D60] transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                アドバイスを生成中...
              </span>
            ) : (
              '✨ アドバイスをもらう'
            )}
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            別の宿題でやり直す
          </button>
        )}
      </div>
    </div>
  )
}
