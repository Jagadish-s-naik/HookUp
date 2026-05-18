// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan, billing_cycle = 'monthly' } = await req.json()

    if (!plan) {
      return new Response(JSON.stringify({ error: 'Plan is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Razorpay configuration
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Plan mapping (These IDs would be created in Razorpay Dashboard)
    const planIds: Record<string, string> = {
      'starter_monthly': Deno.env.get('RAZORPAY_PLAN_STARTER_MONTHLY') || 'plan_starter_monthly_mock',
      'starter_annual': Deno.env.get('RAZORPAY_PLAN_STARTER_ANNUAL') || 'plan_starter_annual_mock',
      'pro_monthly': Deno.env.get('RAZORPAY_PLAN_PRO_MONTHLY') || 'plan_pro_monthly_mock',
      'pro_annual': Deno.env.get('RAZORPAY_PLAN_PRO_ANNUAL') || 'plan_pro_annual_mock',
    }

    const planKey = `${plan}_${billing_cycle}`
    const razorpayPlanId = planIds[planKey]

    if (!razorpayPlanId) {
      return new Response(JSON.stringify({ error: 'Invalid plan or billing cycle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Razorpay Subscription
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: billing_cycle === 'monthly' ? 12 : 1, // 1 year of monthly or 1 year of annual
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          plan: plan,
        },
      }),
    })

    const subscription = await response.json()

    if (subscription.error) {
      console.error('Razorpay Error:', subscription.error)
      return new Response(JSON.stringify({ error: subscription.error.description }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        razorpay_key_id: keyId,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        plan_name: `HookAI ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        amount: plan === 'starter' ? 49900 : 129900, // In paise
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
