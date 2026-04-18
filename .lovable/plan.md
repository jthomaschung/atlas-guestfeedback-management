

## Problem

The card in the screenshot shows "Category: Order Issue" inside the description **text body**, but the actual DB `complaint_category` column is `"Hours"`. This is a Qualtrics → Zapier record that **bypassed the edge function** (channel = `qualtrics`, inserted directly), so:

1. The category was never normalized (`"Hours"` should → `"Closed Early"`).
2. The feedback_text arrived with a structured prefix: `"Category : Order Issue\nSub Category : Other\nDescription : ..."` — that prefix is displayed raw in the card body.
3. Assignee stayed on `guestfeedback@atlaswe.com` because "Hours" / "Closed Early" isn't in my new DB trigger's store-level list.
4. In reality, "Store and system closed 1 hour early" = **Closed Early** — which per `mem://features/feedback-automated-routing-logic` is a **DM-level** category, not store or guest.

## Fix (two parts)

### Part 1 — Extend the DB trigger to normalize category + route properly (Qualtrics-safe)

Update `route_customer_feedback_assignee()` (the trigger created earlier) to also **normalize `complaint_category`** on insert, matching the edge function's mapping. Add routing tiers:

- **Normalize**: `hours` → `Closed Early`, `order issue`/`sandwich issue`/`submitted incorrect order` → `Sandwich Made Wrong`, `team member complaint`/`rude` → `Rude Service`, `oop` → `Out of Product`, etc. (mirror edge function logic).
- **Store-level** (→ `store{n}@atlaswe.com` if profile exists): Sandwich Made Wrong, Missing Item, Order Accuracy, Cleanliness, Praise, Bread Quality, Product Quality.
- **DM-level** (→ market DM via `user_hierarchy`/`user_market_permissions`; fallback to `guestfeedback@atlaswe.com`): **Closed Early**, Rude Service, Out of Product, Possible Food Poisoning.
- **Guest Feedback** (→ `guestfeedback@atlaswe.com`): Slow Service, Product Issue, Credit Card Issue, Loyalty Program Issues, Other.

Also strip the `"Category : X\nSub Category : Y\nDescription : "` prefix from `feedback_text` on insert so descriptions render cleanly.

### Part 2 — Backfill existing misrouted/misnamed records

Re-run normalization + routing on all existing records where `complaint_category` is a raw Qualtrics value (`'Hours'`, `'Order Issue'`, `'OOP'`, `'Team Member Complaint'`, etc.) and clean up feedback_text prefixes for those same records.

### Verification

1. Query record `CCC8632787` → confirm `complaint_category = 'Closed Early'`, assignee = DM for TX 1 market (or `guestfeedback@atlaswe.com` if no DM mapped), feedback_text prefix stripped.
2. Reload Open Feedback → card shows "Closed Early" as the title, clean description.
3. Spot-check other Qualtrics-channel records.

