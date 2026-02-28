import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcBasicAnswersJson } from '@/lib/scoring'
import { generateAssessmentReport } from '@/lib/llm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, childId, grade, rawAnswers } = body as {
      assessmentId?: string
      childId: string
      grade: string
      rawAnswers: Record<string, number | string | string[] | { good: string[]; weak: string[] }>
    }

    if (!childId || !grade || !rawAnswers) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 支払い済みかチェック（assessmentId がある場合）
    if (assessmentId) {
      const { data: existingAssessment } = await supabase
        .from('assessments')
        .select('payment_status')
        .eq('id', assessmentId)
        .eq('parent_id', user.id)
        .single()

      if (!existingAssessment || existingAssessment.payment_status !== 'paid') {
        return NextResponse.json({ error: '決済が完了していません' }, { status: 403 })
      }
    }

    // スコア計算
    const answersJson = calcBasicAnswersJson(rawAnswers, grade)

    // assessment レコードを作成または更新
    let currentAssessmentId = assessmentId

    if (!currentAssessmentId) {
      const { data: newAssessment, error } = await supabase
        .from('assessments')
        .insert({
          child_id: childId,
          parent_id: user.id,
          type: 'basic',
          status: 'in_progress',
          payment_status: 'unpaid',
          answers_json: answersJson,
        })
        .select('id')
        .single()

      if (error || !newAssessment) {
        return NextResponse.json({ error: '診断セッション作成に失敗しました' }, { status: 500 })
      }
      currentAssessmentId = newAssessment.id
    } else {
      // 回答を保存
      await supabase
        .from('assessments')
        .update({ answers_json: answersJson })
        .eq('id', currentAssessmentId)
    }

    // LLM でレポート生成
    const report = await generateAssessmentReport(answersJson)

    // 結果保存
    await supabase
      .from('assessments')
      .update({
        status: 'completed',
        result_json: report,
        completed_at: new Date().toISOString(),
      })
      .eq('id', currentAssessmentId)

    return NextResponse.json({
      assessmentId: currentAssessmentId,
      result: report,
      answersJson,
    })
  } catch (err) {
    console.error('Basic assessment error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 診断結果取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const assessmentId = searchParams.get('id')

  if (!assessmentId) {
    return NextResponse.json({ error: 'IDが必要です' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('parent_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 })
  }

  return NextResponse.json(data)
}
