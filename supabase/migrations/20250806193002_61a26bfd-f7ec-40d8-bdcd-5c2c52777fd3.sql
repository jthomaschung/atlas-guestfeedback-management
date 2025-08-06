-- Add viewed column to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN viewed BOOLEAN DEFAULT FALSE;