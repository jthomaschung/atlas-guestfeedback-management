
# Fix: Scrollable Drill-Down Dialog

## Problem Identified

The `FeedbackDrillDownDialog` cannot scroll because it's using a complex nested flexbox layout that conflicts with the base `DialogContent` component which has:
- `display: grid` (default)
- `overflow-hidden` (added recently)

Other working dialogs in this codebase (like `FeedbackDetailsDialog` and `StoreManagementDialog`) use a simpler approach that works.

---

## Solution

Match the pattern from other working dialogs - apply `max-h-[90vh] overflow-y-auto` directly on `DialogContent` instead of trying to create a scrollable child container.

---

## Changes Required

### File: `src/components/feedback/FeedbackDrillDownDialog.tsx`

**Current (not working):**
```tsx
<DialogContent className="max-w-4xl h-[85vh] !flex !flex-col p-0">
  <DialogHeader className="flex-shrink-0 p-6 pb-4">...</DialogHeader>
  <div 
    className="flex-1 overflow-y-auto px-6 pb-6"
    style={{ minHeight: 0 }}
  >
    <div className="space-y-4">...</div>
  </div>
</DialogContent>
```

**New (matching working dialogs):**
```tsx
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
  <DialogHeader>...</DialogHeader>
  <div className="space-y-4">...</div>
</DialogContent>
```

This approach:
1. Removes the flex layout override that conflicts with grid
2. Removes the fixed height in favor of max-height
3. Puts scrolling on the DialogContent itself (proven pattern)
4. Removes unnecessary nested wrapper divs

---

## Why This Works

Looking at other dialogs in this project:

| Dialog | Approach | Works? |
|--------|----------|--------|
| `FeedbackDetailsDialog` | `max-h-[90vh] overflow-y-auto` on DialogContent | Yes |
| `StoreManagementDialog` | `max-h-[90vh] overflow-y-auto` on DialogContent | Yes |
| `FeedbackDialog` | `max-h-[90vh] overflow-y-auto` on DialogContent | Yes |
| `FeedbackDrillDownDialog` | Nested flex with child scroll | No |

The `overflow-hidden` on the base component prevents child elements from scrolling, but `overflow-y-auto` on the same element overrides it and enables scrolling.
