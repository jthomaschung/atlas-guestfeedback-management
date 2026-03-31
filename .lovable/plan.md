

## Plan: Revert Add Feedback to reliable synchronous flow

### Problem
Manual feedback submissions are silently failing. The current "background submit" pattern closes the dialog immediately and runs the insert in a fire-and-forget async function, which swallows errors invisibly.

### Root cause
The background submit pattern (`submitFeedbackInBackground`) has no way to surface errors to the user after the dialog is already closed. Any failure in the period lookup, assignee resolution, or insert is lost.

### What changes

**File: `src/components/feedback/AddFeedbackDialog.tsx`**

1. **Remove background submit pattern** -- replace `submitFeedbackInBackground` with a direct `handleSubmit` that keeps the dialog open and shows "Adding..." until the insert completes or fails.

2. **Remove frontend DM lookup** -- the database BEFORE INSERT trigger (`auto_escalate_critical_feedback_before_insert`) already handles all assignee routing, priority mapping, and escalation logic. The frontend just needs to send a simple default assignee (`guestfeedback@atlaswe.com`) and let the trigger override it. This removes the `findDmEmailForMarket`, `resolveInitialAssignee`, and all the category routing constants from the frontend.

3. **Simplified submit flow**:
   - Validate required fields
   - Look up period (optional, non-blocking -- use null if lookup fails)
   - Insert with minimal payload and default assignee
   - On success: show toast, close dialog, call `onFeedbackAdded()` to refresh list
   - On error: show error toast, keep dialog open so user can retry

### What stays the same
- All form fields and UI layout unchanged
- Store dropdown and auto-market-fill unchanged
- `onFeedbackAdded` callback (triggers `fetchFeedbacks` in Index.tsx) unchanged
- Database triggers handle routing, priority, escalation as before

### Technical detail
The BEFORE INSERT trigger `auto_escalate_critical_feedback_before_insert` already:
- Maps category to priority
- Routes to store, DM, or GFM based on category
- Sets escalation status for critical categories

So the frontend duplicating this logic is redundant and fragile. Removing it simplifies the code and eliminates the RLS-blocked `user_market_permissions` query as a failure point.

