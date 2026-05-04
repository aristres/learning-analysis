import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json() as { planId: string }

    if (!planId) {
      return NextResponse.json({ error: 'planIdが必要です' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // プランを取得してオーナー確認
    const { data: plan } = await supabase
      .from('plans')
      .select('id, type, status')
      .eq('id', planId)
      .eq('parent_id', user.id)
      .single()

    if (!plan) {
      return NextResponse.json({ error: 'プランが見つかりません' }, { status: 404 })
    }

    if (plan.status !== 'active') {
      return NextResponse.json({ error: 'このプランはすでに終了しています' }, { status: 400 })
    }

    // プランをキャンセル
    await supabase
      .from('plans')
      .update({ status: 'cancelled' })
      .eq('id', planId)
      .eq('parent_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Plan cancel error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
