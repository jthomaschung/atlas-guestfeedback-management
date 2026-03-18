
-- Add dynamic approval flags and catering approval columns to refund_requests
ALTER TABLE public.refund_requests
  ADD COLUMN IF NOT EXISTS requires_director_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_catering_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS catering_approved_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS catering_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS catering_notes text;

-- Rename conceptually: manager_approved = DM approved (no column rename needed, just relabel in UI)
-- Backfill existing records: if amount > 25, mark requires_director_approval
UPDATE public.refund_requests
SET requires_director_approval = (refund_amount > 25)
WHERE requires_director_approval = false;
