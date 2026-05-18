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

    const {
      hook_id,
      topic,
      platform = 'instagram',
      tone = 'curiosity',
      target_audience = 'general audience',
      language = 'English',
      additional_context = '',
      include_hashtags = true
    } = await req.json()

    // If hook_id is provided, get the hook text to context
    let hook_text = ''
    if (hook_id) {
      const { data: hookData } = await supabaseClient
        .from('hooks')
        .select('hook_text')
        .eq('id', hook_id)
        .single()
      
      if (hookData) {
        hook_text = hookData.hook_text
      }
    }

    const systemPrompt = `You are a world-class social media copywriter. Your task is to write a high-converting viral caption based on a provided hook or topic.

Context:
- Platform: ${platform}
- Tone: ${tone}
- Target Audience: ${target_audience}
- Language: ${language}
${hook_text ? `- Starting Hook: ${hook_text}` : `- Topic: ${topic}`}
${additional_context ? `- Additional Context: ${additional_context}` : ''}

Platform Constraints:
- Instagram: Engaging, use emojis, line breaks for readability, max 2200 chars.
- LinkedIn: Professional yet relatable, focus on insights/value, max 3000 chars.
- TikTok/Reels: Short, punchy, conversational, max 2000 chars (focus on first 3 lines).
- X (Twitter): Extremely concise, punchy, max 280 chars.

Instructions:
1. Start with the hook (if provided) or create a strong opening sentence.
2. Structure the caption with clear value points or a narrative arc.
3. Include a clear Call to Action (CTA) at the end.
4. ${include_hashtags ? 'Include 3-5 highly relevant hashtags at the very end.' : 'Do not include hashtags.'}
5. Format the text for the specific platform (e.g., use emojis for IG/TikTok, structured lists for LinkedIn).
6. Output in ${language}.

Return ONLY a valid JSON object with the following fields. No preamble, no explanation.
{
  "caption_text": "the full caption content including the hook at the start",
  "hashtags": ["tag1", "tag2", "tag3"],
  "cta": "the specific call to action used"
}`

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
        messages: [{ role: 'user', content: `Generate a viral caption for ${platform}` }],
      }),
    })

    const aiResult = await response.json()
    const content = aiResult.content[0].text
    
    let result = { caption_text: '', hashtags: [], cta: '' }
    try {
      result = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse AI response', content)
      return new Response(JSON.stringify({ error: 'Failed to generate caption' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save to database
    const { data: insertedCaption, error: insertError } = await supabaseClient
      .from('captions')
      .insert({
        user_id: user.id,
        hook_id: hook_id || null,
        platform,
        caption_text: result.caption_text,
        hashtags: result.hashtags,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving caption', insertError)
    }

    return new Response(JSON.stringify(insertedCaption || result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
