

# Design System Update Plan: ATLAS Guest Feedback Portal

## Overview
This plan updates the Guest Feedback Portal styling to match the new unified ATLAS design specification, aligning it with the Facilities Management Portal shown in the reference screenshot.

## Key Changes Summary

| Component | Current State | Target State |
|-----------|---------------|--------------|
| **Sidebar** | Light gray bg with icon bubbles | Dark near-black bg (#18191F) with 3px red accent rail |
| **Top Header** | Dark bg (atlas-dark) | Light/transparent bg matching page |
| **Hero Banner** | Centered layout with logo | Left-aligned with badge, vertical accent, and CTA button |
| **Colors** | Light sidebar with white accents | Dark sidebar theme per specification |

---

## Implementation Details

### 1. CSS Variables Update (`src/index.css`)

Update the sidebar CSS variables to match the new dark theme specification:

```text
Current:
--sidebar-background: 220 14% 96%;  (light gray)
--sidebar-foreground: 220 9% 46%;   (muted text)
--sidebar-accent: 0 0% 100%;        (white)

Target:
--sidebar-background: 220 15% 10%;  (#18191F - near-black)
--sidebar-foreground: 220 10% 65%;  (#9DA3AE - muted neutral)
--sidebar-accent: 220 15% 18%;      (#272A33 - active row bg)
--sidebar-hover: 220 15% 13%;       (#1E2027 - hover state)
--sidebar-muted: 220 10% 55%;       (#848A96 - chevrons)
```

Also update the gradient on `[data-sidebar="sidebar"]` to remove it since the sidebar will be fully dark.

Add new CSS variable:
- `--sidebar-active: 220 15% 18%;` - For active row background

Add new page background color to match specification:
- `--background: 220 10% 96%;` (#F4F5F7 - soft cool gray)

### 2. Sidebar Component Update (`src/components/AppSidebar.tsx`)

Major restructuring of the sidebar visual hierarchy:

**Header Section:**
- Maintain ATLAS branding with logo
- Update subtitle to "Guest Feedback Portal"
- Use new color tokens for text

**Navigation Items - Remove Icon Bubbles:**
- Current: Icons wrapped in `bg-sidebar-active p-2 rounded-lg shadow-sm` containers
- Target: Flat icons without bubble containers
- Add 3px red accent rail on left side for active items with `border-radius: 0 9999px 9999px 0`

**Active State Visual:**
- Background: `--sidebar-accent` (220 15% 18% / #272A33)
- Text: `--sidebar-accent-foreground` (0 0% 95% / #F2F2F2)
- Left accent rail: 3px wide, Atlas Red (#C8102E)

**Dimensions:**
- Expanded width: 280px (17.5rem)
- Collapsed width: 76px (4.75rem)
- Navigation item height: 44px (h-11)
- Icon size: 20px (h-5 w-5)

**Collapsed Mode:**
- Icons centered with `justify-center`
- Text hidden
- Tooltips on hover

### 3. Top Header Update (`src/App.tsx`)

Transform from dark header to light/transparent design:

**Current:**
- Dark background (`bg-atlas-dark`)
- White text
- Red accent line at top

**Target:**
- Light/transparent background (`bg-background`)
- Bottom border instead of top accent
- Dark icons at 80% opacity with full opacity on hover
- Sidebar toggle arrow (left/right chevron)

**Header Layout:**
```text
+---------------------------------------------------------------+
|  [Toggle]              [Home] [Theme] [Portal] [Bell] [Logout] |
+---------------------------------------------------------------+
```

**Button Styling:**
- Color: `foreground/80` (muted)
- Hover: `bg-muted`, `text-foreground`
- Min height: 44px (touch-friendly)

### 4. Hero Banner Redesign (`src/pages/Index.tsx`)

Transform from centered layout to left-aligned with CTA:

**Current:**
- Centered logo and text
- Black background
- Red underline below title

**Target:**
- Dark slate background (`bg-slate-900` / #0F172A)
- Horizontal layout with:
  - 48x48 badge on left
  - 2px vertical red accent line
  - Welcome message with user name and access info
  - CTA button on right ("+ View Dashboard" or similar)

**Responsive Behavior:**
- Mobile: Stack vertically, full-width button
- Desktop: Horizontal layout

**Implementation:**
```text
+----------------------------------------------------------------+
|  [Badge 48px]  |  Welcome, {Name}              [+ Action]     |
|                |  Access Level - Markets/Stores               |
+----------------------------------------------------------------+
```

### 5. Sidebar Border Styling

Add red accent border on 3 sides per specification:

```css
border-top: 2px solid #C8102E;
border-right: 2px solid #C8102E;
border-bottom: 2px solid #C8102E;
border-left: none;
border-radius: 0 12px 12px 0;
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/index.css` | Update sidebar CSS variables, remove gradient, add new tokens |
| `src/components/AppSidebar.tsx` | Dark theme, remove icon bubbles, add active accent rail, update dimensions |
| `src/App.tsx` | Light header, updated button styling, remove red accent line |
| `src/pages/Index.tsx` | New hero banner layout with CTA |
| `src/components/NotificationBell.tsx` | Update colors for light header theme |
| `src/components/PortalSwitcher.tsx` | Update colors for light header theme |

---

## Technical Considerations

### Sidebar Width Variables
Update in `src/components/ui/sidebar.tsx`:
- `SIDEBAR_WIDTH = "17.5rem"` (280px)
- `SIDEBAR_WIDTH_ICON = "4.75rem"` (76px)

### Active Rail Implementation
New CSS class for active state with left accent:

```css
.sidebar-nav-active {
  position: relative;
  background: hsl(var(--sidebar-accent));
}

.sidebar-nav-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: hsl(var(--sidebar-primary));
  border-radius: 0 9999px 9999px 0;
}
```

### Collapsed Mode Behavior
- Icons centered with `justify-center`
- Expandable groups show popover flyout (240px wide)
- Tooltips appear on hover (right side)

---

## Visual Reference Comparison

**Current Design:**
- Light sidebar with white icon bubbles
- Dark header with red top accent
- Centered hero banner

**Target Design (per specification):**
- Dark sidebar (#18191F) with red accent rail on active items
- Light header with bottom border
- Left-aligned hero banner with CTA button

