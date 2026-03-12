

## Change: Average Response Time Calculation

**Current behavior:** Only counts feedback with status "responded" or "resolved", using `updated_at - created_at`.

**New behavior:** Count any feedback that has moved beyond "unopened" (i.e., any status change has occurred), using `updated_at - created_at`.

### Files to update

1. **`src/components/feedback/CustomerFeedbackStats.tsx`** (line ~27): Change filter from `responded || resolved` to any status that isn't `unopened`.

2. **`src/pages/Summary.tsx`** (line ~133): Same change in `calculateStats` — filter for any feedback where `resolution_status !== 'unopened'` instead of only `responded || resolved`.

Both files use the same pattern: filter feedbacks, compute `updated_at - created_at`, average. The only change is widening the filter to include `opened`, `processing`, `escalated`, `acknowledged` in addition to `responded` and `resolved`.

