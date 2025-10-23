-- Drop the old restrictive update policy
DROP POLICY IF EXISTS "Admins and record creators can update feedback" ON customer_feedback;

-- Create new policy allowing updates for users with market/store access
CREATE POLICY "Users can update feedback for accessible stores"
ON customer_feedback
FOR UPDATE
USING (
  is_admin(auth.uid()) 
  OR user_has_market_access_v2(auth.uid(), market) 
  OR user_has_store_access(auth.uid(), store_number)
);