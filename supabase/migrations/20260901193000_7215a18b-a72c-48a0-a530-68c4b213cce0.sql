-- Keep customer_feedback.market in sync with the store's current market.
--
-- customer_feedback.market is a denormalized snapshot stamped at ingest time
-- by supabase/functions/ingest-feedback (lookupMarketByStore). Nothing kept it
-- in sync afterwards, so when a store was reassigned to a different market its
-- historical feedback kept pointing at the old one. That is how market "NE 4"
-- kept appearing in reports with stores 799, 965 and 1261 attached to it long
-- after all three had moved to NE 1 / NE 2 and no store remained in NE 4.
--
-- This trigger closes that gap at the source: change a store's market and its
-- feedback follows immediately. It also repairs the related case where feedback
-- arrived before the store existed in `stores` (lookupMarketByStore returns
-- 'Unknown' then) -- adding the store now corrects its earlier feedback.
--
-- SECURITY DEFINER is required: customer_feedback carries extensive RLS
-- policies, and an admin editing a store in Settings will not necessarily have
-- row-level write access to every affected feedback row. Without it the sync
-- would silently update only part of the store's history. search_path is pinned
-- so the function cannot be redirected at call time.

CREATE OR REPLACE FUNCTION public.sync_feedback_market_from_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  touched INT;
BEGIN
  -- Never overwrite a real market with NULL.
  IF NEW.region IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE customer_feedback
  SET market = NEW.region
  WHERE store_number = NEW.store_number
    AND market IS DISTINCT FROM NEW.region;

  GET DIAGNOSTICS touched = ROW_COUNT;
  IF touched > 0 THEN
    RAISE NOTICE 'sync_feedback_market_from_store: store % -> %, % feedback row(s) resynced',
      NEW.store_number, NEW.region, touched;
  END IF;

  RETURN NEW;
END;
$fn$;

-- Fires only when region actually changes value.
DROP TRIGGER IF EXISTS trg_sync_feedback_market_on_region_change ON public.stores;
CREATE TRIGGER trg_sync_feedback_market_on_region_change
AFTER UPDATE OF region ON public.stores
FOR EACH ROW
WHEN (OLD.region IS DISTINCT FROM NEW.region)
EXECUTE FUNCTION public.sync_feedback_market_from_store();

-- Repairs feedback that arrived before the store was on file.
DROP TRIGGER IF EXISTS trg_sync_feedback_market_on_store_insert ON public.stores;
CREATE TRIGGER trg_sync_feedback_market_on_store_insert
AFTER INSERT ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.sync_feedback_market_from_store();
