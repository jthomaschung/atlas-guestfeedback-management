
## Goal

After manually re-categorizing the Qualtrics "Other" rows, many records have the right `complaint_category` but stale `priority`, `assignee`, and `resolution_status` — those fields were only set at ingest. Audit, backfill, and add a safety net so future category edits stay in sync.

## What I found

Sampling current `customer_feedback` (last 90 days), the same category is split across priority tiers — clear sign of un-reconciled records:

| Category | Should be | Records still at Low |
|---|---|---|
| Rude Service | Critical | 10 (and 2 still assigned to GFM inbox instead of DM) |
| Out of Product | Critical | 4 |
| Possible Food Poisoning | Critical | 5 |
| Sandwich Made Wrong | High | 44 |
| Missing Item | High | 5 |
| Closed Early | High | 51 |
| Order Accuracy | High | 5 |
| Praise | High | 8 |

Also several unmapped raw categories slipping through ingest normalization:
`Charges`, `Receipt`, `Complaint about a Team Member`, `Team Member`, `Loyalty Program Issue` (singular), `Employment Verification Restaurant`, `Franchisee Criminal Activity`, `Tax Forms`, `Time To Receive Order`, `Unable To Pick Up`, `Audio`.

## Plan

### 1. Centralize routing rules in the database

Create `public.fn_resolve_feedback_routing(category text, type_of_feedback text, store_number text, market text, feedback_text text)` returning `(priority, assignee, should_escalate)`. It mirrors the logic currently in `supabase/functions/ingest-feedback/index.ts` (priorityMapping, storeFollowUpCategories, autoEscalateCategories, FYI vs Guest Support, food-poisoning keyword override).

Helper sub-functions reuse existing `findStoreAssignee` / `findDmForMarket` lookups via `stores` and market hierarchy tables.

### 2. Add a trigger to keep records in sync on category change

`trg_recompute_feedback_routing` on `customer_feedback` BEFORE UPDATE: when `complaint_category` or `type_of_feedback` changes AND the row is not yet resolved, recompute priority/assignee/escalation via the function above. Skips rows where an executive has manually overridden priority (track via existing `auto_escalated` flag or add a small `routing_locked` boolean — TBD, see Open Questions).

### 3. One-time backfill

Run an UPDATE that re-applies the routing function to all rows where:
- `resolution_status` IN ('opened','unopened','escalated'), AND
- current `priority` does not match the rule-derived priority for the current category.

This fixes the 130+ rows above without touching closed/archived records.

### 4. Extend ingest-side category normalization

In `supabase/functions/ingest-feedback/index.ts`, add to `categoryNormalization`:
- `complaint about a team member` → `Rude Service`
- `team member` → `Rude Service`
- `loyalty program issue` → `Loyalty Program Issues`
- `charges`, `receipt`, `tax forms`, `employment verification restaurant`, `franchisee criminal activity`, `audio` → `Other`
- `time to receive order` → `Slow Service`
- `unable to pick up` → `Closed Early`

### 5. Audit report

Add a one-shot SQL audit (logged, not stored) listing any rows where `(category, type_of_feedback)` would produce a different `(priority, assignee)` than what's currently stored — for the team to spot-check before/after the backfill.

## Technical details

- Routing function is `SECURITY DEFINER`, `STABLE`, `SET search_path = public`.
- Trigger fires only when `OLD.complaint_category IS DISTINCT FROM NEW.complaint_category` or `OLD.type_of_feedback IS DISTINCT FROM NEW.type_of_feedback`, to avoid re-running on unrelated updates.
- Escalation side effects (set `escalated_at`, `sla_deadline`, `auto_escalated`, `resolution_status='escalated'`) only applied when the row was not already escalated and the new priority is Critical or category is in auto-escalate list.
- Edge function continues to compute routing itself at insert time; trigger is the safety net for UPDATEs and manual edits.

## Open questions

1. For the backfill, should I also **re-route assignee** on already-opened tickets (e.g. move a Rude Service ticket from GFM inbox to the market DM), or just fix `priority` + escalation flags and leave assignee alone so in-flight work isn't disrupted?
2. Should manually-edited priorities be respected (skip backfill if a human changed priority since ingest)? We'd need to detect that — easiest is a `priority_overridden_at` column, or trust `updated_at > created_at + small window`.
