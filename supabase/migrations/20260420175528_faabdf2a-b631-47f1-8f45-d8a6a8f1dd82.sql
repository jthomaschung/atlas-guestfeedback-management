-- 1. Clear subject-line garbage that was stored as type_of_feedback
UPDATE customer_feedback
SET type_of_feedback = NULL
WHERE type_of_feedback ILIKE 'guest contact:%'
   OR type_of_feedback ~* 'store\s*#';

-- 2. Backfill FYI from body text
UPDATE customer_feedback
SET type_of_feedback = 'FYI'
WHERE type_of_feedback IS NULL
  AND feedback_text ILIKE '%FYI notification%';

-- 3. Backfill Guest Support from body text
UPDATE customer_feedback
SET type_of_feedback = 'Guest Support'
WHERE type_of_feedback IS NULL
  AND (
    feedback_text ILIKE '%please reach out%'
    OR feedback_text ILIKE '%please contact the guest%'
    OR feedback_text ILIKE '%please call the guest%'
  );