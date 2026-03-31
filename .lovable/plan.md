

# Fix: Un-normalized Complaint Categories

## Problem
The database contains categories that don't match the UI's `categoryOptions` list, so they don't display properly on cards. Affected records:

| DB Category | Count | Should Be |
|---|---|---|
| Order Accuracy | 5 | Add to UI options |
| Delivery Complaint | 1 | Slow Service |
| Delivery Timing | 1 | Slow Service |
| Hours | 1 | Closed Early |
| Portion | 1 | Other |
| Product Quality | 1 | Product Issue |
| Sandwich Made wrong (lowercase w) | 6 | Sandwich Made Wrong |
| Submitted Incorrect Order | 1 | Sandwich Made Wrong |

## Solution

### 1. Add "Order Accuracy" to UI category options
Since the user wants this displayed as "Order Accuracy", add it to `categoryOptions` in:
- `src/components/feedback/CustomerFeedbackCard.tsx`
- `src/components/feedback/FeedbackDetailsDialog.tsx`
- `src/components/feedback/AddFeedbackDialog.tsx`

### 2. Normalize remaining mis-categorized DB records
Use the insert tool to run UPDATE statements fixing the 12 other records:
- `Delivery Complaint` → `Slow Service`
- `Delivery Timing` → `Slow Service`
- `Hours` → `Closed Early`
- `Portion` → `Other`
- `Product Quality` → `Product Issue`
- `Sandwich Made wrong` → `Sandwich Made Wrong`
- `Submitted Incorrect Order` → `Sandwich Made Wrong`

### 3. Update ingestion normalization
In `supabase/functions/ingest-feedback/index.ts`, add mappings for `delivery complaint`, `portion`, `product quality`, and `submitted incorrect order` so future ingestion handles them automatically.

