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

    const { content, type } = await req.json()

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const systemPrompt = `You are a world-class social media copywriter and content repurposing engine. 
Your task is to take the user's original content and repurpose it into exactly 6 different formats.

Instructions:
1. TikTok/Reel scripts (3 variants): Provide a short, punchy script with a hook, body, and CTA under 60 seconds.
2. Instagram Carousel outline: Provide an engaging 10-slide outline with hook and key points.
3. X/Twitter threads (3 variants): Provide numbered tweets containing high value and strong hooks.
4. LinkedIn article outline: Professional but relatable article structure focusing on insights.
5. Standalone quotes (5 variants): Extract or create 5 highly shareable quotes.
6. Email newsletter section: Write an engaging newsletter section discussing this content.

Return ONLY a valid JSON object with the following structure, with no extra text or markdown formatting outside the JSON:
{
  "tiktok": "TikTok/Reel script text here (3 variants)",
  "carousel": "Carousel outline text here",
  "twitter": "X/Twitter threads text here (3 variants)",
  "linkedin": "LinkedIn article outline text here",
  "quotes": "Standalone quotes here (5 variants)",
  "newsletter": "Email newsletter section here"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Repurpose this content: \n\n${content}` }],
      }),
    })

    const aiResult = await response.json()
    const aiContent = aiResult.content[0].text
    
    let result = {}
    try {
      result = JSON.parse(aiContent)
    } catch (e) {
      console.error('Failed to parse AI response', aiContent)
      return new Response(JSON.stringify({ error: 'Failed to generate repurposed content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save to database
    const { data: insertedSession, error: insertError } = await supabaseClient
      .from('repurpose_sessions')
      .insert({
        user_id: user.id,
        original_content: content,
        outputs: result
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving repurpose session', insertError)
    }

    return new Response(JSON.stringify({ results: result, session: insertedSession }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in repurpose-content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
