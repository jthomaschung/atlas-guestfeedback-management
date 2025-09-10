-- Enable RLS on tables that don't have it enabled
ALTER TABLE completion_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions_history ENABLE ROW LEVEL SECURITY; 
ALTER TABLE v_training_trend ENABLE ROW LEVEL SECURITY;
ALTER TABLE v_training_trend_with_store ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for these tables
CREATE POLICY "Admins can view completion trends" ON completion_trends
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view training completions history" ON training_completions_history
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view training trend" ON v_training_trend
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view training trend with store" ON v_training_trend_with_store
  FOR SELECT USING (is_admin(auth.uid()));