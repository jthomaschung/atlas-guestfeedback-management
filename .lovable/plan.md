

## Update Feedback Form for Guest Feedback Portal

### Problem
The feedback dialog has two issues:
1. It doesn't show who is submitting -- the logged-in user's name and email are invisible
2. The page/context dropdown includes pages from other portals (e.g., "Facilities Dashboard", "Submit Work Order") and is missing several pages that actually exist in this portal

### Changes

**File: `src/components/FeedbackDialog.tsx`**

**1. Show the logged-in user's info at the top of the form**

Add a "Submitting as" section below the dialog description that displays:
- The user's name (from their profile: first_name + last_name)
- Their email address
- Pulled from the `useAuth()` hook (user object + profile)

This way the submitter is always visible and tied to the logged-in session.

**2. Replace page options with this portal's actual pages**

Remove pages that don't exist in this portal and add the ones that do:

| Remove | Add |
|--------|-----|
| `/facilities` -- Facilities Dashboard | `/accuracy` -- Accuracy |
| `/submit` -- Submit Work Order | `/training` -- Training |
| | `/email-templates` -- Email Templates |
| | `/praise-board` -- Praise Board |
| | `/executive-oversight` -- Executive Oversight |
| | `/dashboard` -- Dashboard |
| | `/internal-feedback` -- Internal Feedback |

Final page list:
- General / Not page-specific
- Dashboard / Home (`/`)
- Dashboard (alt) (`/dashboard`)
- Summary (`/summary`)
- Guest Feedback Management (`/gfm`)
- Feedback Reporting (`/feedback-reporting`)
- Red Carpet Leaders (`/red-carpet-leaders`)
- Feedback Archive (`/feedback-archive`)
- Executive Oversight (`/executive-oversight`)
- Accuracy (`/accuracy`)
- Training (`/training`)
- Email Templates (`/email-templates`)
- Praise Board (`/praise-board`)
- Internal Feedback (`/internal-feedback`)
- User Hierarchy (`/user-hierarchy`)
- Settings (`/settings`)

### Technical Details

- Import `useAuth` from `@/hooks/useAuth`
- Use `user?.email` for email and `profile?.first_name` / `profile?.last_name` for name
- Display as a small read-only info block (muted text, with a user icon) between the dialog description and the category field
- Also stores `user_id` on submit (already done), so this is purely a visual addition

### Summary
- 1 file changed: `src/components/FeedbackDialog.tsx`
- Submitter identity is now visible in the form
- Page options match this portal's actual routes

