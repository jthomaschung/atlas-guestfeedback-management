-- Update RLS policy on critical_feedback_approvals to use is_executive function
DROP POLICY IF EXISTS "Executives can view critical feedback approvals" ON critical_feedback_approvals;

CREATE POLICY "Executives can view critical feedback approvals" 
ON critical_feedback_approvals 
FOR SELECT 
TO authenticated
USING (is_executive(auth.uid()));