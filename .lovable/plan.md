

# Stop Page Refresh on Tab Switch

## Problem
Every time you switch to another browser tab and come back, the portal visually refreshes. This is caused by React Query's default `refetchOnWindowFocus: true` setting, which re-fetches all active queries whenever the browser tab regains focus. This triggers loading spinners and UI flicker unnecessarily.

## Solution
Disable `refetchOnWindowFocus` globally on the `QueryClient` in `src/App.tsx`. The data doesn't change frequently enough to warrant automatic refetching on every tab switch — users can refresh manually or data updates via real-time subscriptions where needed.

## Change

**`src/App.tsx`** — Update the QueryClient initialization:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
```

This is a one-line config change. No other files need modification.

