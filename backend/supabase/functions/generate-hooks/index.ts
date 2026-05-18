// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
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

    // Get the user from the JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile and check limits
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('plan, hooks_used_today, niche, brand_voice_summary')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check plan limits
    const planLimits: Record<string, number> = {
      free: 5,
      starter: 20,
      pro: 50,
      agency: 999999,
    }

    const limit = planLimits[profile.plan as string] || 5
    if (profile.hooks_used_today >= limit) {
      return new Response(
        JSON.stringify({
          error: 'Daily limit reached',
          limit,
          used: profile.hooks_used_today,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const {
      topic,
      platform = 'instagram',
      content_type = 'reel',
      tone = 'curiosity',
      hook_style = 'question',
      target_audience = 'general audience',
      language = 'English',
      use_brand_voice = false,
    } = await req.json()

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construct AI Prompt
    const brand_voice_block = use_brand_voice && profile.brand_voice_summary
      ? `\nBrand voice instructions (apply to all hooks):\n${profile.brand_voice_summary}\n`
      : ''

    const systemPrompt = `You are a world-class viral content strategist with deep expertise in social media 
psychology, copywriting, and platform algorithms. You have studied thousands of 
viral posts and understand exactly what makes people stop scrolling.

User context:
- Platform: ${platform}
- Content type: ${content_type}
- Creator niche: ${profile.niche || 'general'}
- Target audience: ${target_audience}
- Tone: ${tone}
- Hook style: ${hook_style}
- Language: ${language}
${brand_voice_block}

Platform-specific rules:
- instagram/tiktok: under 125 characters, conversational, emotion-first
- youtube: under 200 characters, promise-oriented, outcome-first  
- linkedin: under 200 characters, professional insight or contrarian take
- x/twitter: under 280 characters, punchy, opinion-forward

Psychological triggers to use (pick the most relevant for this topic):
curiosity_gap | social_proof | fomo | contrast | specificity | 
pattern_interrupt | identity_signal | controversy | loss_aversion

Task: Generate exactly 10 scroll-stopping hooks for this topic.
Topic: ${topic}

Requirements:
1. Each hook must be distinctly different — no variations of the same sentence
2. Apply the ${hook_style} style as the primary approach
3. Match the ${tone} tone precisely throughout
4. Generate all output in ${language}
5. Every hook must create an immediate reason to keep reading

Return ONLY a valid JSON array with exactly 10 objects. No preamble, no explanation, 
no markdown. Start your response with [ and end with ].

[{
  "hook": "the hook text",
  "viral_score": 8,
  "why_it_works": "15 words max explaining the psychological mechanism",
  "psychological_trigger": "one of the trigger names listed above",
  "platform_fit": ["instagram", "tiktok"]
}]`

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Generate 10 hooks for topic: ${topic}` }],
      }),
    })

    const aiResult = await response.json()
    const content = aiResult.content[0].text
    
    // Parse the JSON array from AI
    let hooks = []
    try {
      hooks = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse AI response as JSON', content)
      return new Response(JSON.stringify({ error: 'Failed to generate valid hooks' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save hooks to database
    const hooksToInsert = hooks.map((h: any) => ({
      user_id: user.id,
      topic,
      platform,
      content_type,
      tone,
      hook_style,
      target_audience,
      language,
      hook_text: h.hook,
      viral_score: h.viral_score,
      why_it_works: h.why_it_works,
      psychological_trigger: h.psychological_trigger,
      platform_fit: h.platform_fit,
    }))

    const { data: insertedHooks, error: insertError } = await supabaseClient
      .from('hooks')
      .insert(hooksToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting hooks', insertError)
    }

    // Update user usage count
    const newUsage = profile.hooks_used_today + 1;
    await supabaseClient
      .from('users')
      .update({ hooks_used_today: newUsage })
      .eq('id', user.id)

    // Trigger Notification if near limit (80% or last one)
    if (newUsage === limit - 1) {
      await supabaseClient.from('notifications').insert({
        user_id: user.id,
        type: 'alert',
        message: 'You have only 1 hook left for today! Upgrade to unlock unlimited potential.',
      });
    } else if (newUsage === limit) {
      await supabaseClient.from('notifications').insert({
        user_id: user.id,
        type: 'alert',
        message: 'Daily limit reached! You have used all your hooks for today. Come back tomorrow or upgrade now.',
      });
    }

    return new Response(JSON.stringify({ hooks: insertedHooks || hooks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
