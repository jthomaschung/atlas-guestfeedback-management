

## Fix: Top-Right Rounded Corner Blocked by Header Background

### Problem
The sidebar header div (containing "ATLAS" / "Guest Feedback Portal") has its own `bg-sidebar` background and no border-radius. This square-cornered inner div paints over the top-right rounded corner of the parent sidebar, making it look clipped/blocked.

### Fix

**File: `src/components/AppSidebar.tsx`** (line 202-204)

Add `rounded-tr-[12px]` to the header div so its top-right corner matches the parent sidebar's border-radius. Also remove the redundant `bg-sidebar` since it inherits from the parent.

Change:
```tsx
"bg-sidebar h-16 flex items-center border-b border-sidebar-border",
```
To:
```tsx
"h-16 flex items-center border-b border-sidebar-border rounded-tr-[12px]",
```

This ensures the header's top-right corner curves with the sidebar border instead of covering it with a square corner.

### Summary
- 1 file changed: `src/components/AppSidebar.tsx`
- Adds matching border-radius to the header div's top-right corner
- Removes redundant background class

