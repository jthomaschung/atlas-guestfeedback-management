

## Improve Red Carpet Patch Clarity in Hero Banner

### Problem
The patch image is crammed into a small 48px circle (`rounded-full` + `object-cover`), which clips the design and makes it look blurry/terrible. A detailed patch logo needs more space and should not be circle-cropped.

### Fix

**File: `src/pages/Index.tsx`** (lines 622-628)

Remove the circular crop and increase the size so the patch is displayed clearly:

```tsx
<div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1">
  <img 
    src="/lovable-uploads/red-carpet-badge.png" 
    alt="Red Carpet Customer Service" 
    className="w-full h-full object-contain"
  />
</div>
```

Changes:
- Container: `w-14 h-14 rounded-full` becomes `w-16 h-16 rounded-lg` -- larger, square with rounded corners instead of a circle
- Added `p-1` padding so the image doesn't touch the edges
- Image: `w-12 h-12 rounded-full object-cover` becomes `w-full h-full object-contain` -- fills the container without cropping, preserving the full patch design

### Summary
- 1 file changed: `src/pages/Index.tsx`
- The patch will display at full detail without being cropped into a circle

