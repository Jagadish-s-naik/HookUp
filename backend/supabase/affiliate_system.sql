-- ==========================================
-- Affiliate & Referral System Migration
-- ==========================================

-- 1. Function to atomically increment affiliate earnings
CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(p_user_id uuid, p_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET affiliate_earnings = COALESCE(affiliate_earnings, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Payout Requests Table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount       numeric NOT NULL,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Policies for payout_requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own payout requests') THEN
        CREATE POLICY "Users can view their own payout requests"
          ON public.payout_requests FOR SELECT
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own payout requests') THEN
        CREATE POLICY "Users can create their own payout requests"
          ON public.payout_requests FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Function to handle payout request safely
CREATE OR REPLACE FUNCTION public.request_payout(p_amount numeric)
RETURNS json AS $$
DECLARE
  v_user_earnings numeric;
BEGIN
  -- Get current earnings
  SELECT affiliate_earnings INTO v_user_earnings
  FROM public.users
  WHERE id = auth.uid();

  -- Validate earnings
  IF v_user_earnings IS NULL OR v_user_earnings < p_amount THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient earnings');
  END IF;

  -- Validate minimum amount
  IF p_amount < 500 THEN
    RETURN json_build_object('success', false, 'message', 'Minimum payout is ₹500');
  END IF;

  -- Deduct earnings and create request record
  UPDATE public.users
  SET affiliate_earnings = affiliate_earnings - p_amount
  WHERE id = auth.uid();

  INSERT INTO public.payout_requests (user_id, amount)
  VALUES (auth.uid(), p_amount);

  RETURN json_build_object('success', true, 'message', 'Payout request submitted successfully. Our team will process it soon.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
