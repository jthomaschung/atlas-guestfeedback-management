

## Speed up the Open Feedback board

The Open Feedback page (`/open-feedback`) currently loads slowly because of three bottlenecks. Below is what I'll change.

### Findings
- The query fetches `SELECT *` (every column, including long text fields) for every active ticket.
- Pagination loops in 1000-row pages even though there are ~373 active tickets — this still issues one request, but always with the slowest path.
- All ~373 cards render at once on first paint. Each card is a heavy component (Select, Textarea, Checkbox, Refund dialog wired up).
- `useMemo` filtering recomputes against the full list, but the bigger cost is the initial mount of hundreds of card subtrees.

### Changes

1. **Lighter initial query** (`src/pages/OpenFeedback.tsx`)
   - Replace `select('*')` with an explicit column list that matches what the card/table actually displays. Drop `executive_notes`, `resolution_notes`, large `feedback_text` is still needed for cards/search — keep it, but exclude unused columns (`auto_escalated`, `customer_response_sentiment`, `outreach_method`, etc. that aren't shown on the card).
   - Use a single `.range(0, 1999)` request instead of the while-loop (active tickets are well under 2000 — see DB count: ~373). This removes a wasted pagination round-trip in the common case, with a fallback to paginate only if exactly 2000 returned.

2. **Progressive rendering of cards** (`src/components/feedback/CustomerFeedbackTable.tsx` + `OpenFeedback.tsx`)
   - Render the first 60 cards immediately, then mount the rest on `requestIdleCallback` / batched `setTimeout` so the page becomes interactive instantly.
   - Add a "Load more" sentinel using `IntersectionObserver` to reveal the next batch when the user scrolls near the bottom (batch size 60). No virtualization library needed.

3. **Memoize card rendering** (`src/components/feedback/CustomerFeedbackCard.tsx`)
   - Wrap `CustomerFeedbackCard` in `React.memo` with a shallow prop comparator so unrelated state changes (filter typing, dialog open/close) don't re-render every card. This makes filter typing feel instant.

4. **Defer secondary fetches** (`OpenFeedback.tsx`)
   - Run `fetchPeriods()` and `fetchStores()` in parallel with `fetchFeedbacks()` (currently sequential `await`-style state hits). They're already independent calls — just confirm no `await` chain.
   - Show the table skeleton as soon as `feedbacks` arrives, even if periods/stores are still loading (filters degrade gracefully).

5. **Skeleton instead of "Loading…" text**
   - Replace the centered "Loading open tickets…" with a lightweight 6-card skeleton grid so perceived load time drops.

### Files to edit
- `src/pages/OpenFeedback.tsx` — column list, single-range fetch, parallel secondary fetches, skeleton, progressive batch state.
- `src/components/feedback/CustomerFeedbackTable.tsx` — accept `visibleCount`, render `feedbacks.slice(0, visibleCount)`, add IntersectionObserver sentinel.
- `src/components/feedback/CustomerFeedbackCard.tsx` — wrap export in `React.memo`.

### Out of scope
- No DB schema changes, no new indexes (active set is small enough that the column-list change is the meaningful win).
- No changes to filter logic or card visuals.
- No virtualization library — batched render keeps it simple and accessible.

### Expected result
- Initial paint with the first batch of cards in well under 1s on a normal connection.
- Smooth filter typing because non-visible cards are memoized and unmounted.
- Same data, same UI, just faster.

