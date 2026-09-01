/**
 * Canonical market-name normalization.
 *
 * Markets should always be stored/displayed with a space between the
 * region letters and the number (e.g. "NE 4", not "NE4"). Various data
 * sources (webhook ingestion, manual store edits, older imports) have
 * historically written the no-space form, which caused the same market
 * to be treated as two different markets in reports and filters.
 *
 * Use this everywhere a market string from the database is displayed,
 * grouped, or compared, instead of re-implementing the regex locally.
 */
export function normalizeMarket(market: string | null | undefined): string {
  if (!market) return market ?? '';
  return market.trim().replace(/([A-Za-z]+)\s*(\d+)/, '$1 $2');
}
