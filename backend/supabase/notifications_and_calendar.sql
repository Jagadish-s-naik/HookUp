-- Migration: Create notifications and scheduled_posts tables
-- To be run in Supabase SQL Editor

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL, -- 'welcome', 'premium_unlock', 'alert', 'info'
  message     text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Scheduled Posts Table (for Content Calendar)
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL,
  content       text,
  platform      text NOT NULL, -- 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'
  scheduled_at  timestamptz NOT NULL,
  status        text DEFAULT 'pending', -- 'pending', 'posted', 'failed'
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled posts"
  ON public.scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own scheduled posts"
  ON public.scheduled_posts FOR ALL
  USING (auth.uid() = user_id);

-- 3. Initial Notifications Trigger (Example: Welcome notification)
CREATE OR REPLACE FUNCTION public.handle_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, message)
  VALUES (NEW.id, 'welcome', 'Welcome to HookUp! Start generating viral hooks and growing your audience.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_welcome_notification();
