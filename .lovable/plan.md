

## Fix Notification Click Behavior

### Problem
Currently, clicking a notification in the bell only opens the related feedback if the notification type is `feedback_mention`. Most notifications in the system are `feedback_status_change_confirmation` or `note_tagged` types, and clicking them does nothing visible -- they just get marked as read silently.

### What the notifications are
- **feedback_status_change_confirmation**: Auto-generated when you change a feedback status (e.g., "You updated Case X status to processing"). These are confirmations of your own actions.
- **feedback_mention**: Generated when someone tags you in a resolution note.
- **note_tagged**: Older tag notifications -- many are missing data (no feedback_id, message, or tagger_name).

### Plan

**1. Make all notification types with a `feedback_id` clickable (src/components/NotificationBell.tsx)**

Update `handleNotificationClick` to navigate to the feedback for ANY notification that has a `feedback_id`, not just `feedback_mention`. This means status change confirmations will also open the relevant feedback case when clicked.

**2. Add display titles for all notification types**

Update `getNotificationTitle` to show meaningful titles for `feedback_status_change_confirmation` and `note_tagged` types (currently they just show "Notification").

**3. Show the notification message for status change confirmations**

These notifications already have a `message` field (e.g., "You updated Case CF-XXX status to resolved") -- they will display properly since the template already renders `notification.message`.

**4. Handle navigation correctly for the GFM portal**

The current code navigates to `/?feedbackId=...` which is the main dashboard. If you're on the GFM portal (`/gfm`), it should navigate to the correct page. Update to detect the current portal context and navigate accordingly.

### Technical Details

**File: `src/components/NotificationBell.tsx`**

- Line 86: Change the condition from `notification.feedback_id && notification.notification_type === 'feedback_mention'` to just `notification.feedback_id` -- so any notification with a linked feedback opens it.
- Lines 66-76: Add cases for `feedback_status_change_confirmation` ("Feedback status updated") and `note_tagged` ("You were tagged in a note").
- Lines 87-94: Update navigation logic to work from any page, not just the root path.

### Summary
- 1 file changed: `src/components/NotificationBell.tsx`
- All notifications with a linked feedback case will open that case when clicked
- Notification titles will be more descriptive

