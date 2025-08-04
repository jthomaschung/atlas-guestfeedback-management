-- Fix security issues by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.generate_display_name(first_name TEXT, last_name TEXT, email TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 
      first_name || ' ' || last_name
    WHEN first_name IS NOT NULL THEN 
      first_name
    WHEN last_name IS NOT NULL THEN 
      last_name
    ELSE 
      SPLIT_PART(email, '@', 1)
  END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name = public.generate_display_name(NEW.first_name, NEW.last_name, NEW.email);
  END IF;
  RETURN NEW;
END;
$$;