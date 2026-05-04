import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/plan-generator'
import type { AnswersJson, LearningStyle } from '@/types'

function toLegacyLearningStyle(v2Type: string): LearningStyle {
  if (v2Type === 'visual') return 'visual'
  if (v2Type === 'auditory') return 'auditory'
  return 'kinesthetic'
}

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

      // 30日プラン / マンスリーの支払い完了 → plans を作成
      if ((productType === 'plan_30day' || productType === 'monthly') && childId) {
        const endDate = new Date()
        if (productType === 'plan_30day') {
          endDate.setDate(endDate.getDate() + 7)  // 1週間お試しプラン
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }

        // plan_json を生成するため、最新の完了済みアセスメントを取得
        let planJson = null
        try {
          // assessmentId が渡されていればそれを使い、なければ最新のものを取得
          let targetAssessmentId = assessmentId
          if (!targetAssessmentId) {
            const { data: latestAssessment } = await supabase
              .from('assessments')
              .select('id')
              .eq('child_id', childId)
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            targetAssessmentId = latestAssessment?.id ?? null
          }

          if (targetAssessmentId) {
            const { data: assessment } = await supabase
              .from('assessments')
              .select('answers_json, result_json, children(name)')
              .eq('id', targetAssessmentId)
              .single()

            if (assessment?.answers_json) {
              const answersJson = assessment.answers_json as AnswersJson
              const v2Type = (assessment.result_json as { v2?: { learning_type?: { primary_type?: string } } } | null)
                ?.v2?.learning_type?.primary_type ?? 'kinesthetic'
              const learningStyle = toLegacyLearningStyle(v2Type)
              const childrenRaw = assessment.children as unknown as { name: string } | { name: string }[] | null
              const childName = (Array.isArray(childrenRaw) ? childrenRaw[0]?.name : childrenRaw?.name) ?? ''

              planJson = generatePlan({
                domains: answersJson.domains,
                learningStyle,
                month: 1,
                effectiveStrategyIds: [],
                ineffectiveStrategyIds: [],
                previousStrategyIds: [],
                childName,
              })
            }
          }
        } catch (planErr) {
          console.error('Plan JSON generation failed in webhook:', planErr)
        }

        await supabase.from('plans').insert({
          child_id: childId,
          parent_id: userId,
          assessment_id: assessmentId,
          type: productType === 'plan_30day' ? '30day' : 'monthly',
          status: 'active',
          plan_json: planJson,
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
