# HookAI — Technical Architecture Document

**Version:** 1.0  
**Date:** May 2026  

---

## 1. System Overview

HookAI is a client-server SaaS application with the following layers:

```
Browser (React SPA)
       ↓ HTTPS
Supabase Edge Functions (Deno)   ←→   Claude API (Anthropic)
       ↓                         ←→   Razorpay API
Supabase PostgreSQL + Auth + Storage
       ↓
Resend (transactional email)
```

The frontend is a React SPA served via a CDN (Vercel or Netlify). All sensitive operations — AI generation, payment processing, webhook handling — are handled exclusively by Supabase Edge Functions. The Claude API key and Razorpay secret key are never sent to the browser.

---

## 2. Frontend Architecture

### Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (global state)
- React Query / TanStack Query (server state + caching)
- React Router v6 (routing)
- Framer Motion (animations)
- Recharts (analytics charts)
- React Hot Toast (notifications)
- Zod (form validation)

### Folder Structure
```
src/
├── components/
│   ├── ui/                  # Reusable primitives (Button, Input, Badge, Modal)
│   ├── layout/              # Sidebar, TopBar, MobileNav, PageWrapper
│   ├── hooks/               # HookCard, HookGrid, ViralScoreBadge, SkeletonCard
│   ├── generator/           # GeneratorForm, PlatformSelector, ToneSelector
│   ├── calendar/            # CalendarGrid, DayPanel, CalendarEntry
│   ├── analytics/           # MetricCard, LineChart, DonutChart
│   └── modals/              # UpgradeModal, ConfirmModal, ShareModal
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── Generate.tsx
│   ├── Captions.tsx
│   ├── Calendar.tsx
│   ├── Repurpose.tsx
│   ├── BrandVoice.tsx
│   ├── Library.tsx
│   ├── Analytics.tsx
│   ├── Affiliate.tsx
│   ├── Account.tsx
│   └── payment/
│       ├── Success.tsx
│       └── Failed.tsx
├── store/
│   ├── authStore.ts         # User session, plan, usage counts
│   ├── generatorStore.ts    # Current generation state
│   └── uiStore.ts           # Sidebar state, dark mode, modals
├── hooks/
│   ├── useGenerate.ts       # Hook generation mutation
│   ├── usePlan.ts           # Plan checks, limit checks
│   ├── useLibrary.ts        # Library queries
│   └── useAnalytics.ts      # Analytics queries
├── lib/
│   ├── supabase.ts          # Supabase client init
│   ├── razorpay.ts          # Razorpay checkout helper
│   ├── api.ts               # Edge Function call wrappers
│   └── mockData.ts          # Demo mode mock data
├── types/
│   └── index.ts             # All TypeScript interfaces
└── utils/
    ├── planGating.ts        # Feature access check functions
    ├── formatters.ts        # Date, number, text formatters
    └── constants.ts         # Plan limits, platform lists, etc.
```

### State Management Strategy
- **Zustand** for global UI state (sidebar collapsed, dark mode, active modal, current plan)
- **React Query** for all server data (hooks library, analytics, calendar entries)
- **Local component state** for form inputs and transient UI
- React Query cache TTLs: hooks library = 5 min, analytics = 15 min, calendar = 10 min

### Route Protection
```typescript
// ProtectedRoute wrapper checks Supabase session
// If no session → redirect to /login
// If session + onboarding_complete = false → redirect to /onboarding
// Plan-gated routes (e.g. /team) check plan in authStore
```

### Demo Mode
When `VITE_SUPABASE_URL` is not set or API returns an error, the app falls back to mock data from `lib/mockData.ts`. A yellow banner is shown: "Demo mode — add API keys to go live." All mock data matches production data shape exactly.

---

## 3. Backend Architecture (Supabase)

### Edge Functions

All Edge Functions are Deno runtime, deployed to Supabase.

#### `generate-hooks`
- **Trigger:** POST from /generate page
- **Auth:** Verifies Supabase JWT from Authorization header
- **Steps:**
  1. Validate input with Zod schema
  2. Check rate limit (10 req/min per user via KV store)
  3. Check user's daily/monthly hook limit against users table
  4. Check 24h cache for identical topic+platform+tone
  5. Call Claude API with hook generation prompt
  6. Parse JSON response (jsonrepair on failure, 1 retry)
  7. Insert all 10 hooks into hooks table
  8. Increment hooks_used_today and hooks_used_month
  9. Return hook array to frontend
- **Error handling:** Return structured error with code for frontend to display

#### `generate-caption`
- **Trigger:** POST from /captions page
- **Auth:** Verifies Supabase JWT
- **Steps:**
  1. Accept hook_id or raw hook text + platform
  2. Fetch brand_voice_summary if Pro user and toggle is on
  3. Call Claude API with caption prompt
  4. Parse XML-tagged response sections
  5. Insert into captions table
  6. Return structured caption object

#### `analyze-brand-voice`
- **Trigger:** POST from /brand-voice page
- **Auth:** Verifies Supabase JWT, checks Pro plan
- **Steps:**
  1. Accept posts array (min 5, max 10)
  2. Call Claude API with brand voice analysis prompt
  3. Parse JSON response
  4. Update users table with brand_voice_summary
  5. Upsert brand_profiles table

#### `generate-calendar`
- **Trigger:** POST from /calendar page
- **Auth:** Verifies Supabase JWT, checks Starter+ plan
- **Steps:**
  1. Accept niche, platforms, start_date
  2. Call Claude API with calendar generation prompt
  3. Parse 30-item JSON array
  4. Bulk insert into calendar_entries table
  5. Return entries

#### `repurpose-content`
- **Trigger:** POST from /repurpose page
- **Auth:** Verifies Supabase JWT, checks Pro plan
- **Steps:**
  1. Accept original_content (max 5000 chars, enforced)
  2. Call Claude API with repurpose prompt
  3. Parse XML-tagged sections into output object
  4. Insert into repurpose_sessions table
  5. Return all 6 output tabs

#### `razorpay-checkout`
- **Trigger:** POST when user clicks upgrade
- **Auth:** Verifies Supabase JWT
- **Steps:**
  1. Fetch or create Razorpay customer for user
  2. Create Razorpay subscription with plan_id
  3. Update users table with razorpay_customer_id and pending subscription_id
  4. Return subscription details for frontend checkout

#### `razorpay-webhook`
- **Trigger:** POST from Razorpay webhook (no JWT — uses HMAC verification)
- **Security:** Verify X-Razorpay-Signature HMAC SHA256 against RAZORPAY_WEBHOOK_SECRET
- **Events handled:**
  - payment.captured → activate subscription, update plan
  - subscription.activated → update subscription_status, trigger welcome email
  - subscription.charged → insert into payments table, extend subscription_period_end
  - payment.failed → update subscription_status, trigger failure email
  - subscription.cancelled → schedule downgrade to free at period end
- **On invalid signature:** Return 400, log attempt

#### `reset-daily-hooks`
- **Trigger:** Supabase scheduled cron — runs daily at 00:00 IST (18:30 UTC)
- **Steps:**
  1. UPDATE users SET hooks_used_today = 0, last_reset_at = now()
  2. Also reset monthly counter on 1st of month

#### `send-email`
- **Trigger:** Called internally by other Edge Functions
- **Steps:** Compose email template, send via Resend API

---

## 4. Database Schema

### users
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  niche text,
  platforms text[],
  brand_voice_samples text[],
  brand_voice_summary text,
  plan text DEFAULT 'free' CHECK (plan IN ('free','starter','pro','agency')),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  subscription_status text,
  subscription_period_end timestamptz,
  hooks_used_today integer DEFAULT 0,
  hooks_used_month integer DEFAULT 0,
  extra_hook_credits integer DEFAULT 0,
  last_reset_at timestamptz,
  referral_code text UNIQUE,
  referred_by text,
  affiliate_earnings numeric DEFAULT 0,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### hooks
```sql
CREATE TABLE hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  platform text,
  content_type text,
  tone text,
  hook_style text,
  target_audience text,
  language text DEFAULT 'English',
  hook_text text NOT NULL,
  viral_score integer CHECK (viral_score BETWEEN 1 AND 10),
  why_it_works text,
  psychological_trigger text,
  platform_fit text[],
  user_rating integer CHECK (user_rating IN (-1, 1)),
  is_saved boolean DEFAULT false,
  folder_id uuid REFERENCES folders(id),
  brand_profile_id uuid REFERENCES brand_profiles(id),
  ab_test_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX hooks_user_id_idx ON hooks(user_id);
CREATE INDEX hooks_created_at_idx ON hooks(created_at DESC);
CREATE INDEX hooks_is_saved_idx ON hooks(user_id, is_saved);
```

### captions
```sql
CREATE TABLE captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hook_id uuid REFERENCES hooks(id),
  platform text,
  caption_text text,
  hashtags text[],
  created_at timestamptz DEFAULT now()
);
```

### calendar_entries
```sql
CREATE TABLE calendar_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id),
  date date NOT NULL,
  platform text,
  content_type text,
  topic text,
  hook_preview text,
  full_content text,
  content_pillar text,
  best_post_time text,
  is_posted boolean DEFAULT false,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);
```

### brand_profiles
```sql
CREATE TABLE brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id),
  name text,
  niche text,
  platforms text[],
  voice_samples text[],
  voice_summary text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### folders
```sql
CREATE TABLE folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#7C3AED',
  created_at timestamptz DEFAULT now()
);
```

### payments
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  razorpay_payment_id text,
  razorpay_subscription_id text,
  amount integer,
  currency text DEFAULT 'INR',
  status text,
  plan text,
  type text CHECK (type IN ('subscription','credit_topup')),
  created_at timestamptz DEFAULT now()
);
```

### workspaces
```sql
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);
```

### workspace_members
```sql
CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text CHECK (role IN ('admin','editor','viewer')),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz
);
```

### repurpose_sessions
```sql
CREATE TABLE repurpose_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_content text,
  outputs jsonb,
  created_at timestamptz DEFAULT now()
);
```

### ab_tests
```sql
CREATE TABLE ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label_a text DEFAULT 'Version A',
  label_b text DEFAULT 'Version B',
  hook_a_id uuid REFERENCES hooks(id),
  hook_b_id uuid REFERENCES hooks(id),
  results_a jsonb,
  results_b jsonb,
  winner text,
  created_at timestamptz DEFAULT now()
);
```

### referrals
```sql
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id),
  referred_id uuid NOT NULL REFERENCES users(id),
  converted_at timestamptz,
  commission_amount numeric DEFAULT 0,
  paid_at timestamptz
);
```

---

## 5. Row-Level Security Policies

```sql
-- Users can only read/update their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Apply same pattern to: hooks, captions, folders, brand_profiles,
-- calendar_entries, repurpose_sessions, ab_tests, payments, referrals

-- Workspace members can read workspace data
CREATE POLICY "workspace_member_read" ON workspaces
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );
```

---

## 6. Claude API Prompt Architecture

### Model
`claude-sonnet-4-20250514`

### Hook Generator System Prompt
```
You are a world-class viral content strategist with expertise in social media psychology
and copywriting. You specialize in creating hooks that stop the scroll.

User context:
- Platform: {platform}
- Content type: {content_type}
- Niche: {user_niche}
- Target audience: {target_audience}
- Tone: {tone}
- Hook style: {hook_style}
- Language: {language}
{brand_voice_prompt}

Task: Generate exactly 10 scroll-stopping hooks for this topic: {topic}

For each hook:
1. Apply proven psychological triggers (curiosity gap, social proof, FOMO, contrast, specificity)
2. Optimize for {platform} algorithm and user behaviour
3. Match the {tone} tone precisely
4. Stay under 150 characters for short-form, 300 for long-form

Return ONLY a valid JSON array, no other text:
[{
  "hook": string,
  "viral_score": number (1-10),
  "why_it_works": string (max 15 words),
  "psychological_trigger": string,
  "platform_fit": string[]
}]
```

### Brand Voice Analysis Prompt
```
Analyze these {count} posts and extract this creator's brand voice fingerprint.
Posts: {posts}

Return ONLY valid JSON, no other text:
{
  "tone_keywords": string[5],
  "vocabulary_patterns": string[5],
  "sentence_style": "short" | "medium" | "long",
  "punctuation_style": string,
  "emoji_usage": string,
  "engagement_tactics": string[3],
  "summary": string (2 sentences, used in future generation prompts)
}
```

### Content Calendar Prompt
```
You are a strategic content manager for top-performing creator accounts.

Creator profile:
- Niche: {niche}
- Platforms: {platforms}
- Content mix: 40% educational, 30% entertaining, 20% inspirational, 10% promotional

Generate a {days}-day content calendar starting {start_date}.
Return ONLY valid JSON array of {days} objects:
[{
  "day": number,
  "date": "YYYY-MM-DD",
  "platform": string,
  "content_type": string,
  "topic": string,
  "hook_preview": string (max 100 chars),
  "content_pillar": string,
  "best_post_time": string
}]
```

---

## 7. Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|--------------|-----|-------------|
| Identical hook generation (same topic+platform+tone+language) | Supabase KV / Edge Function cache | 24 hours | Never (content is same) |
| Hook library | React Query | 5 minutes | On new save/delete |
| Analytics data | React Query | 15 minutes | On manual refresh |
| Calendar entries | React Query | 10 minutes | On create/update/delete |
| Trending topics | Supabase table | 24 hours | Daily cron refresh |
| User profile | Zustand + React Query | Session | On plan change/update |

---

## 8. Error Handling

### Frontend
- Error boundaries on: generator, library, calendar, analytics, payment flow
- Friendly error states with retry CTA on all major sections
- Toast for transient errors (copy failed, save failed)
- Full page error for auth failures

### Edge Functions
```typescript
// Standard error response shape
{
  error: {
    code: string,      // "LIMIT_REACHED" | "PARSE_ERROR" | "AUTH_FAILED" | etc.
    message: string,   // Human-readable
    retryable: boolean
  }
}
```

### Claude API Failures
1. Parse failure → run jsonrepair → retry once
2. Second failure → return cached result if available
3. No cache → return generic error to user with "Try again" CTA
4. Log all failures to Supabase logs table for prompt debugging

---

## 9. Security Checklist

- [ ] ANTHROPIC_API_KEY only in Edge Function environment secrets
- [ ] RAZORPAY_KEY_SECRET only in Edge Function environment secrets
- [ ] All Edge Functions validate Supabase JWT before processing
- [ ] Razorpay webhook validates HMAC SHA256 signature
- [ ] Zod validation on all Edge Function inputs
- [ ] RLS enabled on all tables with tested policies
- [ ] Supabase Storage bucket policies: users can only read/write their own folder
- [ ] IP-based rate limiting on public demo endpoint (Cloudflare Turnstile)
- [ ] Input length limits enforced server-side (not just client-side)
- [ ] No user-controlled data included in Claude system prompt without sanitisation

---

## 10. Deployment

### Frontend
- Platform: Vercel (recommended) or Netlify
- Build command: `npm run build`
- Environment variables: set in Vercel dashboard
- Preview deployments: enabled for all PRs

### Edge Functions
- Deployed via Supabase CLI: `supabase functions deploy`
- Secrets managed via: `supabase secrets set KEY=value`
- Local development: `supabase functions serve`

### Database
- Migrations managed via Supabase CLI: `supabase db push`
- Migration files in: `supabase/migrations/`
- Seed data: `supabase/seed.sql`

### Monitoring
- Edge Function logs: Supabase dashboard → Edge Functions → Logs
- Database performance: Supabase dashboard → Database → Query Performance
- Error tracking: Sentry (optional, add in Phase 2)
- Uptime: UptimeRobot (free tier sufficient for launch)
