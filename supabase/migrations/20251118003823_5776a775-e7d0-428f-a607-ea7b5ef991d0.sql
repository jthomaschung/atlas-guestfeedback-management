-- Standardize market names: Update "NE4" to "NE 4" for consistency
UPDATE customer_feedback 
SET market = 'NE 4' 
WHERE market = 'NE4';

-- Add a comment explaining the standardization
COMMENT ON COLUMN customer_feedback.market IS 'Market identifier - should always include space between letters and numbers (e.g., "NE 4" not "NE4")';