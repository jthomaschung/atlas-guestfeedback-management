-- Enable RLS on catering_orders table
ALTER TABLE catering_orders ENABLE ROW LEVEL SECURITY;

-- Create a policy for admins to view all catering orders
CREATE POLICY "Admins can view all catering orders" 
ON catering_orders 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create a policy for admins to insert catering orders
CREATE POLICY "Admins can insert catering orders" 
ON catering_orders 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Create a policy for admins to update catering orders
CREATE POLICY "Admins can update catering orders" 
ON catering_orders 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create a policy for admins to delete catering orders
CREATE POLICY "Admins can delete catering orders" 
ON catering_orders 
FOR DELETE 
USING (is_admin(auth.uid()));