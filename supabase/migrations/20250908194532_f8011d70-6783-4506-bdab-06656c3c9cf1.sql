-- Enable RLS on tables that don't have it (excluding views)
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;

-- Add basic admin-only policies for the tables that need them
CREATE POLICY "Admins can view all import batches" ON import_batches FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert import batches" ON import_batches FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update import batches" ON import_batches FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete import batches" ON import_batches FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all training completions" ON training_completions FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert training completions" ON training_completions FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update training completions" ON training_completions FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete training completions" ON training_completions FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all training completion history" ON training_completion_history FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert training completion history" ON training_completion_history FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update training completion history" ON training_completion_history FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete training completion history" ON training_completion_history FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all employees" ON employees FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert employees" ON employees FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update employees" ON employees FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete employees" ON employees FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert orders" ON orders FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all customers" ON customers FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert customers" ON customers FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update customers" ON customers FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete customers" ON customers FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all stores" ON stores FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert stores" ON stores FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update stores" ON stores FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete stores" ON stores FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all positions" ON positions FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert positions" ON positions FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update positions" ON positions FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete positions" ON positions FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all training modules" ON training_modules FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert training modules" ON training_modules FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update training modules" ON training_modules FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete training modules" ON training_modules FOR DELETE USING (is_admin(auth.uid()));