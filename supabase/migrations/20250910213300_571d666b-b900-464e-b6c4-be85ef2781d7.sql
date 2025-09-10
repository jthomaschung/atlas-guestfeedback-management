-- Enable RLS only on actual tables, not views
ALTER TABLE training_completions_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for training completions history
CREATE POLICY "Admins can view training completions history" ON training_completions_history
  FOR SELECT USING (is_admin(auth.uid()));