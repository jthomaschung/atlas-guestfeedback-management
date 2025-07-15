-- Add completed_at column to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;