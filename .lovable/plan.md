

## Fix: Sidebar Red Border and Rounded Corners Not Visible

### Root Cause

There are two bugs in the CSS preventing the red border and rounded corners from showing:

1. **CSS property conflict in `src/index.css`**: Line 7 declares `border-right: none !important;` which completely overrides line 10's `border-right: 2px solid hsl(var(--sidebar-primary));`. The `!important` flag on `none` wins, so the right red border never appears.

2. **Overflow clipping**: The sidebar's parent wrapper in `src/components/ui/sidebar.tsx` (line 233) is a `fixed` positioned div that tightly wraps the sidebar. The rounded corners on the inner `[data-sidebar="sidebar"]` div may get clipped because the outer container doesn't allow overflow to be visible.

### Changes

**File: `src/index.css`** (lines 6-13)

Remove the conflicting `border-right: none !important;` and instead use a single shorthand or ordered declarations that don't conflict:

```css
[data-sidebar="sidebar"] {
  background: hsl(var(--sidebar-background)) !important;
  border-left: none !important;
  border-top: 2px solid hsl(var(--sidebar-primary)) !important;
  border-right: 2px solid hsl(var(--sidebar-primary)) !important;
  border-bottom: 2px solid hsl(var(--sidebar-primary)) !important;
  border-radius: 0 12px 12px 0;
  overflow: visible;
}
```

Key fixes:
- Replace `border-right: none !important` with `border-left: none !important` (we want to hide the LEFT border, not the right)
- Add `!important` to the border declarations so they override any component-level styles
- Add `overflow: visible` to prevent clipping of rounded corners

**File: `src/components/ui/sidebar.tsx`** (line 233-244)

Add `overflow-visible` to the fixed-position parent wrapper div so the rounded corners and border of the inner sidebar div are not clipped:

```tsx
className={cn(
  "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex overflow-visible",
  ...
)}
```

### Summary
- 2 files changed: `src/index.css`, `src/components/ui/sidebar.tsx`
- Fixes the CSS property conflict where `border-right: none` was killing the red right border
- Ensures parent container doesn't clip rounded corners
- No visual or behavioral changes beyond making the border and corners visible as intended

