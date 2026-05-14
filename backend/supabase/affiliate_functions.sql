-- Function to safely increment affiliate earnings
CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET affiliate_earnings = affiliate_earnings + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function (if needed for service role)
-- By default SECURITY DEFINER runs with owner privileges (postgres/superuser)
