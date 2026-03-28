

# Enable Delete for Directors, VP, and CEO

## Problem
Only admins can currently delete feedback. Directors (Don Jones, Michelle Price, Tanner Luce), the VP (Arvey Tambunan), and the CEO (James Chung) also need this ability.

## Solution
The `useUserPermissions` hook already computes `isDirectorOrAbove` (matches admin, director, vp, ceo roles). The codebase currently gates delete on `isAdmin`. We need to pass `isDirectorOrAbove` as the delete permission flag instead.

## Changes

### 1. `src/components/feedback/CustomerFeedbackCard.tsx`
- Change the delete button visibility from `{isAdmin && onDelete && ...}` to use a new `canDelete` prop
- Add `canDelete?: boolean` to the props interface
- Update the title from "Admin Only" to reflect the broader access

### 2. `src/components/feedback/CustomerFeedbackTable.tsx`
- Add `canDelete?: boolean` prop and pass it through to `CustomerFeedbackCard`

### 3. `src/pages/CustomerFeedback.tsx`
- Pass `canDelete={permissions.isDirectorOrAbove}` to `CustomerFeedbackTable`

### 4. `src/pages/OpenFeedback.tsx`
- Pass `canDelete={permissions.isDirectorOrAbove}` to `CustomerFeedbackTable`

### 5. `src/pages/FeedbackArchive.tsx`
- Change `onDelete={permissions.isAdmin ? handleDelete : undefined}` to use `permissions.isDirectorOrAbove`
- Pass `canDelete={permissions.isDirectorOrAbove}`

### 6. `src/pages/FeedbackArchive.tsx` — `handleDelete` guard
- Change `if (!permissions.isAdmin)` to `if (!permissions.isDirectorOrAbove)`

No database or migration changes needed — the `user_hierarchy` table already has the correct roles assigned.

