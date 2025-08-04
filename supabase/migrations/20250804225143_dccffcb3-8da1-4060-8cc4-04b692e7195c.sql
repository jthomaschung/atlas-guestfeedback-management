-- Add DELETE policy for work_orders table - only admins can delete
CREATE POLICY "Only admins can delete work orders" 
ON public.work_orders 
FOR DELETE 
USING (is_admin(auth.uid()));