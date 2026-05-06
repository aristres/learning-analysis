import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/parent/dashboard'

  // Vercel 本番環境では x-forwarded-host を優先使用
  const forwardedHost = request.headers.get('x-forwarded-host')
  const baseUrl = forwardedHost
    ? `https://${forwardedHost}`
    : origin

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // ── パターン1: メール確認リンク（token_hash + type） ──────────────
  // Supabase がメール確認に使う形式
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // ── パターン2: OAuth / PKCE コード交換（code） ────────────────────
  // Google/GitHub ログインや一部のメール確認で使われる形式
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // ── どちらも失敗した場合はエラーページへ ──────────────────────────
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_failed`)
}
