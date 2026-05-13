# HookAI — API Contracts

All API calls go through Supabase Edge Functions.  
Base URL: `https://<project-ref>.supabase.co/functions/v1`

All authenticated endpoints require:
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

---

## 1. Hook Generation

### POST `/generate-hooks`

**Auth:** Required  
**Plan gate:** Free (5/day), Starter (100/month), Pro (unlimited)

**Request**
```json
{
  "topic": "How I lost 10kg in 3 months",
  "platform": "instagram",
  "content_type": "reel",
  "tone": "inspirational",
  "hook_style": "story_opener",
  "target_audience": "beginners aged 22-30",
  "language": "English",
  "use_brand_voice": false
}
```

**Validation (Zod)**
- topic: string, min 3 chars, max 500 chars, required
- platform: enum ["instagram","tiktok","youtube","linkedin","x"], required
- content_type: enum ["reel","carousel","long_form","thread","story"], required
- tone: enum ["educational","entertaining","controversial","inspirational","curiosity","fomo","storytelling"], required
- hook_style: enum ["question","bold_statement","statistic","story_opener","listicle","contrarian","how_to"], required
- target_audience: string, max 200 chars, optional
- language: enum ["English","Hindi","Spanish","Portuguese","French","Arabic"], default "English"
- use_brand_voice: boolean, default false

**Response 200**
```json
{
  "hooks": [
    {
      "id": "uuid",
      "hook_text": "I was 30kg overweight and couldn't climb a flight of stairs. Here's the 3-step system that changed everything.",
      "viral_score": 9,
      "why_it_works": "Opens a vulnerability gap that creates instant relatability",
      "psychological_trigger": "social_proof",
      "platform_fit": ["instagram", "tiktok"],
      "created_at": "2026-05-13T10:00:00Z"
    }
    // ... 9 more
  ],
  "usage": {
    "used_today": 1,
    "limit_today": 5,
    "used_month": 12,
    "limit_month": null
  }
}
```

**Response 429 — Limit reached**
```json
{
  "error": {
    "code": "LIMIT_REACHED",
    "message": "You've used all 5 free hooks today. Upgrade to Starter for 100/month.",
    "retryable": false,
    "upgrade_feature": "daily_hooks"
  }
}
```

**Response 403 — Plan gate**
```json
{
  "error": {
    "code": "PLAN_REQUIRED",
    "message": "Brand voice is available on Pro plan and above.",
    "retryable": false,
    "upgrade_feature": "brand_voice"
  }
}
```

---

## 2. Caption Generation

### POST `/generate-caption`

**Auth:** Required  
**Plan gate:** All plans

**Request**
```json
{
  "hook_id": "uuid",
  "hook_text": "I was 30kg overweight...",
  "platform": "instagram",
  "use_brand_voice": true
}
```

Note: Provide either `hook_id` (fetches from DB) or `hook_text` (raw input). hook_id takes precedence.

**Response 200**
```json
{
  "caption": {
    "id": "uuid",
    "platform": "instagram",
    "opening": "Two years ago, I couldn't walk up a flight of stairs without losing my breath.",
    "body": "paragraph 1...\n\nparagraph 2...\n\nparagraph 3...",
    "cta": "Drop a 💪 if you're on the same journey. Save this for when you need motivation.",
    "hashtags": ["#weightloss", "#fitnessmotivation", "..."],
    "emojis": ["💪", "🔥", "✨"],
    "full_text": "Two years ago...\n\n...\n\n#weightloss...",
    "char_count": 1847,
    "created_at": "2026-05-13T10:00:00Z"
  }
}
```

---

## 3. Brand Voice Analysis

### POST `/analyze-brand-voice`

**Auth:** Required  
**Plan gate:** Pro and Agency only

**Request**
```json
{
  "posts": [
    "Post text 1...",
    "Post text 2...",
    "Post text 3...",
    "Post text 4...",
    "Post text 5..."
  ],
  "profile_name": "My Main Brand"
}
```

Validation: posts array min 5, max 10 items. Each post min 50 chars.

**Response 200**
```json
{
  "profile": {
    "id": "uuid",
    "name": "My Main Brand",
    "tone_keywords": ["bold", "conversational", "data-driven", "relatable", "direct"],
    "vocabulary_patterns": ["here's the thing", "no BS", "real talk", "unpopular opinion"],
    "sentence_style": "short",
    "punctuation_style": "minimal, uses ellipsis for pause",
    "emoji_usage": "1-2 per post, strategic placement, no decoration",
    "engagement_tactics": ["rhetorical questions", "shocking statistics", "personal story opener"],
    "summary": "Direct, no-fluff tone with data-backed points. Uses conversational language and personal vulnerability to build trust."
  }
}
```

---

## 4. Content Calendar Generation

### POST `/generate-calendar`

**Auth:** Required  
**Plan gate:** Starter (7-day), Pro (30-day)

**Request**
```json
{
  "days": 30,
  "start_date": "2026-06-01",
  "niche": "fitness",
  "platforms": ["instagram", "youtube"]
}
```

**Response 200**
```json
{
  "entries": [
    {
      "id": "uuid",
      "day": 1,
      "date": "2026-06-01",
      "platform": "instagram",
      "content_type": "reel",
      "topic": "Morning routine that burns fat without the gym",
      "hook_preview": "You don't need a gym membership to lose weight. Here's proof.",
      "content_pillar": "educational",
      "best_post_time": "7:00 AM"
    }
    // ... 29 more
  ]
}
```

---

## 5. Repurpose Content

### POST `/repurpose-content`

**Auth:** Required  
**Plan gate:** Pro and Agency only

**Request**
```json
{
  "original_content": "Full blog post or script text here... (max 5000 chars)",
  "source_type": "blog_post"
}
```

source_type: enum ["youtube_script", "blog_post", "podcast_transcript", "tweet_thread"]

**Response 200**
```json
{
  "session_id": "uuid",
  "outputs": {
    "tiktok_scripts": [
      {
        "title": "Version 1",
        "hook": "...",
        "body": "...",
        "cta": "...",
        "estimated_duration": "45 seconds"
      }
    ],
    "instagram_carousel": {
      "slide_count": 10,
      "slides": [
        { "slide": 1, "title": "Slide title", "bullets": ["point 1", "point 2"] }
      ]
    },
    "twitter_threads": [
      {
        "title": "Thread version 1",
        "tweets": [
          { "number": 1, "text": "Tweet text...", "char_count": 240 }
        ]
      }
    ],
    "linkedin_article": {
      "h1": "Article title",
      "sections": [
        { "h2": "Section heading", "key_points": ["point 1", "point 2"] }
      ]
    },
    "quotes": [
      "Standalone shareable quote 1",
      "Standalone shareable quote 2"
    ],
    "email_section": {
      "subject_line": "Subject: ...",
      "paragraphs": ["Para 1...", "Para 2...", "Para 3..."]
    }
  }
}
```

---

## 6. Razorpay Checkout

### POST `/razorpay-checkout`

**Auth:** Required

**Request**
```json
{
  "plan": "starter",
  "billing_cycle": "monthly"
}
```

plan: enum ["starter", "pro", "agency"]  
billing_cycle: enum ["monthly", "annual"]

**Response 200**
```json
{
  "subscription_id": "sub_xxxxxxxxxxxxx",
  "razorpay_key_id": "rzp_live_xxxxxxxxxx",
  "prefill": {
    "name": "Arjun Sharma",
    "email": "arjun@example.com"
  },
  "plan_name": "HookAI Starter",
  "amount": 49900
}
```

---

## 7. Razorpay Webhook

### POST `/razorpay-webhook`

**Auth:** None (uses HMAC signature verification)  
**Headers:** `X-Razorpay-Signature: <hmac_sha256>`

**Events handled:**
- `payment.captured`
- `subscription.activated`
- `subscription.charged`
- `payment.failed`
- `subscription.cancelled`
- `subscription.completed`

**Response 200** — on successful processing  
**Response 400** — on signature verification failure or unknown event

---

## 8. Library Queries (Direct Supabase Client)

These use the Supabase JS client directly from the frontend (with RLS enforced).

### Get saved hooks
```typescript
const { data } = await supabase
  .from('hooks')
  .select('*')
  .eq('is_saved', true)
  .order('created_at', { ascending: false })
  .range(0, 49); // pagination
```

### Search hooks
```typescript
const { data } = await supabase
  .from('hooks')
  .select('*')
  .eq('is_saved', true)
  .ilike('hook_text', `%${query}%`)
  .order('created_at', { ascending: false });
```

### Filter by platform and viral score
```typescript
const { data } = await supabase
  .from('hooks')
  .select('*')
  .eq('platform', 'instagram')
  .gte('viral_score', 7)
  .eq('is_saved', true);
```

### Get analytics summary
```typescript
const { data } = await supabase
  .from('user_analytics')
  .select('*')
  .single();

const { data: daily } = await supabase
  .from('hooks_daily')
  .select('day, count');
```

---

## 9. Error Codes Reference

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| AUTH_REQUIRED | No valid session token | 401 |
| AUTH_INVALID | Token expired or invalid | 401 |
| PLAN_REQUIRED | Feature requires higher plan | 403 |
| LIMIT_REACHED | Daily/monthly hook limit hit | 429 |
| RATE_LIMITED | Too many requests (10/min) | 429 |
| VALIDATION_ERROR | Invalid input data | 400 |
| GENERATION_FAILED | Claude API error after retry | 500 |
| PAYMENT_FAILED | Razorpay operation failed | 500 |
| SIGNATURE_INVALID | Webhook HMAC mismatch | 400 |
| NOT_FOUND | Resource does not exist | 404 |
