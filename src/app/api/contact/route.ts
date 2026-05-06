import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = ['payment', 'report', 'plan', 'technical', 'other']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, category, message } = body as {
      name: string
      email: string
      category: string
      message: string
    }

    // ── バリデーション ──────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json({ error: 'お名前を入力してください' }, { status: 400 })
    }
    if (!email?.includes('@')) {
      return NextResponse.json({ error: '正しいメールアドレスを入力してください' }, { status: 400 })
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: '種別を選択してください' }, { status: 400 })
    }
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: 'お問い合わせ内容を10文字以上でご記入ください' }, { status: 400 })
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'お問い合わせ内容は2000文字以内でご記入ください' }, { status: 400 })
    }

    // ── Supabase に保存（service role で RLS バイパス） ────────
    const admin = createAdminClient()
    const { error } = await admin
      .from('contact_inquiries')
      .insert({
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        category,
        message:  message.trim(),
        status:   'new',
      })

    if (error) {
      console.error('Contact inquiry insert error:', error)
      return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
