UPDATE public.customer_feedback
SET type_of_feedback = 'FYI', updated_at = now()
WHERE type_of_feedback IS NULL
  AND feedback_text ILIKE '%FYI notification only%';