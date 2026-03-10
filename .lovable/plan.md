

## Open Feedback Board + Read-Only Dashboard

### Summary
Create a new "Open Feedback" page for processing open tickets, and make the existing Dashboard view-only (no edit/delete actions on cards).

### New Page: `src/pages/OpenFeedback.tsx`
- Fetches only unresolved feedback (`resolution_status NOT IN ('resolved', 'acknowledged')`)
- Includes filters, `CustomerFeedbackTable` with edit/delete actions, and `FeedbackDetailsDialog` for processing
- Simpler layout than Dashboard — no charts, no hero banner — focused purely on ticket processing
- Title: "Open Feedback" with subtitle about active tickets needing attention

### Dashboard Changes (`src/pages/Index.tsx`)
- Remove `onEdit`, `onDelete` handlers from `CustomerFeedbackTable` — pass no-op or view-only props
- Keep `onViewDetails` so users can still view details, but make the dialog read-only (no status changes, no email composer)
- Alternatively: just remove the edit/delete buttons by not passing `onEdit`/`onDelete` — the card component already conditionally renders based on these props

### Sidebar Update (`src/components/AppSidebar.tsx`)
- Add "Open Feedback" to the Guest Feedback nav group (likely first item or second after Accuracy)
- Icon: `ClipboardList` or `Inbox` from lucide-react
- URL: `/open-feedback`

### Routing (`src/App.tsx`)
- Add `/open-feedback` route pointing to `OpenFeedback` component inside `ProtectedRoute`

### Files to Create/Edit
1. **Create** `src/pages/OpenFeedback.tsx` — new page (reuses existing components: `CustomerFeedbackTable`, `FeedbackDetailsDialog`, `FeedbackReportingFilters`)
2. **Edit** `src/pages/Index.tsx` — remove edit/delete actions, make cards view-only
3. **Edit** `src/components/AppSidebar.tsx` — add Open Feedback nav item
4. **Edit** `src/App.tsx` — add route

