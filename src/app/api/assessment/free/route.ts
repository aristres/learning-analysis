import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcFreeAnswersJson } from '@/lib/scoring'
import { generateFreeReport } from '@/lib/llm'
import type { FreeAnswersRaw } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { childId, grade, rawAnswers } = body as {
      childId: string
      grade: string
      rawAnswers: FreeAnswersRaw
    }

    if (!grade || !rawAnswers) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    // スコア計算
    const answersJson = calcFreeAnswersJson(rawAnswers, grade)

    // ログイン済みの場合のみDB保存を試みる
    let assessmentId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user && childId && childId !== 'guest') {
        const { data: assessment } = await supabase
          .from('assessments')
          .insert({
            child_id: childId,
            parent_id: user.id,
            type: 'free',
            status: 'in_progress',
            payment_status: 'free',
            answers_json: answersJson,
          })
          .select('id')
          .single()

        if (assessment) assessmentId = assessment.id
      }
    } catch {
      // ゲストモード or Supabase未接続 → DB保存スキップ
    }

    // LLM でレポート生成（API未接続時はモック結果を返す）
    let report
    try {
      report = await generateFreeReport(answersJson)
    } catch {
      report = generateMockFreeReport(answersJson, grade)
    }

    // ログイン済みの場合のみ結果をDBに保存
    if (assessmentId) {
      try {
        const supabase = await createClient()
        await supabase
          .from('assessments')
          .update({
            status: 'completed',
            result_json: report,
            completed_at: new Date().toISOString(),
          })
          .eq('id', assessmentId)
      } catch {
        // DB保存エラーは無視
      }
    }

    return NextResponse.json({
      assessmentId: assessmentId ?? 'guest',
      result: report,
      answersJson,
    })
  } catch (err) {
    console.error('Free assessment error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// LLM未接続時のモック結果生成
function generateMockFreeReport(
  answersJson: Partial<import('@/types').AnswersJson>,
  grade: string
) {
  const attention = answersJson.domains?.attention
  const motivation = answersJson.domains?.motivation_emotion

  const attLabel = attention?.level === 'high' ? '高い集中力' : attention?.level === 'low' ? '集中の持続に課題' : '平均的な集中力'
  const motLabel = motivation?.level === 'high' ? '意欲が高い' : motivation?.level === 'low' ? '意欲の引き出しに工夫が必要' : '平均的な意欲'

  return {
    summary: `${grade}のお子さんは、${attLabel}と${motLabel}が特徴です。回答傾向から、視覚的な情報を活用した学習が効果的と考えられます。日常の学習において、短い区切りで達成感を感じられる工夫を取り入れることで、学習への前向きな姿勢を育てやすい傾向があります。`,
    strengths: [
      '自分なりのペースで物事を進められる力がある',
      '興味のあることに対して粘り強く取り組める素地がある',
    ],
    home_strategies: [
      '学習は「15分やったら3分休憩」のように短い区切りを設定し、タイマーを見える場所に置く',
      '宿題の前に「今日やること」を付箋に書き出して机に貼り、終わったら剥がす達成感を演出する',
    ],
  }
}
