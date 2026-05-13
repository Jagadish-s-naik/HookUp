# HookAI — Sprint Plan & Build Order

**Total Phase 1 timeline:** 6 weeks  
**Team size assumed:** 1–2 developers  
**Stack:** React + Vite + Supabase + Claude API + Razorpay  

---

## Pre-Sprint: Setup (Day 1–2)

Before writing a line of product code:

- [ ] Create Supabase project, note URL and anon key
- [ ] Run `03_DATABASE_SCHEMA.sql` in Supabase SQL editor
- [ ] Set up Supabase Auth — enable Email and Google OAuth providers
- [ ] Create Supabase Storage bucket: `avatars` (public read, authenticated write)
- [ ] Create Vite + React + TypeScript project: `npm create vite@latest hookai -- --template react-ts`
- [ ] Install dependencies: tailwindcss, @supabase/supabase-js, zustand, @tanstack/react-query, react-router-dom, framer-motion, react-hot-toast, zod, recharts, lucide-react
- [ ] Set up `.env.local` with Supabase URL and anon key
- [ ] Create Supabase CLI project, link to remote: `supabase link --project-ref <ref>`
- [ ] Set up Vercel project, connect GitHub repo, add env vars
- [ ] Create Razorpay account, complete KYC, enable Subscriptions
- [ ] Create `hookai_starter` plan in Razorpay dashboard (₹499/month)
- [ ] Register for Razorpay Payouts (affiliate payout) — submit application early (takes 1–2 weeks approval)

---

## Sprint 1 — Week 1: Auth + Skeleton

**Goal:** Working auth flow, empty dashboard, routing complete.

### Tasks

**Day 1–2: Project scaffold**
- Set up Tailwind CSS with custom purple colour tokens
- Create base layout components: Sidebar, TopBar, PageWrapper, MobileNav
- Set up React Router with all routes defined (pages can be empty stubs)
- Set up Zustand stores: authStore, uiStore
- Configure React Query client with default cache settings
- Set up Framer Motion page transition wrapper

**Day 3–4: Auth flow**
- Supabase auth client (`lib/supabase.ts`)
- Login page (email/password + Google OAuth button)
- Signup page (email/password)
- Password reset page
- ProtectedRoute wrapper component
- Auth state listener in App.tsx (onAuthStateChange)
- Auto-create user row in public.users via DB trigger (already in schema)

**Day 5–7: Onboarding**
- 3-step onboarding wizard component
- Step 1: Name input + niche selector (dropdown of 10 niches)
- Step 2: Platform multi-select (5 platforms with icons)
- Step 3: Plan selection (Free highlighted, Starter shown with price)
- Save each step to Supabase users table on "Next" click
- Mark onboarding_complete = true on finish
- Redirect to /generate on complete
- Redirect to /onboarding if !onboarding_complete on protected route

**Deliverable:** User can sign up, complete onboarding, reach an empty /generate page. Google OAuth works.

---

## Sprint 2 — Week 2: Core Hook Generator

**Goal:** Users can generate hooks and see results. The core product works.

### Tasks

**Day 1–2: Edge Function**
- Create `supabase/functions/generate-hooks/index.ts`
- JWT verification middleware
- Zod input validation
- Plan limit check (query users table)
- Rate limit check (simple KV or in-DB counter)
- Claude API call with hook generation system prompt
- JSON parsing with jsonrepair fallback
- Insert all hooks into hooks table
- Increment hooks_used_today
- Return hooks array

**Day 3–5: Generator UI**
- GeneratorForm component: topic input, platform selector, tone selector, hook style selector, target audience field, language selector
- Cycling placeholder text on topic input (per niche)
- Submit handler → call Edge Function → loading state
- SkeletonCard component (animated pulse, matches hook card dimensions)
- HookCard component: hook text (JetBrains Mono), viral score badge (coloured), why-it-works tooltip, platform fit icons, copy button (with clipboard API), save button, thumbs up/down
- Staggered card fade-in animation on render (Framer Motion)
- 10 cards rendered: first 3 full, last 7 blurred (free tier)
- Error state with retry CTA

**Day 6–7: Plan gating**
- usePlan hook: reads plan from authStore, exposes canGenerate(), isFeatureAllowed()
- Usage counter in TopBar: "3/5 used today" for free users
- UpgradeModal component: feature comparison table, CTA button, accepts featureName prop to highlight relevant row
- Trigger UpgradeModal when limit hit or blurred cards clicked

**Deliverable:** End-to-end hook generation works. Free limit enforced. Upgrade modal appears correctly.

---

## Sprint 3 — Week 3: Library + Payments

**Goal:** Hooks are saveable and searchable. Payment flow works end to end.

### Tasks

**Day 1–2: Hook Library**
- Save/unsave hook toggle (update is_saved in DB)
- /library page: grid of saved hooks
- Search input with debounce (ilike query)
- Filter panel: platform, viral score range, content type
- Sort options: newest, highest score, highest rated
- Empty state component with generate CTA
- Copy action on saved hooks
- Delete hook with confirm dialog

**Day 3–4: Razorpay checkout**
- Create `supabase/functions/razorpay-checkout/index.ts`
- Create/fetch Razorpay customer
- Create subscription via Razorpay API
- Return subscription details to frontend
- `lib/razorpay.ts`: loadRazorpayScript(), openCheckout(subscriptionData)
- Checkout success handler: verify payment, call update-plan endpoint
- Redirect to /payment/success or /payment/failed
- /payment/success page with confetti + dashboard CTA
- /payment/failed page with retry button

**Day 5–7: Webhook handler**
- Create `supabase/functions/razorpay-webhook/index.ts`
- HMAC SHA256 signature verification
- Handle: payment.captured, subscription.activated, subscription.charged, payment.failed, subscription.cancelled
- Update users table plan and subscription_status on each event
- Insert into payments table
- Trigger welcome email on subscription.activated
- Return 400 on invalid signature

**Deliverable:** User can upgrade to Starter (₹499), payment succeeds, plan updates in DB, blurred cards unlock.

---

## Sprint 4 — Week 4: Referrals + Analytics + Notifications

**Goal:** Referral system live, analytics dashboard built, in-app notifications working.

### Tasks

**Day 1–2: Referral system**
- Referral code auto-generated on signup (DB trigger already in schema)
- /affiliate page: referral link display, copy button, share buttons
- Clicks tracked via UTM params on signup URL
- referred_by saved on signup if ref code in URL
- Basic affiliate dashboard: signups count, conversions count (DB query)
- Earnings balance display (static ₹0 until payout logic in Phase 2)

**Day 3–5: Analytics dashboard**
- /analytics page layout
- Metric cards: total hooks, avg viral score, saved hooks, top platform, current streak
- Streak calculation: consecutive days with ≥1 hook generated
- Count-up animation on metric card numbers (Framer Motion)
- Hooks per day line chart (Recharts, last 30 days, from hooks_daily view)
- Platform distribution donut chart (Recharts)
- Viral score distribution bar chart
- Hook style performance horizontal bar (based on user_rating)

**Day 6–7: Notifications**
- notifications table already in schema
- Bell icon in TopBar with unread count badge
- Dropdown notification list on click
- Mark as read on click
- Auto-create notifications in Edge Functions on key events:
  - After generation when at 80% of daily limit ("1 hook left today")
  - On payment success
  - On onboarding complete

**Deliverable:** Full Phase 1 feature set complete. App is launchable.

---

## Sprint 5 — Week 5: Polish + Testing + Landing Page

**Goal:** Production-ready quality. Landing page live with demo.

### Tasks

**Day 1–2: Landing page**
- Hero section with live demo input (calls a public rate-limited Edge Function)
- Demo generates 3 hooks without signup (IP limited)
- Social proof bar: creator count + platform logos
- Feature sections with descriptive content
- Pricing section: Free + Starter cards with monthly/annual toggle
- Testimonials section (use placeholder realistic content)
- FAQ accordion (8 questions)
- CTA banner: "Generate your first 5 hooks free"
- Footer: links, privacy policy, terms of service stubs

**Day 3–4: Error boundaries and empty states**
- Error boundary on Generator, Library, Analytics, Calendar, Payment
- All empty states: Library, Analytics, Calendar, Affiliate
- Loading skeletons: Library grid, Analytics charts, Notification list
- Toast notifications for: copy success, save success, save error, generation error

**Day 5: Dark mode**
- CSS variable theming for all components
- Dark mode toggle in Account settings
- Save preference to localStorage
- All components tested in both modes

**Day 6–7: Mobile responsiveness**
- Bottom tab bar for mobile (5 tabs: Generate, Library, Calendar, Analytics, Account)
- Generator form stacks vertically on mobile
- Hook cards full-width on mobile
- Sidebar hidden on mobile
- All modals scrollable on small screens

**Deliverable:** Polished, mobile-responsive app with landing page. Ready for ProductHunt.

---

## Sprint 6 — Week 6: Launch Prep

**Goal:** Everything tested, deployed, monitored.

### Tasks

**Day 1–2: Testing**
- Test full signup → onboarding → generate → save → upgrade → generate more flow
- Test Razorpay checkout with test credentials
- Test webhook events with Razorpay test dashboard
- Test daily limit reset
- Test all error states (invalid API key, network failure, etc.)
- Test on mobile (iOS Safari, Android Chrome)

**Day 3–4: Performance**
- Run Lighthouse on /generate and landing page, fix issues to reach 90+
- Add React.lazy() + Suspense for all page components
- Verify React Query cache is working (check Network tab)
- Compress all images in landing page
- Add meta tags and OG image for social sharing

**Day 5: Security review**
- Verify RLS is blocking cross-user data access (test with two accounts)
- Verify Edge Functions reject requests with invalid JWT
- Verify webhook rejects invalid signatures
- Verify demo rate limiting works (try 4+ requests from same IP)
- Check no API keys in client bundle (run `grep -r "RAZORPAY_KEY_SECRET" dist/`)

**Day 6–7: Go live**
- Switch Razorpay from test to live mode
- Set live API keys in Vercel and Supabase secrets
- Set up UptimeRobot monitoring on key URLs
- Create ProductHunt page (schedule for Day 1 launch)
- Post in 3 Indian creator communities with demo link

---

## Phase 2 Sprint Plan (Weeks 7–14)

### Week 7–8: Caption Writer
- Edge Function: generate-caption
- Caption page UI with platform tabs
- Rich text editor with character counter
- Platform-specific output formatting

### Week 9–10: Brand Voice AI + Pro tier
- Edge Function: analyze-brand-voice
- Brand Voice page UI
- Update generator form with "use brand voice" toggle
- Launch Pro plan (₹1,299) in Razorpay
- Pro plan gating on brand voice + unlimited hooks

### Week 11: Credit top-up + Affiliate payouts
- ₹199 credit top-up via Razorpay Payment Link
- extra_hook_credits integration in generator
- Affiliate payout request flow (Razorpay Payouts)

### Week 12–13: Analytics V2 + Weekly digest email
- Enhanced analytics: hook style performance tracking
- AI-generated weekly insight (Monday Claude call)
- Resend weekly digest email template
- Re-engagement email for 7-day dormant users

### Week 14: Polish + Pro launch
- Pro tier public announcement
- Upgrade modal updated for 3-tier comparison
- Annual plan with 20% discount

---

## Phase 3 Sprint Plan (Months 4–7)

- Month 4: Content Calendar (30-day AI generation, drag-drop)
- Month 4: Repurpose Engine (6 output formats)
- Month 5: Trending Topic Radar
- Month 5: Hook A/B Tester
- Month 6: Competitor Hook Spy
- Month 6: Share-as-image card (html2canvas)
- Month 7: Multi-language (Hindi priority)

---

## Phase 4 Sprint Plan (Month 8+)

- Agency team workspaces
- Content approval workflow
- White-label (agency logo)
- API access for Agency plan
- Instagram/TikTok OAuth performance import
- Invoice download page

---

## Definition of Done

A feature is "done" when:
1. Works on desktop Chrome, mobile Chrome, mobile Safari
2. Dark mode tested and correct
3. Loading state implemented
4. Error state implemented
5. Empty state implemented (if applicable)
6. Plan gating enforced (if applicable)
7. No console errors in production build
