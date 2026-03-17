

## Plan: Restrict FYI Feedback to "Acknowledged" Only

**Current behavior**: When `type_of_feedback` is "FYI", the status dropdown shows all statuses (Unopened, Opened, Processing, Responded, Resolved, Escalated) plus Acknowledged.

**Desired behavior**: When `type_of_feedback` is "FYI", the **only** status option should be "Acknowledged".

### Changes

**File: `src/components/feedback/FeedbackDetailsDialog.tsx`** (~lines 1864-1878)

Replace the status `<Select>` content with conditional logic:
- If `feedback.type_of_feedback?.toLowerCase() === 'fyi'`: render only `<SelectItem value="acknowledged">Acknowledged</SelectItem>`
- Otherwise: render the current list of statuses (minus the FYI-specific acknowledged option, keeping the qualtrics condition)

This is a single, small change to the status dropdown rendering block. No other files need modification since the routing logic already handles FYI assignment correctly.

