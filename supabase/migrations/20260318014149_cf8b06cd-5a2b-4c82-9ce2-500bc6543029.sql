ALTER TABLE public.refund_requests 
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_phone text;