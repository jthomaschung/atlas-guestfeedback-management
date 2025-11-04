-- Add new columns to customer_feedback table for additional Zapier fields
ALTER TABLE customer_feedback 
ADD COLUMN IF NOT EXISTS time_of_day TEXT,
ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Add index for order number lookups
CREATE INDEX IF NOT EXISTS idx_customer_feedback_order_number 
ON customer_feedback(order_number);

-- Add comments for documentation
COMMENT ON COLUMN customer_feedback.time_of_day IS 'Meal period when feedback occurred (e.g., Lunch Open-2pm, Dinner Rush)';
COMMENT ON COLUMN customer_feedback.order_number IS 'Customer order number from POS system for cross-referencing';