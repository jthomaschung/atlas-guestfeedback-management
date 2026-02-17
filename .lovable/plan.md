
## Update Hero Banner Image

### Change
Replace the current badge image in the dashboard hero banner with the uploaded Red Carpet Customer Service patch logo.

### Steps

1. **Copy the uploaded image** to `public/lovable-uploads/red-carpet-badge.png`
2. **Update `src/pages/Index.tsx`** (line 624): Change the image `src` from the current path to the new Red Carpet patch image. Also increase the image and container size slightly since the patch has more detail than a simple logo.

### Technical Details

**File: `src/pages/Index.tsx`** (lines 622-628)

Change the badge container and image to use the new patch:

```tsx
<div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
  <img 
    src="/lovable-uploads/red-carpet-badge.png" 
    alt="Red Carpet Customer Service" 
    className="w-12 h-12 rounded-full object-cover"
  />
</div>
```

- Makes the container circular to match the patch shape
- Slightly larger (14/12 instead of 12/8) to show detail
- 1 image copied, 1 file edited
