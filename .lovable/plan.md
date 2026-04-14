

## Plan: Fix Refund Request Infinite Spinner

### Root Cause
The `await supabase.functions.invoke('send-refund-approval-notification')` on line 180 can hang indefinitely if the edge function is slow, undeployed, or encounters a network-level timeout. The inner `try/catch` only catches thrown errors, not indefinite hangs. This blocks the success toast and `setSubmitting(false)` from ever running.

### Fix

**File: `src/components/feedback/StandaloneRefundDialog.tsx`**

1. Make the edge function notification call **fire-and-forget** — remove the `await` so it doesn't block the UI. The refund record is already saved to the database at this point, so the notification is non-critical.
2. Add `console.log` breadcrumbs before/after the DB insert and notification call for future debugging.

**File: `src/components/feedback/RequestRefundDialog.tsx`**

3. Apply the same fire-and-forget fix to the feedback-linked refund dialog for consistency (line ~155 has the same blocking `await` pattern).

### What changes look like

```typescript
// BEFORE (blocks forever if edge function hangs)
if (needsApproval) {
  try {
    await supabase.functions.invoke('send-refund-approval-notification', { ... });
  } catch (notifErr) {
    console.error('Failed to send refund notification:', notifErr);
  }
}

// AFTER (fire-and-forget, never blocks the user)
if (needsApproval) {
  supabase.functions.invoke('send-refund-approval-notification', {
    body: { refundRequestId: data?.id, notificationType: 'new_refund' },
  }).catch((notifErr) => {
    console.error('Failed to send refund notification:', notifErr);
  });
}
```

### No database or edge function changes needed.

