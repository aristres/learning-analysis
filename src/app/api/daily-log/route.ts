import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DailyLogAnswers } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { childId, planId, answers } = body as {
      childId: string
      planId?: string
      answers: DailyLogAnswers
    }

    if (!childId || !answers) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 気分を変換（Q3: 1=元気, 2=ふつう, 3=つかれてる）
    const moodMap = { 1: 'good', 2: 'normal', 3: 'tired' } as const
    const mood = moodMap[answers.Q3 as 1 | 2 | 3] ?? 'normal'

    const today = new Date().toISOString().split('T')[0]

    // upsert（同日のログが既にあれば更新）
    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(
        {
          child_id: childId,
          plan_id: planId ?? null,
          log_date: today,
          answers_json: answers,
          mood,
        },
        { onConflict: 'child_id,log_date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Daily log error:', error)
      return NextResponse.json({ error: 'ログの保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ log: data })
  } catch (err) {
    console.error('Daily log error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// 日次ログ一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('childId')
  const limit = parseInt(searchParams.get('limit') ?? '7')

  if (!childId) {
    return NextResponse.json({ error: 'childIdが必要です' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('child_id', childId)
    .order('log_date', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: 'ログの取得に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ logs: data })
}
