-- Create function to check if user is an executive
CREATE OR REPLACE FUNCTION public.is_executive(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_hierarchy 
    WHERE user_id = user_uuid 
    AND role IN ('ceo', 'vp', 'director', 'admin')
  );
$$;

-- Update RLS policy to allow executives to view all escalated feedback
DROP POLICY IF EXISTS "Users can view feedback for their accessible stores" ON customer_feedback;

CREATE POLICY "Users can view feedback for their accessible stores" 
ON customer_feedback 
FOR SELECT 
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR user_has_market_access_v2(auth.uid(), market) 
  OR user_has_store_access(auth.uid(), store_number)
  OR (resolution_status = 'escalated' AND is_executive(auth.uid()))
);