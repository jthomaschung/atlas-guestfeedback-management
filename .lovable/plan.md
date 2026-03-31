
## Why it likely hangs on “Adding…”

I audited the current flow for **Manual Add Feedback** and found a likely bottleneck pattern:

1. The dialog keeps the button in **“Adding…”** until one DB insert fully returns (`AddFeedbackDialog.handleSubmit`).
2. That insert goes into `customer_feedback`, which currently has **many active triggers** (9), including multiple `AFTER INSERT` notifications.
3. Several triggers call outbound notification paths (`net.http_post` to Edge Functions for Slack/escalation).
4. I found evidence of intermittent outbound timeout behavior (`net._http_response` includes multiple **5000ms timeout** entries), which matches the “sometimes hangs” symptom.

So even when the record eventually saves, the synchronous insert path can become slow/unpredictable.

## Difference from pages that feel fast

The slow behavior is specific to flows that write into `customer_feedback` and fire all insert triggers. Read-only pages (like historical views) avoid this trigger-heavy write path, so they feel stable.

## Implementation plan

1. **Instrument submit timing (frontend)**
   - Add stage timing around: period lookup → assignee resolve → insert → refresh.
   - Show a clearer timeout toast if insert exceeds a threshold (e.g. 8–10s), so users see status instead of indefinite “Adding…”.

2. **Decouple notifications from insert transaction (backend)**
   - Move trigger HTTP work to a **queue-based** pattern:
     - Insert trigger writes a lightweight event row only.
     - Background worker/cron Edge Function processes queue and sends Slack/email/escalation.
   - Keep the user insert fast and independent of external network latency.

3. **Reduce post-submit UX blocking**
   - On successful insert, close dialog immediately.
   - Optimistically append the new ticket to local state.
   - Refresh full dataset in background (don’t tie button state to full-page refetch).

4. **Trigger cleanup**
   - Consolidate overlapping escalation/notification triggers so one insert emits one clean event path.
   - Remove duplicate or legacy trigger logic that can stack latency.

5. **Validation**
   - Re-test with the same payload you showed.
   - Confirm insert response stays consistently fast (<2s typical) and button no longer appears stuck.
   - Confirm notifications still deliver asynchronously from queue worker.

## Technical scope

- Frontend: `src/components/feedback/AddFeedbackDialog.tsx`, `src/pages/Index.tsx`
- DB/trigger path: `customer_feedback` insert triggers (`on_feedback_created`, `trigger_critical_escalation_on_insert`, escalation-related before triggers)
- Notification path: `send-feedback-slack-notification`, `send-critical-escalation`

This plan directly targets the hanging symptom without losing notification behavior.
