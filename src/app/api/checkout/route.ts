import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { ProductType } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

// 商品タイプ → Stripe Price ID のマッピング
const PRICE_MAP: Record<ProductType, string> = {
  basic_assessment: process.env.STRIPE_PRICE_BASIC_ASSESSMENT!,
  plan_30day: process.env.STRIPE_PRICE_PLAN_30DAY!,
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
}

// 商品名マッピング（日本語）
const PRODUCT_NAMES: Record<ProductType, string> = {
  basic_assessment: 'くわしいチェック (1,480円)',
  plan_30day: '30日プラン (2,450円)',
  monthly: 'マンスリープラン (2,980円/月)',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productType, childId, assessmentId } = body as {
      productType: ProductType
      childId: string
      assessmentId?: string
    }

    if (!productType || !childId) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 既存の Stripe customer ID を取得
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single()

    let customerId = sub?.stripe_customer_id

    // customer が存在しなければ作成
    if (!customerId) {
      const { data: userData } = await supabase
        .from('users')
        .select('email, display_name')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: userData?.email ?? user.email ?? '',
        name: userData?.display_name ?? '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    }

    const priceId = PRICE_MAP[productType]
    if (!priceId) {
      return NextResponse.json({ error: '不明な商品タイプです' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Stripe Checkout セッション作成
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: productType === 'monthly' ? 'subscription' : 'payment',
      success_url: `${appUrl}/parent/payment/success?session_id={CHECKOUT_SESSION_ID}&productType=${productType}&childId=${childId}${assessmentId ? `&assessmentId=${assessmentId}` : ''}`,
      cancel_url: `${appUrl}/parent/payment/cancel`,
      metadata: {
        user_id: user.id,
        child_id: childId,
        product_type: productType,
        assessment_id: assessmentId ?? '',
      },
      locale: 'ja',
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // subscriptions レコードを作成（pending 状態）
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      stripe_customer_id: customerId,
      product_type: productType,
      status: 'pending',
      child_id: childId,
      assessment_id: assessmentId ?? null,
      amount:
        productType === 'basic_assessment'
          ? 1480
          : productType === 'plan_30day'
          ? 2450
          : 2980,
      currency: 'jpy',
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: '決済セッションの作成に失敗しました' }, { status: 500 })
  }
}
