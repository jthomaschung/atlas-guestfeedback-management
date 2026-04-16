

## Plan: Fix Refund Approval Failure (CHECK Constraint Mismatch)

### Root Cause
The `refund_requests.status` column has a CHECK constraint that only allows:
`'pending'`, `'manager_approved'`, `'director_approved'`, `'approved'`, `'denied'`, `'completed'`

But the application code (in `RefundProcessing.tsx`, `RefundDetailDialog.tsx`, and `statusConfig`) writes these values:
`'pending'`, `'dm_approved'`, `'awaiting_director'`, `'awaiting_catering'`, `'approved'`, `'denied'`, `'completed'`

When Michelle (or anyone) approves a $57.37 refund as DM, the code tries to set status to `'awaiting_director'` — which fails the CHECK constraint, returning a Postgres `23514` error. The catch block reports the generic "Failed to process refund request."

This affects **every refund > $25 and every catering refund** — not specific to Michelle. It would fail for any user attempting the multi-stage approval flow. Sub-$25 refunds work because they jump straight to `'approved'`, which is in the allowed list.

### Fix

**Database migration** — Update the CHECK constraint to include the statuses the app actually uses:

```sql
ALTER TABLE public.refund_requests
  DROP CONSTRAINT refund_requests_status_check;

ALTER TABLE public.refund_requests
  ADD CONSTRAINT refund_requests_status_check
  CHECK (status = ANY (ARRAY[
    'pending',
    'dm_approved',
    'awaiting_director',
    'awaiting_catering',
    'approved',
    'denied',
    'completed'
  ]));
```

This single change unblocks the DM → Director → (Catering) → Approved → Completed flow without touching application code.

### No code changes required
The frontend logic, status labels, and approval routing are correct — only the DB constraint was out of sync.

### Verification after deploy
1. Have Michelle (or any DM/Director) re-approve the $57.37 case from the screenshot.
2. Confirm it transitions to `'awaiting_director'` and the success toast appears.
3. Approve as Director and confirm it lands in `'approved'`, then "Mark Complete" works.

