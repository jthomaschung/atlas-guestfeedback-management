-- Add display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT;

-- Create a function to generate default display names from first_name and last_name
CREATE OR REPLACE FUNCTION public.generate_display_name(first_name TEXT, last_name TEXT, email TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
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

-- Update existing profiles to have display names
UPDATE public.profiles 
SET display_name = generate_display_name(first_name, last_name, email)
WHERE display_name IS NULL;

-- Create a trigger to auto-generate display names for new users if not provided
CREATE OR REPLACE FUNCTION public.set_default_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name = generate_display_name(NEW.first_name, NEW.last_name, NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_display_name_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_default_display_name();