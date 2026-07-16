## Goal

When an FYI's status is changed to **Acknowledged**, treat it as archived: it disappears from the Open Feedback board (already true), appears in the Archive, and stops counting toward the Avg Response Time metric.

## What I found

- `OpenFeedback.tsx` already excludes `resolved` and `acknowledged` from the active board — no change needed.
- `FeedbackArchive.tsx` filters `.eq('resolution_status', 'resolved')`, so the 138 existing acknowledged rows are currently invisible everywhere (orphaned).
- `CustomerFeedbackStats.tsx` "Avg Response Time" tile counts **every** non-unopened row (including acknowledged), which drags the metric down.
- `FeedbackReporting.tsx` avg response time already only looks at `responded` / `resolved`, so acknowledged is already excluded there — no change needed.

## Plan

### 1. Include acknowledged rows in the Archive
`src/pages/FeedbackArchive.tsx` — change the Supabase query from `.eq('resolution_status', 'resolved')` to `.in('resolution_status', ['resolved', 'acknowledged'])`. Add an "Acknowledged" badge/label in the card and status filter so users can tell them apart from resolved cases.

### 2. Exclude acknowledged from Avg Response Time on the main board
`src/components/feedback/CustomerFeedbackStats.tsx` — narrow the `respondedFeedbacks` filter to only `responded` and `resolved` rows (matching the Reporting page logic). Acknowledged and unopened are excluded.

### 3. No DB changes
`acknowledged` status already exists and is applied via the FYI acknowledgment flow. This is purely a UI/query surface change so acknowledged behaves like archived.
