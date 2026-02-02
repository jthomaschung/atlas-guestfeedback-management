

# Automatic Period Assignment for Guest Feedback

## Overview
Update the feedback ingestion process to automatically determine the fiscal period based on `feedback_date`, using the `periods` table as reference. This will apply to all feedback from **P1 2026 onward** (feedback_date >= 2025-12-31).

---

## Current State
- The `period` field is currently set from webhook data: `data.period || data.Period || null`
- If no period is provided in the webhook, the field remains empty
- The `periods` table contains fiscal period definitions with `start_date`, `end_date`, `name`, and `year`

---

## Periods Table Structure
| Period | Start Date | End Date | Year |
|--------|------------|----------|------|
| 2026 P1 | 2025-12-31 | 2026-01-27 | 2026 |
| 2026 P2 | 2026-01-28 | 2026-02-24 | 2026 |
| 2026 P3 | 2026-02-25 | 2026-03-24 | 2026 |
| ... | ... | ... | ... |

---

## Implementation Plan

### Step 1: Add Period Lookup Function
Add a new helper function in the edge function to query the `periods` table and find the matching period for a given date.

```text
Function: lookupPeriodByDate(feedbackDate: string)
  1. Query periods table where:
     - start_date <= feedbackDate
     - end_date >= feedbackDate
     - year >= 2026 (only for P1 2026+)
  2. Return period name (e.g., "2026 P1") or null
```

### Step 2: Update Validation Logic
Modify the `validateFeedbackData` function to:
1. Parse the `feedback_date`
2. Check if date is >= 2025-12-31 (P1 2026 start date)
3. If yes, call the period lookup function
4. Use the looked-up period instead of webhook-provided value

### Step 3: Handle Edge Cases
- If `feedback_date` is before P1 2026 start (2025-12-31): keep existing behavior (use webhook value or null)
- If no matching period found in database: log warning and set to null
- If database query fails: gracefully fallback to null with error logging

---

## Technical Details

### Database Query
```sql
SELECT name FROM periods 
WHERE start_date <= '2026-02-01' 
  AND end_date >= '2026-02-01'
LIMIT 1
```

### Logic Flow
```text
feedback_date received
       │
       ▼
Is date >= 2025-12-31?
       │
    No │ Yes
       │   │
       ▼   ▼
Use webhook  Query periods table
value/null        │
                  ▼
           Period found?
              │
           No │ Yes
              │   │
              ▼   ▼
          Set null  Use period.name
                    (e.g., "2026 P2")
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/ingest-feedback/index.ts` | Add `lookupPeriodByDate()` function, update validation to auto-assign period |

---

## Testing
After implementation, test with:
1. Feedback dated 2026-02-01 → should auto-assign "2026 P2"
2. Feedback dated 2025-12-31 → should auto-assign "2026 P1"
3. Feedback dated 2025-12-30 → should use webhook value or null (before P1 2026)
4. Feedback with explicit period in webhook → should use auto-calculated period (overrides webhook)

