# HookAI — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** May 2026  
**Status:** Active  
**Owner:** Founder  

---

## 1. Executive Summary

HookAI is an AI-powered viral content generator for social media creators. It helps creators generate scroll-stopping hooks, platform-specific captions, 30-day content calendars, and repurposed content across Instagram, TikTok, YouTube, LinkedIn, and X (Twitter).

The product is built on a freemium model with four pricing tiers, powered by Claude AI (Anthropic), Supabase for backend and auth, and Razorpay for Indian-market payments.

**Primary market:** Indian content creators (fitness, finance, tech, personal brand, education niches)  
**Secondary market:** Social media managers and small agencies  
**Revenue model:** Monthly/annual subscriptions via Razorpay + one-time credit top-ups  

---

## 2. Problem Statement

Content creators need to post consistently to grow their audience. The two biggest obstacles are:

1. **Hook paralysis** — not knowing how to start a post in a way that stops the scroll
2. **Content volume** — needing 5–7 posts per week across multiple platforms without burning out

Existing tools (ChatGPT, Jasper, Copy.ai) are generic, USD-priced, and require significant prompting expertise. No tool in the Indian market provides a structured, creator-specific workflow with INR pricing, UPI payments, and niche-aware generation.

---

## 3. Goals & Success Metrics

### Launch Goals (Month 1–2)
- 500 signups
- 50 paying Starter subscribers (₹499/month)
- MRR: ₹25,000
- Free-to-paid conversion rate: ≥10%

### Growth Goals (Month 3–6)
- 5,000 signups
- 200 paying subscribers (Starter + Pro)
- MRR: ₹1,00,000
- Churn rate: <8% monthly

### Scale Goals (Month 7–12)
- 20,000 signups
- 1,000+ paying subscribers
- MRR: ₹5,00,000
- NPS score: ≥50

### Key Product Metrics
- Daily active usage rate: ≥40% of paid users
- Average hooks generated per session: ≥3 generations
- Hook library save rate: ≥60% of generated hooks
- Free tier daily limit hit rate: ≥30% (signals upgrade opportunity)

---

## 4. User Personas

### Persona 1 — The Aspiring Creator (Free → Starter)
- Age: 22–28
- Niche: Fitness, Finance, Personal Brand
- Platforms: Instagram, TikTok
- Pain: Knows what to say but doesn't know how to say it in a way that gets views
- Behaviour: Posts 2–3 times/week, wants to go full-time
- Willingness to pay: ₹499/month if they see results in the first week

### Persona 2 — The Active Monetising Creator (Starter → Pro)
- Age: 25–35
- Niche: Finance, Tech, Education
- Platforms: YouTube, LinkedIn, Instagram
- Pain: Has content ideas but can't keep up with the volume needed across platforms
- Behaviour: Posts daily, earns ₹30,000–₹2,00,000/month from content
- Willingness to pay: ₹1,299/month easily — content is their business

### Persona 3 — The Social Media Manager / Agency (Pro → Agency)
- Age: 25–40
- Managing 3–10 client accounts
- Platforms: All
- Pain: Needs to produce high-volume content for multiple clients with different brand voices
- Behaviour: Batches content creation weekly
- Willingness to pay: ₹3,999/month — saves 20+ hours/month per client

---

## 5. Feature Requirements

### 5.1 Authentication & Onboarding

**Auth (Must Have)**
- Email + password signup/login via Supabase Auth
- Google OAuth via Supabase
- Password reset flow
- Session persistence across browser tabs
- Protected route redirects

**Onboarding Flow (Must Have)**
- Step 1: Name + niche selection (mandatory)
- Step 2: Platform selection — multi-select (mandatory)
- Step 3: Plan selection — skippable, defaults to Free
- Steps completable in under 90 seconds
- Onboarding state saved on each step (resume if browser closes)
- Brand voice setup deferred to dashboard prompt after Day 3

**User Profile (Must Have)**
- Fields: name, avatar_url, niche, platforms[], plan, hooks_used_today, hooks_used_month, referral_code, referred_by, onboarding_complete
- Avatar upload to Supabase Storage (2MB max, JPEG/PNG only)
- Profile editable from Account Settings

---

### 5.2 Hook Generator

**Core Generation (Must Have)**
- Topic input with cycling placeholder examples per niche
- Platform selector: Instagram / TikTok / YouTube / LinkedIn / X
- Content type: Reel/Short, Carousel, Long-form, Thread, Story
- Tone: Educational, Entertaining, Controversial, Inspirational, Curiosity, Fear/FOMO, Storytelling
- Hook style: Question, Bold Statement, Statistic, Story Opener, Listicle, Contrarian, How-to
- Target audience free-text field
- Language selector: English, Hindi, Spanish, Portuguese, French, Arabic

**Output (Must Have)**
- 10 hook cards per generation
- Each card: hook text, viral score (1–10), "why it works" tooltip, platform fit icons, copy button, save button, thumbs up/down rating
- Skeleton loading animation during generation
- Staggered card fade-in on render
- Free tier: 3 cards visible, 7 blurred with upgrade prompt

**Output (Nice to Have)**
- "Use my brand voice" toggle (Pro only)
- Share hook as branded PNG image
- Bulk export all hooks as CSV (Pro only)
- "Regenerate" button below results

**Limits & Gating**
- Free: 5 hooks/day, 1 platform, no brand voice
- Starter: 100 hooks/month, 3 platforms
- Pro: Unlimited hooks, all platforms, brand voice toggle
- Daily counter shown in header ("3/5 used today")
- Upgrade modal triggered on limit hit or gated feature click
- Upgrade modal highlights the exact feature attempted

---

### 5.3 Caption Writer

**Core (Must Have — Phase 2)**
- Select a saved hook or paste new hook as input
- Platform-specific output: opening line, 3-paragraph body, CTA, 15 hashtags, emoji suggestions
- Editable rich text area with character counter
- Platform formatting rules applied post-generation (IG line breaks, LinkedIn tone, X thread split)
- Copy all / Copy hashtags only / Copy caption only buttons

**Platform Formatting Rules**
- Instagram: line breaks between paragraphs, 2200 char warning
- TikTok: short punchy style, TikTok-native phrasing
- LinkedIn: professional tone, max 5 hashtags, no excessive emoji
- X/Twitter: thread option — splits into numbered 280-char tweets
- YouTube: description format with chapters suggestion

---

### 5.4 Content Calendar

**Core (Must Have — Phase 3)**
- Month view with day grid
- "Generate 30-day plan" button → AI creates posting schedule based on niche + platforms
- Each day entry: platform icon, content type, topic, hook preview, recommended post time
- Click day → slide-out panel with full content details
- Drag-and-drop to reschedule entries
- "Mark as posted" checkbox per entry
- Color coding by platform

**Limits**
- Starter: 7-day calendar only
- Pro: Full 30-day calendar
- Export as CSV (all plans) or PDF (Pro)

---

### 5.5 Brand Voice AI

**Core (Must Have — Phase 2)**
- Input: paste 5–10 existing posts (minimum 5 enforced)
- AI generates brand voice profile: tone keywords, vocabulary patterns, sentence style, punctuation style, emoji usage, engagement tactics, 2-sentence summary
- Profile saved to users table (brand_voice_summary)
- "Use my brand voice" toggle in generator adds summary to system prompt
- Edit/update profile anytime

**Limits**
- Pro and Agency only
- Agency: multiple brand profiles (one per client workspace)

---

### 5.6 Repurpose Engine

**Core (Must Have — Phase 3)**
- Input: paste YouTube script / blog post / podcast transcript (5000 char max)
- Output in 6 tabs:
  - TikTok/Reel scripts × 3 (hook + body + CTA, under 60 seconds)
  - Instagram carousel outline (10 slides)
  - X/Twitter threads × 3 (numbered tweets)
  - LinkedIn article outline
  - Standalone quotes × 5
  - Email newsletter section
- Each tab has copy + "refine further" prompt
- Session saved to repurpose_sessions table

**Limits:** Pro and Agency only

---

### 5.7 Hook Library

**Core (Must Have — Phase 1)**
- Searchable grid of all saved hooks
- Filters: platform, date range, viral score, rating, content type, language
- Sort: newest, highest viral score, highest rated
- Copy and delete per hook
- Folder creation for collections
- Bulk export as CSV

**Empty state:** "No saved hooks yet — generate your first hook" with CTA button

---

### 5.8 Analytics Dashboard

**Core (Must Have — Phase 2)**
- Metric cards: total hooks generated (all time / this month), average viral score, top platform, hooks saved, current streak
- Line chart: hooks generated per day (last 30 days)
- Donut chart: platform distribution
- Bar chart: viral score distribution
- Horizontal bar: hook style performance (based on user ratings)
- AI-generated weekly insight sentence

---

### 5.9 Trending Topic Radar

**Core (Nice to Have — Phase 3)**
- Daily refreshed feed of trending topics by niche
- Each card: trend name, platform, trend score, days trending, "Generate hooks" CTA
- Filter by platform and niche
- Bookmark topics

**Limits:** Pro and Agency only

---

### 5.10 Hook A/B Tester

**Core (Nice to Have — Phase 3)**
- Generate 2 hook variants for same topic simultaneously
- Manual engagement result input: views, likes, saves, shares
- Weighted engagement score calculation
- Winner badge display
- Aggregate style performance insight over time

**Limits:** Pro and Agency only

---

### 5.11 Competitor Hook Spy

**Core (Nice to Have — Phase 3)**
- Input: paste competitor's recent post captions (no URL scraping)
- AI identifies hook patterns, tone style, psychological triggers
- Output: 5 inspired original hooks using similar triggers
- Disclaimer shown on all outputs

**Limits:** Pro and Agency only

---

### 5.12 Team Workspaces (Agency)

**Core (Must Have — Phase 4)**
- Agency owner creates workspace with name + logo
- Invite up to 10 members via email
- Roles: admin, editor, viewer
- Client workspaces: separate brand profiles per client
- Content approval workflow: draft → pending → approved → posted
- White-label: agency logo replaces HookAI logo

**Limits:** Agency plan only

---

### 5.13 Affiliate Program

**Core (Must Have — Phase 2)**
- Unique referral link per user: hookai.com/ref/[code]
- 30% recurring commission on referred paying user's monthly subscription
- Affiliate dashboard: clicks, signups, conversions, earnings balance
- Payout request when balance ≥ ₹500 via Razorpay Payouts (UPI/bank)

---

## 6. Payment System

### Subscription Plans
| Plan | Monthly | Annual (20% off) | Razorpay Plan ID |
|------|---------|-----------------|-----------------|
| Starter | ₹499 | ₹4,790 | hookai_starter |
| Pro | ₹1,299 | ₹12,470 | hookai_pro |
| Agency | ₹3,999 | ₹38,390 | hookai_agency |

### Payment Flow
1. User clicks upgrade → Supabase Edge Function creates Razorpay subscription
2. Frontend opens Razorpay Checkout modal (rzp.open())
3. On payment.success → Edge Function verifies HMAC SHA256 signature
4. Verified → update user plan in Supabase → redirect to /dashboard

### Webhooks Handled
- payment.captured → activate subscription
- subscription.activated → update DB, trigger welcome email
- subscription.charged → log payment, extend period
- payment.failed → mark payment_failed, send retry email
- subscription.cancelled → downgrade to free after period ends

### One-time Credit Top-up
- "Buy 50 hooks" for free/Starter users → ₹199 via Razorpay Payment Link
- Credited instantly via webhook to extra_hook_credits column

---

## 7. Technical Requirements

### Stack
- Frontend: React 18 + Vite + TypeScript
- Styling: Tailwind CSS
- State: Zustand + React Query
- Animation: Framer Motion
- Charts: Recharts
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- AI: Claude API (claude-sonnet-4-20250514) via Supabase Edge Functions
- Payments: Razorpay Subscriptions API
- Email: Resend

### Non-functional Requirements
- All Claude API calls go through Edge Functions — API key never exposed client-side
- Rate limiting: max 10 API requests/minute per user on Edge Functions
- Input sanitisation with Zod on all form submissions
- RLS policies on all Supabase tables
- Razorpay webhook signature verification — reject invalid with 400
- All generated hooks stored in DB before returning to frontend (audit trail)
- Images stored in Supabase Storage with 2MB size limit
- React Query cache: hooks library 5 min, analytics 15 min
- Code splitting by route (lazy loading)
- Lighthouse score target: 90+ performance, 100 accessibility

### API Cost Controls
- Cache identical topic+platform+tone combinations for 24 hours
- Hard rate limit on free tier: 5/day with IP-based abuse prevention on demo
- 5,000 character max on repurpose engine input
- JSON repair utility (jsonrepair) + 1 retry on Claude parse failures

---

## 8. Design System

### Colours
- Primary: #7C3AED (purple-600)
- Success: #10B981 (emerald)
- Danger: #EF4444
- Warning: #F59E0B

### Typography
- Headings: Inter 600
- Body: Inter 400
- Hook text display: JetBrains Mono

### Layout
- Sidebar (desktop): 240px, collapsible to 64px icon-only
- Mobile: bottom tab bar (5 tabs) + hamburger for secondary screens
- Dark mode: full support via CSS variables + class toggle, saved to localStorage

### Key Interactions
- Page transitions: fade + slight Y translate (Framer Motion)
- Hook cards: staggered fade-in on generation
- Skeleton loading on all cards during AI generation
- Toast notifications: React Hot Toast, bottom-right, max 3 stacked
- Upgrade modal: scale + fade animation, feature comparison table

---

## 9. Routes

### Public
- / — Landing page with live demo
- /login
- /signup
- /pricing
- /ref/:code — Referral landing, auto-fills signup

### Authenticated
- /dashboard
- /generate
- /captions
- /calendar
- /repurpose
- /trending
- /brand-voice
- /ab-test
- /competitor-spy
- /library
- /library/folder/:id
- /analytics
- /team (Agency only)
- /affiliate
- /account
- /account/billing
- /account/invoices
- /onboarding

### Post-payment
- /payment/success
- /payment/failed

---

## 10. Environment Variables

### Client-side (.env)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RAZORPAY_KEY_ID
VITE_APP_URL
```

### Server-side (Supabase Edge Function secrets)
```
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RESEND_API_KEY
```

---

## 11. Out of Scope (V1)

- Native mobile app (iOS/Android) — web-first only
- Direct social media posting/scheduling integration
- Video content generation
- Image generation
- Podcast/audio features
- Multi-language UI (UI stays English in V1, content generation supports multiple languages)
- Public API for third-party developers (Phase 4 only)

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Claude API costs exceed revenue from free tier | High | High | Tight free limits, 24h caching, aggressive rate limiting |
| Claude returns malformed JSON | Medium | Medium | jsonrepair utility + 1 auto-retry |
| Razorpay UPI autopay failure rate | Medium | High | 3-day grace period, retry email, WhatsApp notification |
| Onboarding drop-off before generator | High | Medium | Max 3 mandatory steps, reach generator in 90 seconds |
| Indian creators unwilling to pay | Medium | High | ₹199 credit top-up as conversion bridge, free tier generous enough to show value |
| Prompt injection via topic input | Low | High | Zod sanitisation, content classifier before generation |

---

## 13. Launch Checklist

- [ ] Supabase project created, RLS policies active on all tables
- [ ] Edge Functions deployed: generate-hooks, generate-caption, razorpay-checkout, razorpay-webhook
- [ ] Razorpay Starter plan created (hookai_starter, ₹499/month)
- [ ] Razorpay webhook endpoint verified with test events
- [ ] Google OAuth configured and tested
- [ ] Referral code auto-generation on signup working
- [ ] Demo on landing page live with IP rate limiting
- [ ] Daily hook reset cron job active (midnight IST)
- [ ] Welcome email trigger active via Resend
- [ ] Error boundaries on all major sections
- [ ] Lighthouse score ≥ 90 on /generate route
- [ ] Privacy policy and terms of service pages live

---

*Document version 1.0 — update after each phase completion*
