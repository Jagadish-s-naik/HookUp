-- Migration: Create demo_usage table for public landing page rate limiting
-- To be run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.demo_usage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address  text NOT NULL,
  topic       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but we use service role key in the edge function to bypass it
-- This table should not be readable by public users directly
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

-- Index for fast rate limiting lookups
CREATE INDEX IF NOT EXISTS demo_usage_ip_created_at_idx ON public.demo_usage(ip_address, created_at);

-- Optional: Clean up old demo logs older than 30 days
-- DELETE FROM public.demo_usage WHERE created_at < now() - interval '30 days';
