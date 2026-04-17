

## Investigation: Order Accuracy Routing

### Where it should go
Per `mem://features/feedback-automated-routing-logic` and the code in `ingest-feedback/index.ts`, **Order Accuracy** is a "Store Follow-up" category. It should be assigned to **`store{number}@atlaswe.com`** (e.g., the screenshot's case CCC8636115 from store 2682 should go to `store2682@atlaswe.com`).

### What's actually happening
I queried the last 20 Order Accuracy records (past 14 days). **Every single one** is assigned to `guestfeedback@atlaswe.com`, not the store. All 20 also have `type_of_feedback = NULL`.

### Root cause
In `supabase/functions/ingest-feedback/index.ts` line 418:
```ts
assignee: data.assignee || defaultAssignee,
```
The incoming webhook payload (Mailparser/Zapier) is sending `assignee: "guestfeedback@atlaswe.com"` directly, which **overrides** the routing logic entirely. The legacy routing path (line 376–388) correctly lists `'order accuracy'` as a store-level category and would call `findStoreAssignee()` — and the `store2682@atlaswe.com` profile exists, so it would resolve correctly. But the override on line 418 short-circuits it.

A secondary contributor: every record has `type_of_feedback = NULL`, so the newer type-driven routing (line 342) is skipped and we fall into the legacy branch — but that branch would still route correctly if not for the override.

### Proposed fix (one-line edge function change)

Change line 418 in `supabase/functions/ingest-feedback/index.ts` so the routing logic always wins for store-level and auto-escalate categories, and only honors an inbound `data.assignee` when our own routing returns the GFM fallback:

```ts
// Only let the webhook override the assignee for GFM-bucketed categories.
// For store-routed and auto-escalate categories, always trust our routing.
const assigneeIsRoutable =
  defaultAssignee && defaultAssignee !== 'guestfeedback@atlaswe.com' && defaultAssignee !== 'Unassigned';
assignee: assigneeIsRoutable ? defaultAssignee : (data.assignee || defaultAssignee),
```

### Backfill
After deploying, run a one-time SQL update to re-route the existing mis-assigned Order Accuracy records (and the other store-follow-up categories that may have the same issue) to their store mailboxes — only where the store profile exists and status is still unopened/opened (don't touch resolved/escalated cases).

### Verification
1. Send a test webhook for an Order Accuracy complaint at store 2682 → confirm assignee = `store2682@atlaswe.com`.
2. Send a test "Other" category complaint → confirm assignee stays `guestfeedback@atlaswe.com`.
3. Spot-check the backfilled records on the Open Feedback board.

