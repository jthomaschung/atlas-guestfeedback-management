-- Add assignee column to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN assignee TEXT;