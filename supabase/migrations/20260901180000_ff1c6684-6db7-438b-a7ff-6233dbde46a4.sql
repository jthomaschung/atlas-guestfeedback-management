-- Normalize market names ("NE4" -> "NE 4") everywhere they are stored.
--
-- Root cause: supabase/functions/ingest-feedback (lookupMarketByStore) reads
-- stores.region verbatim and writes it onto customer_feedback.market for every
-- new webhook-ingested record. stores.region for store numbers 799, 965, and
-- 1261 was still 'NE4' (no space), so each new piece of feedback for those
-- stores re-introduced the exact value that migrations 20251007145816,
-- 20251104172054, and 20251118003823 had already cleaned up. Those were
-- one-time UPDATEs on existing rows and never touched stores.region, so the
-- bad value kept getting copied forward. ingest-feedback now normalizes on
-- write; this migration fixes the stored data.
--
-- Each step resolves its table via to_regclass and skips it when absent, and
-- resolves the schema rather than assuming public, so this is safe to replay
-- against a project whose schema has drifted from the migrations folder.

DO $outer$
DECLARE
  tbl REGCLASS;
  ump REGCLASS;
  bad_market RECORD;
  good_market_id UUID;
  touched INT;
  pattern CONSTANT TEXT := '^[A-Za-z]+\d+$';
  repl_from CONSTANT TEXT := '([A-Za-z]+)\s*(\d+)';
  repl_to CONSTANT TEXT := '\1 \2';
BEGIN
  -- 1. Source of truth: stores.region
  tbl := coalesce(to_regclass('public.stores'), to_regclass('stores'));
  IF tbl IS NOT NULL THEN
    EXECUTE format(
      'UPDATE %s SET region = regexp_replace(region, %L, %L) WHERE region ~ %L',
      tbl, repl_from, repl_to, pattern
    );
    GET DIAGNOSTICS touched = ROW_COUNT;
    RAISE NOTICE 'stores.region (%) rows normalized: %', tbl, touched;
  ELSE
    RAISE NOTICE 'stores: not found, skipped';
  END IF;

  -- 2. Existing feedback records
  tbl := coalesce(to_regclass('public.customer_feedback'), to_regclass('customer_feedback'));
  IF tbl IS NOT NULL THEN
    EXECUTE format(
      'UPDATE %s SET market = regexp_replace(market, %L, %L) WHERE market ~ %L',
      tbl, repl_from, repl_to, pattern
    );
    GET DIAGNOSTICS touched = ROW_COUNT;
    RAISE NOTICE 'customer_feedback.market (%) rows normalized: %', tbl, touched;
  ELSE
    RAISE NOTICE 'customer_feedback: not found, skipped';
  END IF;

  -- 3. Array-based market permissions
  tbl := coalesce(to_regclass('public.user_permissions'), to_regclass('user_permissions'));
  IF tbl IS NOT NULL THEN
    EXECUTE format(
      'UPDATE %1$s SET markets = ARRAY('
      '  SELECT DISTINCT regexp_replace(m, %2$L, %3$L) FROM unnest(markets) AS m ORDER BY 1'
      ') WHERE EXISTS (SELECT 1 FROM unnest(markets) AS m WHERE m ~ %4$L)',
      tbl, repl_from, repl_to, pattern
    );
    GET DIAGNOSTICS touched = ROW_COUNT;
    RAISE NOTICE 'user_permissions.markets (%) rows normalized: %', tbl, touched;
  ELSE
    RAISE NOTICE 'user_permissions: not found, skipped';
  END IF;

  -- 4. Canonical markets table: merge any no-space duplicate into the
  --    correctly-named row, repointing permissions before deleting.
  tbl := coalesce(to_regclass('public.markets'), to_regclass('markets'));
  ump := coalesce(to_regclass('public.user_market_permissions'), to_regclass('user_market_permissions'));
  IF tbl IS NOT NULL THEN
    FOR bad_market IN
      EXECUTE format('SELECT id, name FROM %s WHERE name ~ %L', tbl, pattern)
    LOOP
      EXECUTE format(
        'SELECT id FROM %s WHERE name = regexp_replace(%L, %L, %L) AND id <> %L',
        tbl, bad_market.name, repl_from, repl_to, bad_market.id
      ) INTO good_market_id;

      IF good_market_id IS NOT NULL THEN
        IF ump IS NOT NULL THEN
          EXECUTE format(
            'UPDATE %1$s SET market_id = %2$L WHERE market_id = %3$L'
            '  AND NOT EXISTS (SELECT 1 FROM %1$s u2 WHERE u2.market_id = %2$L'
            '                  AND u2.user_id = %1$s.user_id)',
            ump, good_market_id, bad_market.id
          );
          EXECUTE format('DELETE FROM %s WHERE market_id = %L', ump, bad_market.id);
        END IF;
        EXECUTE format('DELETE FROM %s WHERE id = %L', tbl, bad_market.id);
        RAISE NOTICE 'markets: merged "%" into existing correctly-named row', bad_market.name;
      ELSE
        EXECUTE format(
          'UPDATE %s SET name = regexp_replace(name, %L, %L) WHERE id = %L',
          tbl, repl_from, repl_to, bad_market.id
        );
        RAISE NOTICE 'markets: renamed "%" in place', bad_market.name;
      END IF;
    END LOOP;
  ELSE
    RAISE NOTICE 'markets: not found, skipped';
  END IF;
END $outer$;
