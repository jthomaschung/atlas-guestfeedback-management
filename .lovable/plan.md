

## Sidebar Visual Update

Based on the reference screenshot, here are the changes to match the desired look:

### What Changes

**1. Remove the logo image, keep text only (AppSidebar.tsx)**
- Remove the `<img>` tag for the Atlas logo
- Keep "ATLAS" heading and "Guest Feedback Portal" subtitle
- Ensure proper spacing and alignment without the logo

**2. Red border wraps top, right, and bottom with rounded corners (already mostly done in index.css)**
- The current CSS already applies `border-top`, `border-right`, `border-bottom` with Atlas Red and `border-radius: 0 12px 12px 0`
- Verify this matches the screenshot styling -- it should already be correct

### Files to Edit

- **src/components/AppSidebar.tsx** -- Remove the logo `<img>` element from the header section (lines 204-208), keep the text "ATLAS" and "Guest Feedback Portal"

### Technical Details

In `AppSidebar.tsx`, the header block (lines 199-216) will be simplified:
- Remove the `<img>` tag on lines 204-208
- Remove the `gap-3` flex container that held the logo + text, since only text remains
- Keep the `<h2>` ("ATLAS") and `<p>` ("Guest Feedback Portal") elements
- Adjust padding/alignment so the text sits cleanly at the top left of the sidebar

The red border wrapping (top, right, bottom with rounded right corners) is already implemented in `src/index.css` lines 9-12 and should match the reference screenshot.

