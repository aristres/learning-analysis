import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return _stripe
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata ?? {}

      const userId = metadata.user_id
      const childId = metadata.child_id
      const productType = metadata.product_type
      const assessmentId = metadata.assessment_id || null

      if (!userId || !productType) break

      // subscriptions を active に更新
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_payment_intent_id: session.payment_intent as string ?? null,
          stripe_subscription_id: session.subscription as string ?? null,
        })
        .eq('user_id', userId)
        .eq('product_type', productType)
        .eq('status', 'pending')

      // ベーシック診断の支払い完了 → assessments の payment_status を更新
      if (productType === 'basic_assessment' && assessmentId) {
        await supabase
          .from('assessments')
          .update({ payment_status: 'paid' })
          .eq('id', assessmentId)
          .eq('parent_id', userId)
      }

      // 30日プランの支払い完了 → plans を作成
      if (productType === 'plan_30day' && childId) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)

        await supabase.from('plans').insert({
          child_id: childId,
          parent_id: userId,
          assessment_id: assessmentId,
          type: '30day',
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
      }

      // マンスリーの支払い完了 → plans を作成
      if (productType === 'monthly' && childId) {
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        await supabase.from('plans').insert({
          child_id: childId,
          parent_id: userId,
          assessment_id: assessmentId,
          type: 'monthly',
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
      }

      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const newStatus =
        event.type === 'customer.subscription.deleted' ? 'cancelled' : subscription.status

      await supabase
        .from('subscriptions')
        .update({
          status: newStatus as string,
          current_period_start: subscription.billing_cycle_anchor ? new Date(subscription.billing_cycle_anchor * 1000).toISOString() : null,
          current_period_end: null,
        })
        .eq('stripe_subscription_id', subscription.id)

      break
    }
  }

  return NextResponse.json({ received: true })
}
