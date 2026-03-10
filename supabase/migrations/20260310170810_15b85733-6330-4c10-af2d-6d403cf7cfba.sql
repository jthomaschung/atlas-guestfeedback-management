-- Update channel to 'RAP' for all unresolved feedback
UPDATE customer_feedback 
SET channel = 'RAP'
WHERE resolution_status NOT IN ('resolved')
AND (channel IS NULL OR channel != 'RAP');

-- GFM categories: assign to guestfeedback@atlaswe.com
UPDATE customer_feedback
SET assignee = 'guestfeedback@atlaswe.com'
WHERE resolution_status NOT IN ('resolved')
AND type_of_feedback IS NULL
AND LOWER(complaint_category) IN ('slow service', 'product issue', 'credit card issue', 'bread quality', 'other', 'loyalty program issues', 'hours', 'order accuracy', 'team member friendliness', 'unauthorized tip', 'out of stock item')
AND (assignee IS NULL OR assignee = 'Unassigned');

-- Store-level categories: assign to store email pattern where unassigned
UPDATE customer_feedback
SET assignee = 'store' || store_number || '@atlaswe.com'
WHERE resolution_status NOT IN ('resolved')
AND type_of_feedback IS NULL
AND LOWER(complaint_category) IN ('sandwich made wrong', 'missing item', 'missing items', 'praise', 'cleanliness', 'sandwich issue')
AND (assignee IS NULL OR assignee = 'Unassigned');