import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature')
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')

    if (!signature || !secret) {
      return new Response(JSON.stringify({ error: 'Missing signature or secret' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.text()
    
    // Verify signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    )
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      console.error('Invalid signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const event = JSON.parse(body)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing event: ${event.event}`)

    const payload = event.payload
    const subscription = payload.subscription ? payload.subscription.entity : null
    const payment = payload.payment ? payload.payment.entity : null
    
    // Get user_id from notes
    const userId = (subscription?.notes?.user_id) || (payment?.notes?.user_id)
    const plan = (subscription?.notes?.plan) || (payment?.notes?.plan)

    if (!userId) {
      console.error('No user_id found in notes')
      return new Response(JSON.stringify({ message: 'No user_id found, ignoring' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged':
        // Update user plan
        await supabaseClient
          .from('users')
          .update({
            plan: plan,
            razorpay_subscription_id: subscription.id,
            subscription_status: 'active',
            subscription_period_end: new Date(subscription.current_end * 1000).toISOString(),
          })
          .eq('id', userId)

        // Log payment
        if (payment) {
          await supabaseClient.from('payments').insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            plan: plan,
            type: 'subscription',
          })
        }

        // Trigger Notification
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: 'premium_unlock',
          message: `Welcome to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan! Your premium features are now unlocked.`,
        });

        // Affiliate/Referral Logic
        try {
          // 1. Get the user's referral info
          const { data: userData } = await supabaseClient
            .from('users')
            .select('referred_by')
            .eq('id', userId)
            .single();

          if (userData?.referred_by) {
            // 2. Find the referrer by their code
            const { data: referrer } = await supabaseClient
              .from('users')
              .select('id, name')
              .eq('referral_code', userData.referred_by)
              .single();

            if (referrer) {
              const commissionRate = 0.30; // 30% commission
              const amountInInr = (payment?.amount || subscription?.amount || 0) / 100;
              const commission = amountInInr * commissionRate;

              if (commission > 0) {
                // 3. Update or Insert referral record
                const { error: refError } = await supabaseClient
                  .from('referrals')
                  .upsert({
                    referrer_id: referrer.id,
                    referred_id: userId,
                    converted_at: new Date().toISOString(),
                    commission_amount: commission
                  }, { onConflict: 'referred_id' });

                if (!refError) {
                  // 4. Increment referrer's earnings
                  await supabaseClient.rpc('increment_affiliate_earnings', {
                    user_id: referrer.id,
                    amount: commission
                  });

                  // 5. Notify referrer
                  await supabaseClient.from('notifications').insert({
                    user_id: referrer.id,
                    type: 'alert',
                    message: `You earned ₹${commission.toFixed(2)} commission! Someone you referred just upgraded their plan.`,
                  });
                }
              }
            }
          }
        } catch (affError) {
          console.error('Affiliate Logic Error:', affError);
          // Don't fail the whole webhook if affiliate logic fails
        }
        break;

      case 'subscription.cancelled':
      case 'subscription.expired':
        await supabaseClient
          .from('users')
          .update({
            subscription_status: 'cancelled',
            // We keep the plan until the period end, or revert to free if immediate
            // For now, let's just update status
          })
          .eq('id', userId)
        break;

      case 'payment.failed':
        // Handle payment failure if needed (maybe notify user)
        if (payment) {
          await supabaseClient.from('payments').insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription?.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'failed',
            plan: plan,
            type: 'subscription',
          })
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
