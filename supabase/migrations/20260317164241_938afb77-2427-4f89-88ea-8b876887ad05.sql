
-- Add receipt columns to refund_requests
ALTER TABLE public.refund_requests
ADD COLUMN IF NOT EXISTS receipt_image_url text,
ADD COLUMN IF NOT EXISTS receipt_bypassed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS receipt_bypass_reason text;

-- Create storage bucket for refund receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('refund-receipts', 'refund-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload refund receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'refund-receipts');

-- Allow anyone to view refund receipts
CREATE POLICY "Refund receipts are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'refund-receipts');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete refund receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'refund-receipts');
