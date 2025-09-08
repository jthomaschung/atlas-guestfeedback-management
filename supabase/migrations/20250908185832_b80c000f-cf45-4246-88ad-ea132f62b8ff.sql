-- Create a function to normalize market names (remove spaces from FL markets)
CREATE OR REPLACE FUNCTION public.normalize_market(market_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE 
    WHEN market_name ~ '^FL\s+\d+$' THEN REGEXP_REPLACE(market_name, '\s+', '', 'g')
    ELSE market_name
  END;
$$;

-- Create a function to check if user has access to a market (handles both formats)
CREATE OR REPLACE FUNCTION public.user_has_market_access(user_id uuid, target_market text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    WHERE up.user_id = $1 
    AND (
      target_market = ANY (up.markets) OR
      public.normalize_market(target_market) = ANY (up.markets) OR
      target_market = ANY (
        SELECT public.normalize_market(unnest(up.markets))
      )
    )
  );
$$;

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view feedback for their accessible stores" ON public.customer_feedback;

-- Create updated RLS policy using the new matching function
CREATE POLICY "Users can view feedback for their accessible stores" 
ON public.customer_feedback 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  public.user_has_market_access(auth.uid(), customer_feedback.market) OR
  EXISTS (
    SELECT 1
    FROM user_permissions up
    WHERE up.user_id = auth.uid() 
    AND customer_feedback.store_number = ANY (up.stores)
  )
);