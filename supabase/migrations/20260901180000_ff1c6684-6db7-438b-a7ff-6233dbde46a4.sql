-- Fix recurring "NE4" -> "NE 4" market-name drift at its source.
--
-- Root cause: supabase/functions/ingest-feedback (lookupMarketByStore) reads
-- stores.region verbatim and writes it onto customer_feedback.market on every
-- new webhook-ingested feedback record. stores.region for store numbers 799,
-- 965, and 1261 was still stored as 'NE4' (no space), so every new piece of
-- feedback for those stores kept re-introducing the exact value that
-- migrations 20251007145816, 20251104172054, and 20251118003823 already
-- cleaned up on customer_feedback / user_permissions. Those were one-time
-- patches on existing rows; they never touched stores.region, so the bad
-- value kept getting copied forward. ingest-feedback has been updated to
-- normalize on write going forward; this migration fixes the data itself.

-- 1. Fix the source of truth: stores.region.
UPDATE stores
SET region = regexp_replace(region, '([A-Za-z]+)\s*(\d+)', '\1 \2')
WHERE region ~ '^[A-Za-z]+\d+$';

-- 2. Re-sweep customer_feedback in case new "NE4" rows were ingested since
--    the last cleanup migration.
UPDATE customer_feedback
SET market = regexp_replace(market, '([A-Za-z]+)\s*(\d+)', '\1 \2')
WHERE market ~ '^[A-Za-z]+\d+$';

-- 3. Re-sweep user_permissions.markets arrays the same way.
UPDATE user_permissions
SET markets = ARRAY(
  SELECT DISTINCT regexp_replace(m, '([A-Za-z]+)\s*(\d+)', '\1 \2')
  FROM unnest(markets) AS m
  ORDER BY 1
)
WHERE EXISTS (
  SELECT 1 FROM unnest(markets) AS m WHERE m ~ '^[A-Za-z]+\d+$'
);

-- 4. The canonical markets table may have a stray no-space row (e.g. "NE4")
--    alongside the correctly-named row (e.g. "NE 4"), or on its own.
--    Repoint any user_market_permissions from the bad row to the good one
--    and drop the duplicate; if only the bad row exists, rename it in place.
DO $$
DECLARE
  bad_market RECORD;
  good_market_id UUID;
BEGIN
  FOR bad_market IN
    SELECT id, name FROM markets WHERE name ~ '^[A-Za-z]+\d+$'
  LOOP
    SELECT id INTO good_market_id
    FROM markets
    WHERE name = regexp_replace(bad_market.name, '([A-Za-z]+)\s*(\d+)', '\1 \2')
      AND id <> bad_market.id;

    IF good_market_id IS NOT NULL THEN
      UPDATE user_market_permissions
      SET market_id = good_market_id
      WHERE market_id = bad_market.id
        AND NOT EXISTS (
          SELECT 1 FROM user_market_permissions ump2
          WHERE ump2.market_id = good_market_id
            AND ump2.user_id = user_market_permissions.user_id
        );

      DELETE FROM user_market_permissions WHERE market_id = bad_market.id;
      DELETE FROM markets WHERE id = bad_market.id;
    ELSE
      UPDATE markets
      SET name = regexp_replace(bad_market.name, '([A-Za-z]+)\s*(\d+)', '\1 \2')
      WHERE id = bad_market.id;
    END IF;
  END LOOP;
END $$;
