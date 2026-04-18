-- Backfill: touch every record so the BEFORE UPDATE trigger normalizes + reroutes it.
-- Limit to records that actually need it to keep the operation lean.
UPDATE public.customer_feedback
SET complaint_category = complaint_category
WHERE LOWER(TRIM(complaint_category)) IN (
  'sandwich issue','order issue','submitted incorrect order',
  'missing items','delivery timing','delivery complaint',
  'team member friendliness','team member complaint','rude','rude staff',
  'hours','oop','out of stock','out of stock item','product not available',
  'foreign object','health safety','illness','allergic reaction guest',
  'food poisoning','food safety','gift card issue','incorrect change',
  'pricing issue','unauthorized tip','credit card','product quality',
  'taste','portion','appearance','area of restaurant','online ordering',
  'online ordering issues','duplicate order','employment and hiring',
  'compensation/benefits team member','menu question','no feedback provided',
  'not honored','order not received','wrong store','gloves/equipment',
  'handicap access','sandwich made wrong'
)
OR feedback_text ~* '^\s*Category\s*:'
OR LOWER(complaint_category) IN ('closed early','rude service','out of product','possible food poisoning','sandwich made wrong','missing item','order accuracy','cleanliness','praise','bread quality');