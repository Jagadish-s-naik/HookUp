-- Payout Requests Table
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

CREATE POLICY "Users can view their own payout requests"
  ON public.payout_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payout requests"
  ON public.payout_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle payout request
CREATE OR REPLACE FUNCTION public.request_payout(p_amount numeric)
RETURNS json AS $$
DECLARE
  v_user_earnings numeric;
  v_result json;
BEGIN
  -- 1. Get current earnings
  SELECT affiliate_earnings INTO v_user_earnings
  FROM public.users
  WHERE id = auth.uid();

  -- 2. Validate
  IF v_user_earnings < p_amount THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient earnings');
  END IF;

  IF p_amount < 500 THEN
    RETURN json_build_object('success', false, 'message', 'Minimum payout is ₹500');
  END IF;

  -- 3. Deduct earnings and create request
  UPDATE public.users
  SET affiliate_earnings = affiliate_earnings - p_amount
  WHERE id = auth.uid();

  INSERT INTO public.payout_requests (user_id, amount)
  VALUES (auth.uid(), p_amount);

  RETURN json_build_object('success', true, 'message', 'Payout request submitted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
