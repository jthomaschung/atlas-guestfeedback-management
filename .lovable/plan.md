

## Updated Feedback Pipeline Plan

### Summary
Add `type_of_feedback`, `reward`, and `feedback_source` fields. Implement FYI vs Guest Support routing logic. Channel/feedback source is stored as-is (informational only, no special Yelp logic). Historical data stays untouched.

### Database Migration
Add three nullable columns to `customer_feedback`:
- `type_of_feedback` (text) — `'FYI'` or `'Guest Support'`, null for historical
- `reward` (text) — free-text, display-only
- `feedback_source` (text) — whatever Mailparser sends (informational only)

### Edge Function: `ingest-feedback`
**Accept new fields** from Mailparser: `type_of_feedback`, `reward`, `feedback_source`.

**Replace current routing logic** with `type_of_feedback`-driven routing:

| type_of_feedback | Category | Assignee | Status |
|---|---|---|---|
| FYI | any | `guestfeedback@atlaswe.com` | `unopened` (acknowledge-only) |
| Guest Support | Order Issue, Cleanliness, Closed Early | `store{number}@atlaswe.com` | `unopened` |
| Guest Support | OOP, Rude, Food Poisoning | DM (by market lookup) | `escalated` |
| Guest Support | Everything else | `guestfeedback@atlaswe.com` | `unopened` |
| null/missing | — | Current logic (backward compat) | Current logic |

Channel field: normalize to `"RAP"` unless it's already set to something specific. Store `feedback_source` separately as-is from the webhook.

### Frontend Changes

**`src/types/feedback.ts`** — Add `type_of_feedback?: string`, `reward?: string`, `feedback_source?: string`

**`src/components/feedback/FeedbackDetailsDialog.tsx`**
- Display `reward` and `type_of_feedback` in the "Feedback Details" card alongside period/rating
- Display `feedback_source` if present
- When `type_of_feedback === 'FYI'`: restrict Resolution Status dropdown to only show "Acknowledged" (plus current status), hide email composer
- Currently line 1880 already conditionally shows "Acknowledged" for qualtrics — extend this to also show for FYI type

**`src/components/feedback/CustomerFeedbackCard.tsx`**
- Show small `type_of_feedback` badge (FYI in blue, Guest Support in amber)
- Show `reward` as a subtle text line if present

### Files to Change
1. Database migration (3 new columns)
2. `supabase/functions/ingest-feedback/index.ts`
3. `src/types/feedback.ts`
4. `src/components/feedback/FeedbackDetailsDialog.tsx`
5. `src/components/feedback/CustomerFeedbackCard.tsx`

