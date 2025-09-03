-- Add ee_action and period columns to customer_feedback table
ALTER TABLE public.customer_feedback 
ADD COLUMN ee_action TEXT,
ADD COLUMN period TEXT;