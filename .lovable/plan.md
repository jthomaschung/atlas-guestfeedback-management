

# Fix "Out of Stock" → "Out of Product" Category Normalization

## Problem
Store 2812 received feedback categorized as "Out of Stock Item" which was not recognized by the normalization logic. It should have been mapped to "Out of Product" and auto-escalated to the DM.

## Changes

### 1. Fix the existing record (SQL migration)
Update feedback `2d2a6b91-6cb9-4e09-a28e-be2b3a7252bc`:
- Change `complaint_category` from "Out of Stock Item" to "Out of Product"
- Set `resolution_status` to "escalated"
- Set `escalated_at`, `auto_escalated`, and `sla_deadline`
- Look up and assign the OC market DM via `findDmForMarket` logic (query `user_hierarchy` + `user_permissions` + `profiles`)

### 2. Update ingestion normalization (edge function)
In `supabase/functions/ingest-feedback/index.ts`, add two new entries to the `categoryNormalization` map:
```
'out of stock': 'Out of Product',
'out of stock item': 'Out of Product',
```

This ensures any future "Out of Stock" or "Out of Stock Item" categories from webhooks are automatically normalized to "Out of Product" and routed through the existing escalation logic.

### Files modified
- `supabase/functions/ingest-feedback/index.ts` — add normalization entries
- New SQL migration — fix the existing record

