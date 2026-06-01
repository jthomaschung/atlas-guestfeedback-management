CREATE OR REPLACE FUNCTION public.auto_tag_fyi_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.type_of_feedback IS NULL OR trim(NEW.type_of_feedback) = '')
     AND NEW.feedback_text IS NOT NULL
     AND NEW.feedback_text ILIKE '%FYI notification%'
  THEN
    NEW.type_of_feedback := 'FYI';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_tag_fyi_feedback_trigger ON public.customer_feedback;
CREATE TRIGGER auto_tag_fyi_feedback_trigger
  BEFORE INSERT OR UPDATE OF feedback_text, type_of_feedback ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_tag_fyi_feedback();

UPDATE public.customer_feedback
SET type_of_feedback = 'FYI',
    resolution_notes = NULL
WHERE (type_of_feedback IS NULL OR trim(type_of_feedback) = '')
  AND feedback_text ILIKE '%FYI notification%';