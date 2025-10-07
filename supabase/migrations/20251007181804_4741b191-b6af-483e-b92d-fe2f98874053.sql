-- Fix the INSERT policy to properly allow both executives and DMs
DROP POLICY IF EXISTS "Executives and DMs can insert their own approvals" ON public.critical_feedback_approvals;

CREATE POLICY "Executives and DMs can insert their own approvals"
ON public.critical_feedback_approvals
FOR INSERT
WITH CHECK (
  auth.uid() = approver_user_id 
  AND (is_executive(auth.uid()) OR is_dm(auth.uid()))
);