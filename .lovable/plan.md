

# Fix: Page Still Refreshing on Tab Switch

## Root Cause

The `PortalGate` component wraps the entire app and runs `checkAccess()` on mount. When you switch browser tabs, Supabase's auth token refresh can cause the `AuthProvider`'s `onAuthStateChange` to fire, which updates `loading` to `true` momentarily. The `ProtectedRoute` component reacts to `authLoading` and shows a loading spinner, causing the visible "refresh."

**Why the archive page doesn't do it:** FeedbackArchive depends on `user?.email` (a stable string). But more importantly, the real culprit is likely the `ProtectedRoute` component — it checks `authLoading` on every render. When the auth state listener fires on tab return, `loading` briefly flips, causing the entire layout to unmount and remount.

The fix has two parts:

## Changes

### 1. `src/hooks/useAuth.tsx` — Don't re-set loading on auth state changes after initial load

Currently, the `onAuthStateChange` callback doesn't set `loading` back to `true`, but the initial `getSession()` call and the auth listener race — both set `loading = false`, but the listener fires first with session, then `getSession` also fires. The real issue is that on tab return, Supabase fires `TOKEN_REFRESHED` which triggers `onAuthStateChange`, and the `setTimeout` for profile fetch creates a brief window where user exists but profile is null, potentially triggering re-renders.

**Fix:** Track whether initial load is complete. After that, don't touch `loading` on subsequent auth events. Also remove the `setTimeout` wrapper on profile fetch (it's unnecessary and causes race conditions).

### 2. `src/components/SessionTokenHandler.tsx` — Guard against re-running on auth state changes

The `useEffect` with `[user, setIsProcessingTokens]` dependency re-runs whenever `user` object reference changes (which happens on token refresh). This can briefly set state. Use `user?.id` instead.

### 3. `src/pages/Index.tsx` — Remove `isSessionReady` from the data fetch dependency

The `isSessionReady` state can toggle during token refreshes. Since PortalGate already ensures session validity before rendering children, this guard is redundant. Simplify to just depend on `authUser?.id`.

## Summary of File Changes

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add `initialLoadDone` ref; skip setting `loading` after first load; remove `setTimeout` on profile fetch |
| `src/components/SessionTokenHandler.tsx` | Change `user` to `user?.id` in effect dependencies |
| `src/pages/Index.tsx` | Remove `isSessionReady` check from data-fetch useEffect since PortalGate already guarantees session |

