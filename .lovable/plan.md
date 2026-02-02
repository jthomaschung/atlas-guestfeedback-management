

# Backfill Period Values for All Stores

## Overview
Update all existing feedback records dated **P1 2026 onward** (>= 2025-12-31) to populate the `period` column based on the `periods` table. This affects **301 records** across all stores.

---

## Current State

| Metric | Value |
|--------|-------|
| Records needing update | 301 |
| Date range | >= 2025-12-31 |
| Current period value | NULL or empty |
| Stores affected | All stores with P1 2026+ feedback |

---

## Implementation Plan

### Step 1: Create Backfill Edge Function
Create a new edge function `backfill-periods` that:
1. Fetches all feedback where `feedback_date >= '2025-12-31'` AND `period IS NULL`
2. Loads all periods from the `periods` table (year >= 2026)
3. For each feedback record, finds the matching period by date range
4. Updates the `period` column with the correct value (e.g., "2026 P1", "2026 P2")

### Step 2: Deploy and Execute
1. Deploy the edge function
2. Call the function once to backfill all existing records
3. Function returns summary of updated records by period

### Step 3: Verify Results
- Confirm store 1111 shows 7 records under "2026 P1"
- Confirm all stores have correct period assignments
- Check Summary page displays data correctly

---

## Edge Function Logic

```text
1. Query customer_feedback where:
   - feedback_date >= '2025-12-31'
   - period IS NULL or period = ''

2. Query periods table for all 2026+ periods

3. For each feedback record:
   - Find period where start_date <= feedback_date <= end_date
   - Update customer_feedback.period = period.name

4. Return summary: { updated: 301, periodSummary: { "2026 P1": 257, "2026 P2": 44 } }
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/backfill-periods/index.ts` | One-time backfill function to update existing records |

---

## Expected Results

After running the backfill:

| Period | Expected Records |
|--------|-----------------|
| 2026 P1 | ~257 (Dec 31 - Jan 27) |
| 2026 P2 | ~44 (Jan 28 - Feb 24) |

Store 1111 specifically will have its 7 feedback records (dated Jan 4-22, 2026) correctly assigned to **"2026 P1"**.

