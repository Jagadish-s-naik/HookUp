-- HookAI — Complete Database Schema
-- Run this in Supabase SQL editor or as a migration file
-- Version: 1.0

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- HELPER FUNCTION: generate referral code
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
BEGIN
  RETURN lower(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     text UNIQUE NOT NULL,
  name                      text,
  avatar_url                text,
  niche                     text,
  platforms                 text[] DEFAULT '{}',
  goal                      text,
  brand_voice_samples       text[] DEFAULT '{}',
  brand_voice_summary       text,
  plan                      text NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  razorpay_customer_id      text,
  razorpay_subscription_id  text,
  subscription_status       text,
  subscription_period_end   timestamptz,
  hooks_used_today          integer NOT NULL DEFAULT 0,
  hooks_used_month          integer NOT NULL DEFAULT 0,
  extra_hook_credits        integer NOT NULL DEFAULT 0,
  last_reset_at             timestamptz,
  referral_code             text UNIQUE DEFAULT generate_referral_code(),
  referred_by               text,
  affiliate_earnings        numeric NOT NULL DEFAULT 0,
  onboarding_complete       boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- Auto-create user row on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- FOLDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.folders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  color      text DEFAULT '#7C3AED',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- WORKSPACES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  logo_url   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- WORKSPACE MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_at   timestamptz NOT NULL DEFAULT now(),
  joined_at    timestamptz,
  UNIQUE(workspace_id, user_id)
);

-- ─────────────────────────────────────────────
-- BRAND PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  name         text NOT NULL DEFAULT 'My Brand',
  niche        text,
  platforms    text[] DEFAULT '{}',
  voice_samples text[] DEFAULT '{}',
  voice_summary text,
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- HOOKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hooks (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic                text NOT NULL,
  platform             text,
  content_type         text,
  tone                 text,
  hook_style           text,
  target_audience      text,
  language             text NOT NULL DEFAULT 'English',
  hook_text            text NOT NULL,
  viral_score          integer CHECK (viral_score BETWEEN 1 AND 10),
  why_it_works         text,
  psychological_trigger text,
  platform_fit         text[] DEFAULT '{}',
  user_rating          integer CHECK (user_rating IN (-1, 1)),
  is_saved             boolean NOT NULL DEFAULT false,
  folder_id            uuid REFERENCES public.folders(id) ON DELETE SET NULL,
  brand_profile_id     uuid REFERENCES public.brand_profiles(id) ON DELETE SET NULL,
  ab_test_id           uuid,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hooks_user_id_idx ON public.hooks(user_id);
CREATE INDEX IF NOT EXISTS hooks_user_saved_idx ON public.hooks(user_id, is_saved) WHERE is_saved = true;
CREATE INDEX IF NOT EXISTS hooks_created_at_idx ON public.hooks(created_at DESC);
CREATE INDEX IF NOT EXISTS hooks_viral_score_idx ON public.hooks(user_id, viral_score DESC);

-- ─────────────────────────────────────────────
-- CAPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.captions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hook_id      uuid REFERENCES public.hooks(id) ON DELETE SET NULL,
  platform     text,
  caption_text text,
  hashtags     text[] DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- CALENDAR ENTRIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id    uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  date            date NOT NULL,
  platform        text,
  content_type    text,
  topic           text,
  hook_preview    text,
  full_content    text,
  content_pillar  text,
  best_post_time  text,
  is_posted       boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  review_comment  text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_user_date_idx ON public.calendar_entries(user_id, date);

-- ─────────────────────────────────────────────
-- REPURPOSE SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.repurpose_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_content text,
  outputs          jsonb DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- A/B TESTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label_a    text NOT NULL DEFAULT 'Version A',
  label_b    text NOT NULL DEFAULT 'Version B',
  hook_a_id  uuid REFERENCES public.hooks(id) ON DELETE SET NULL,
  hook_b_id  uuid REFERENCES public.hooks(id) ON DELETE SET NULL,
  results_a  jsonb DEFAULT '{"views":0,"likes":0,"saves":0,"shares":0}',
  results_b  jsonb DEFAULT '{"views":0,"likes":0,"saves":0,"shares":0}',
  winner     text CHECK (winner IN ('a', 'b', 'tie')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES public.users(id),
  razorpay_payment_id      text,
  razorpay_subscription_id text,
  amount                   integer,
  currency                 text NOT NULL DEFAULT 'INR',
  status                   text,
  plan                     text,
  type                     text CHECK (type IN ('subscription', 'credit_topup')),
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);

-- ─────────────────────────────────────────────
-- REFERRALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       uuid NOT NULL REFERENCES public.users(id),
  referred_id       uuid NOT NULL REFERENCES public.users(id),
  converted_at      timestamptz,
  commission_amount numeric NOT NULL DEFAULT 0,
  paid_at           timestamptz,
  UNIQUE(referred_id)
);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       text NOT NULL,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ─────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: own row only" ON public.users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Hooks
ALTER TABLE public.hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hooks: own rows only" ON public.hooks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Captions
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "captions: own rows only" ON public.captions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "folders: own rows only" ON public.folders
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Calendar entries
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar: own rows only" ON public.calendar_entries
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Brand profiles
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_profiles: own rows only" ON public.brand_profiles
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Repurpose sessions
ALTER TABLE public.repurpose_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repurpose: own rows only" ON public.repurpose_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AB tests
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ab_tests: own rows only" ON public.ab_tests
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments: own rows read-only" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications: own rows only" ON public.notifications
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspaces: owner or member" ON public.workspaces
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

-- Workspace members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_members: own workspace" ON public.workspace_members
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals: referrer only" ON public.referrals
  USING (referrer_id = auth.uid());

-- ─────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────

-- Analytics summary per user
CREATE OR REPLACE VIEW public.user_analytics AS
SELECT
  user_id,
  COUNT(*) AS total_hooks,
  ROUND(AVG(viral_score), 1) AS avg_viral_score,
  COUNT(*) FILTER (WHERE is_saved = true) AS saved_hooks,
  MODE() WITHIN GROUP (ORDER BY platform) AS top_platform,
  COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') AS hooks_last_30_days
FROM public.hooks
GROUP BY user_id;

-- Daily hook counts for chart (last 30 days)
CREATE OR REPLACE VIEW public.hooks_daily AS
SELECT
  user_id,
  date_trunc('day', created_at) AS day,
  COUNT(*) AS count
FROM public.hooks
WHERE created_at >= now() - interval '30 days'
GROUP BY user_id, date_trunc('day', created_at)
ORDER BY day;
