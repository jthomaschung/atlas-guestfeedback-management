-- Fix RLS policy so DMs can view their own acknowledgments
-- Currently only executives can SELECT, but DMs can INSERT
-- This causes acknowledgments to disappear on page reload for DMs

DROP POLICY IF EXISTS "Executives can view critical feedback approvals" ON public.critical_feedback_approvals;

-- Allow executives to view all acknowledgments, and DMs to view their own
CREATE POLICY "Users can view their own or all if executive"
ON public.critical_feedback_approvals
FOR SELECT
USING (
  is_executive(auth.uid()) OR 
  (approver_user_id = auth.uid() AND is_dm(auth.uid()))
);