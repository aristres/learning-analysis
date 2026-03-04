import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePlan, type PlanGeneratorInput } from '@/lib/plan-generator'
import type { AnswersJson, LearningStyle } from '@/types'

// =============================================
// 学習スタイル判定ヘルパー
// =============================================

function determineLearningStyle(answersJson: AnswersJson): LearningStyle {
  const sensoryScore = answersJson.domains.sensory?.score ?? 50
  const rawQ19 = answersJson.raw_scores?.Q19 as number | undefined

  // 感覚スコアが高い + Q19（視覚情報への反応）が3 → 視覚優位
  if (sensoryScore >= 65 && rawQ19 === 3) return 'visual'
  // 感覚スコアが低い → 体感覚優位
  if (sensoryScore < 40) return 'kinesthetic'
  // それ以外 → 聴覚優位
  return 'auditory'
}

// =============================================
// POST: プランを新規生成
// =============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { childId, assessmentId } = body

    if (!childId || !assessmentId) {
      return NextResponse.json({ error: 'childId と assessmentId は必須です' }, { status: 400 })
    }

    // 診断データを取得
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('parent_id', user.id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: '診断データが見つかりません' }, { status: 404 })
    }

    if (assessment.status !== 'completed') {
      return NextResponse.json({ error: '診断が完了していません' }, { status: 400 })
    }

    const answersJson = assessment.answers_json as AnswersJson

    // 子ども情報を取得
    const { data: child } = await supabase
      .from('children')
      .select('name')
      .eq('id', childId)
      .single()

    // 既存プランを確認（月数と前回の手立て情報取得）
    const { data: existingPlans } = await supabase
      .from('plans')
      .select('plan_json')
      .eq('child_id', childId)
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })

    const month = (existingPlans?.length ?? 0) + 1
    const previousPlan = existingPlans?.[0]?.plan_json as PlanGeneratorInput | null

    // プラン生成
    const learningStyle = determineLearningStyle(answersJson)
    const planJson = generatePlan({
      domains: answersJson.domains,
      learningStyle,
      month,
      effectiveStrategyIds: [],
      ineffectiveStrategyIds: [],
      previousStrategyIds: previousPlan
        ? [...(previousPlan as unknown as { continued_strategies?: { id: string }[]; new_strategies?: { id: string }[] }).continued_strategies?.map(s => s.id) ?? [],
           ...(previousPlan as unknown as { new_strategies?: { id: string }[] }).new_strategies?.map(s => s.id) ?? []]
        : [],
      childName: child?.name ?? '',
    })

    // DB保存
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    const { data: plan, error: insertError } = await supabase
      .from('plans')
      .insert({
        child_id: childId,
        parent_id: user.id,
        assessment_id: assessmentId,
        type: '30day',
        status: 'active',
        plan_json: planJson,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      })
      .select('id, plan_json')
      .single()

    if (insertError) {
      console.error('Plan insert error:', insertError)
      return NextResponse.json({ error: 'プランの保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ planId: plan.id, plan: plan.plan_json })
  } catch (err) {
    console.error('Plan generation error:', err)
    return NextResponse.json({ error: 'プラン生成中にエラーが発生しました' }, { status: 500 })
  }
}

// =============================================
// GET: プランを取得
// =============================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json({ error: 'id パラメータが必要です' }, { status: 400 })
    }

    const { data: plan, error } = await supabase
      .from('plans')
      .select('*, children(name, grade)')
      .eq('id', planId)
      .eq('parent_id', user.id)
      .single()

    if (error || !plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (err) {
    console.error('Plan fetch error:', err)
    return NextResponse.json({ error: 'プラン取得中にエラーが発生しました' }, { status: 500 })
  }
}
