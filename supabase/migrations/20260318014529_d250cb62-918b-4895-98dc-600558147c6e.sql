UPDATE public.refund_requests rr
SET customer_email = cf.customer_email,
    customer_phone = cf.customer_phone
FROM public.customer_feedback cf
WHERE cf.id = rr.feedback_id
  AND rr.customer_email IS NULL;