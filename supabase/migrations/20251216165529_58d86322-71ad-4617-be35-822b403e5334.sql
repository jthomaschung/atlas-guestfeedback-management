-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view feedback for their accessible stores" ON public.customer_feedback;

-- Create a new policy that allows all authenticated users to view all feedback
CREATE POLICY "All authenticated users can view all feedback"
ON public.customer_feedback
FOR SELECT
TO authenticated
USING (true);