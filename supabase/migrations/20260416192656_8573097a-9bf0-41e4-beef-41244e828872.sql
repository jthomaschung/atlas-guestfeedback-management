ALTER TABLE public.refund_requests
  DROP CONSTRAINT IF EXISTS refund_requests_status_check;

ALTER TABLE public.refund_requests
  ADD CONSTRAINT refund_requests_status_check
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'dm_approved'::text,
    'awaiting_director'::text,
    'awaiting_catering'::text,
    'approved'::text,
    'denied'::text,
    'completed'::text
  ]));