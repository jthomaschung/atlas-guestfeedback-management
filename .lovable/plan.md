

## Plan: Add "Type of Feedback" Filter to FeedbackReportingFilters

The Dashboard (Index.tsx) and Open Feedback (OpenFeedback.tsx) pages both use `FeedbackReportingFilters`, not the `FeedbackFilters` or `SimpleFeedbackFilters` components where the filter was previously added. Three changes needed:

### 1. FeedbackReportingFilters.tsx
- Add `feedbackTypeFilter` and `onFeedbackTypeFilterChange` props to the interface
- Add `feedbackTypeOptions` constant (`FYI`, `Guest Support`)
- Add a new `MultiSelect` for "Select Type" in the filter grid (alongside Channels, Stores, Markets)
- Include `feedbackTypeFilter` in the `hasActiveFilters` check

### 2. OpenFeedback.tsx
- Add `feedbackTypeFilter` state (`useState<string[]>([])`)
- Add filtering logic in `filteredFeedbacks` useMemo: match `type_of_feedback` against selected types (case-insensitive)
- Pass `feedbackTypeFilter` and setter to `FeedbackReportingFilters`
- Include in `handleClearAllFilters` and `hasActiveFilters`

### 3. Index.tsx
- Same changes as OpenFeedback: add state, filtering logic, pass props, clear logic

