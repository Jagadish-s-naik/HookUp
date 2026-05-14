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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP
    const clientIp = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    // Rate limiting: check usage in the last 24 hours
    const { count, error: countError } = await supabaseClient
      .from('demo_usage')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (countError) {
      console.error('Error checking rate limit:', countError)
    }

    const DEMO_LIMIT = 5;
    if (count !== null && count >= DEMO_LIMIT) {
      return new Response(
        JSON.stringify({
          error: 'Demo limit reached. Please sign up for more!',
          limit_reached: true
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { topic } = await req.json()

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construct AI Prompt for a single high-quality hook
    const systemPrompt = `You are a world-class viral content strategist. Your goal is to turn a boring topic into a viral hook using psychological triggers like curiosity gaps, pattern interrupts, or social proof.

Return ONLY a valid JSON object with the following structure:
{
  "hook": "the hook text",
  "viral_score": 9.5,
  "trigger": "Curiosity Gap"
}

Keep the hook under 150 characters. Professional, punchy, and attention-grabbing. No markdown, no preamble.`

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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Generate a viral hook for topic: ${topic}` }],
      }),
    })

    const aiResult = await response.json()
    
    if (!aiResult.content || aiResult.content.length === 0) {
      throw new Error('AI failed to generate a response');
    }

    const content = aiResult.content[0].text
    
    let result;
    try {
      result = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      // Fallback if JSON parsing fails
      result = {
        hook: content.replace(/"/g, '').trim(),
        viral_score: 8.5,
        trigger: "Engagement"
      }
    }

    // Log the demo usage
    await supabaseClient
      .from('demo_usage')
      .insert({
        ip_address: clientIp,
        topic: topic.substring(0, 255)
      })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in demo-hooks function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
