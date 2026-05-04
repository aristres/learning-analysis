import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcBasicAnswersJson, classifyLearningProfile } from '@/lib/scoring'
import { generateAssessmentReport } from '@/lib/llm'
import { generatePlan } from '@/lib/plan-generator'
import type { AnswersJson, LearningStyle } from '@/types'

/** プラン生成用: v2タイプ → LearningStyle (後方互換マッピング) */
function toLegacyLearningStyle(v2Type: string): LearningStyle {
  if (v2Type === 'visual') return 'visual'
  if (v2Type === 'auditory') return 'auditory'
  return 'kinesthetic'  // kinesthetic / reflective / intuitive / systematic
}

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

    // アクセス資格チェック：
    // - 過去に支払い済み診断がある → 診断無料
    // - アクティブな１ヶ月継続プラン（monthly）がある → 診断無料
    // ※ 1週間お試し（30day）は診断アクセス権を付与しない
    const today = new Date().toISOString().split('T')[0]
    const [{ data: paidAssessment }, { data: activeMonthlyPlan }] = await Promise.all([
      supabase
        .from('assessments')
        .select('id')
        .eq('parent_id', user.id)
        .eq('payment_status', 'paid')
        .limit(1)
        .single(),
      supabase
        .from('plans')
        .select('id')
        .eq('parent_id', user.id)
        .eq('status', 'active')
        .eq('type', 'monthly')          // monthly のみ（30day試用は除外）
        .gte('end_date', today)          // 期限内のみ
        .limit(1)
        .single(),
    ])
    const isQualified = !!(paidAssessment || activeMonthlyPlan)
    const initialPaymentStatus = isQualified ? 'paid' : 'unpaid'

    // スコア計算 + v2 学習タイプ分類
    const answersJson = calcBasicAnswersJson(rawAnswers, grade)
    const learningProfile = classifyLearningProfile(answersJson)

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
          payment_status: initialPaymentStatus,
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

    // LLM でレポート生成（v2タイプ情報をコンテキストとして渡す）
    let report
    try {
      report = await generateAssessmentReport(answersJson, learningProfile)
    } catch (llmErr) {
      console.error('LLM report generation failed:', llmErr)
      // エラー状態を保存
      await supabase
        .from('assessments')
        .update({ status: 'error', answers_json: answersJson })
        .eq('id', currentAssessmentId)
      return NextResponse.json(
        { error: 'レポート生成に失敗しました。もう一度お試しください。' },
        { status: 503 }
      )
    }

    // v2 分類をレポートに統合して保存
    const reportWithV2 = {
      ...report,
      v2: { learning_type: learningProfile },
    }

    await supabase
      .from('assessments')
      .update({
        status: 'completed',
        result_json: reportWithV2,
        completed_at: new Date().toISOString(),
      })
      .eq('id', currentAssessmentId)

    // 支払い済みの場合は自動で30日プラン生成
    let planId: string | null = null
    if (assessmentId) {
      // assessmentId がある = 支払いフロー経由
      try {
        const { data: child } = await supabase
          .from('children')
          .select('name')
          .eq('id', childId)
          .single()

        const learningStyle = toLegacyLearningStyle(learningProfile.primary_type)
        const planJson = generatePlan({
          domains: answersJson.domains,
          learningStyle,
          month: 1,
          effectiveStrategyIds: [],
          ineffectiveStrategyIds: [],
          previousStrategyIds: [],
          childName: child?.name ?? '',
        })

        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)

        const { data: plan } = await supabase
          .from('plans')
          .insert({
            child_id: childId,
            parent_id: user.id,
            assessment_id: currentAssessmentId,
            type: '30day',
            status: 'active',
            plan_json: planJson,
            start_date: new Date().toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
          })
          .select('id')
          .single()

        planId = plan?.id ?? null
      } catch (planErr) {
        // プラン生成失敗はレポートには影響しない
        console.error('Auto plan generation failed:', planErr)
      }
    }

    return NextResponse.json({
      assessmentId: currentAssessmentId,
      result: reportWithV2,
      answersJson,
      planId,
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
