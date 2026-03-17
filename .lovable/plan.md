

## Mobile Optimization Plan

This plan adds mobile-responsive behavior across all pages while keeping the desktop layout completely untouched. All changes use Tailwind's responsive prefixes so they only apply at `max-width: 768px`.

### What Already Works on Mobile
- **Sidebar**: Already uses a Sheet (slide-out drawer) on mobile via the shadcn sidebar component -- no changes needed
- **Header**: Already responsive with `px-4 sm:px-6`, icon-only buttons on mobile, `gap-1 sm:gap-2`
- **Hero Banner**: Already stacks vertically on mobile (`flex-col sm:flex-row`), CTA goes full-width
- **Feedback Cards Grid**: Already responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- **Filter Grids**: Already responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- **iOS zoom prevention**: Already handled in `index.css` (inputs forced to `text-base`)

### Changes Needed

**1. Summary Page (`src/pages/Summary.tsx`)**
- Reduce padding on mobile: `p-6` to `p-3 sm:p-6`
- Page title: `text-3xl` to `text-2xl sm:text-3xl`
- Stats grid: `grid-cols-1 md:grid-cols-2` to `grid-cols-2 md:grid-cols-2` (2-col on mobile for compact stats)

**2. Accuracy Page (`src/pages/Accuracy.tsx`)**
- Reduce padding on mobile: `p-6` to `p-3 sm:p-6`
- Page title: `text-3xl` to `text-2xl sm:text-3xl`
- Period badges: wrap properly on small screens (already uses `flex-wrap`, OK)
- Tabs: `grid-cols-4` to `grid-cols-2 sm:grid-cols-4` so tabs don't get too narrow on mobile
- Overview charts grid: `grid-cols-1 lg:grid-cols-2` -- already fine
- Key Insights grid: `md:grid-cols-2` -- already fine

**3. Feedback Reporting Page (`src/pages/FeedbackReporting.tsx`)**
- Reduce padding on mobile: `p-6` to `p-3 sm:p-6`
- Page title: `text-3xl` to `text-2xl sm:text-3xl`
- Stats grid gap: `gap-6` to `gap-3 sm:gap-6`
- Bar chart left margin: reduce from 120px to 80px on mobile for category labels

**4. Praise Board Page (`src/pages/PraiseBoard.tsx`)**
- Header: Stack vertically on mobile -- title and "Add Praise" button
- Title: `text-3xl` to `text-2xl sm:text-3xl`
- Icon size: `h-8 w-8` to `h-6 w-6 sm:h-8 sm:w-8`
- "Add Praise" button: full-width on mobile

**5. Executive Oversight Page (`src/pages/ExecutiveOversight.tsx`)**
- Reduce container padding on mobile

**6. Settings Page (`src/pages/Settings.tsx`)**
- Tabs: ensure horizontal scrolling or stacking on mobile
- Form inputs and buttons: ensure full-width on mobile

**7. Index/Dashboard Page (`src/pages/Index.tsx`)**
- Stats grid: The 6-column grid (`lg:grid-cols-6`) already falls back to `grid-cols-1 md:grid-cols-2` -- change mobile to `grid-cols-2` for a more compact 2-column layout on phones
- Reduce container padding on loading state

**8. Global CSS (`src/index.css`)**
- Add a utility class for responsive chart containers (reduce min-height on mobile)
- Add `img { max-width: 100%; height: auto; }` rule to ensure images never overflow on mobile

### Technical Details

All changes use existing Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). No new dependencies. No desktop styles are modified -- every change is additive via mobile-first breakpoints.

Files to edit:
1. `src/pages/Summary.tsx` -- mobile padding, title size
2. `src/pages/Accuracy.tsx` -- mobile padding, title size, tab layout
3. `src/pages/FeedbackReporting.tsx` -- mobile padding, title size, chart margins
4. `src/pages/PraiseBoard.tsx` -- header stacking, button full-width
5. `src/pages/Index.tsx` -- stats grid, loading state padding
6. `src/pages/ExecutiveOversight.tsx` -- container padding
7. `src/pages/Settings.tsx` -- tab and form layout
8. `src/index.css` -- global image max-width rule

### What Will NOT Change
- Desktop layout, spacing, fonts, or styling (all changes scoped to mobile breakpoints)
- Sidebar behavior (already mobile-optimized with Sheet drawer)
- Header layout (already responsive)
- Hero banner (already responsive)
- Filter components (already responsive)
- Feedback card grid (already responsive)

