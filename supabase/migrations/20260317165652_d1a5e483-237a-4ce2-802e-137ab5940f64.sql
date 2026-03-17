-- Add column for the refund completion receipt (proof of refund processed)
ALTER TABLE public.refund_requests ADD COLUMN IF NOT EXISTS refund_receipt_url text;
