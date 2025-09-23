-- Update the normalize_market function to handle both FL and AZ markets with spaces
CREATE OR REPLACE FUNCTION public.normalize_market(market_name text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT CASE 
    WHEN market_name ~ '^(FL|AZ)\s+\d+$' THEN REGEXP_REPLACE(market_name, '\s+', '', 'g')
    ELSE market_name
  END;
$function$;