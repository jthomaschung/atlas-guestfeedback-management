-- Fix INSERT policy on critical_feedback_approvals to use is_executive function
DROP POLICY IF EXISTS "Executives can insert their own approvals" ON critical_feedback_approvals;

CREATE POLICY "Executives can insert their own approvals" 
ON critical_feedback_approvals 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = approver_user_id 
  AND is_executive(auth.uid())
);