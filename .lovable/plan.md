

## Sidebar Group Header Styling Fix

### Problem
The group headers ("Guest Feedback", "Executive", etc.) appear as plain text, while the reference Accounting Portal shows them with a **highlighted background** (rounded, lighter background) that makes them visually distinct from sub-items.

### Changes

**File: `src/components/AppSidebar.tsx`** (renderGroupHeader function, ~line 176-189)

Update the `CollapsibleTrigger` button styling to add a visible background highlight on group headers when expanded:
- Add a conditional background: when the group `isOpen`, apply `bg-sidebar-accent` (the lighter dark shade) with rounded corners
- Make the text brighter (use `text-sidebar-accent-foreground`) when the group is open
- Add `rounded-md` for the rounded pill look matching the reference

The updated styling for the `SidebarMenuButton` inside `CollapsibleTrigger`:
- Default state: same as now (no background, muted text)
- Open/expanded state: `bg-sidebar-accent text-sidebar-accent-foreground rounded-md`

**File: `src/components/AppSidebar.tsx`** (sub-items indentation, ~lines 222, 240, 258, 276, 294)

Add left padding (`pl-4`) to the sub-item `SidebarMenu` containers so items are indented slightly more under their group header, matching the reference layout.

### Summary
- 1 file changed: `src/components/AppSidebar.tsx`
- Group headers get a highlighted background when expanded
- Sub-items get slightly more indentation
- No structural or behavioral changes

