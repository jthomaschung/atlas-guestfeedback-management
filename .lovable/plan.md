## Goal
Merge the existing "North East" (MN 1, MN 2, PA 1) and "South East" (FL 1, FL 2) regions into a single **East Region (Don)** containing all five markets.

## Changes

**1. `src/components/feedback/ExecutiveDashboard.tsx`**
- Update `regionalGroups`:
  - Remove `'south-east'` and `'north-east'` keys.
  - Add `'east': ['MN 1', 'MN 2', 'PA 1', 'FL 1', 'FL 2']`.
- Update the region `<Select>` dropdown:
  - Remove the `south-east` and `north-east` `SelectItem`s.
  - Add `<SelectItem value="east">East Region (Don)</SelectItem>` (placed after Mid West to keep the West → Mid → East ordering).
- Verify any region-label rendering elsewhere in the file (titles, headers) reflects "East Region" when `selectedRegion === 'east'`.

**2. `src/components/accuracy/CategoryComparisonChart.tsx`**
- Update the market→region map so all five markets share the same label:
  - `'FL 1': 'East Region'`
  - `'FL 2': 'East Region'`
  - `'MN 1': 'East Region'`
  - `'MN 2': 'East Region'`
  - `'PA 1': 'East Region'`
- Other regions (West Coast, Mid West) unchanged.

## Out of scope
- No database/permissions changes. `user_market_permissions` continues to grant access per individual market — Don's existing market assignments are unaffected.
- No edge function changes. Notification routing is per-market, not per-region.
- No sidebar/navigation changes.

## Verification
- Open Executive Oversight → region dropdown shows: West Coast (Tanner), Mid West (Michelle), East Region (Don). Selecting East Region aggregates all five markets.
- Accuracy → Category Comparison Chart groups FL 1, FL 2, MN 1, MN 2, PA 1 together under "East Region".