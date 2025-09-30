-- Add customer_called field to track if customer was contacted by phone
ALTER TABLE customer_feedback 
ADD COLUMN customer_called boolean DEFAULT false;