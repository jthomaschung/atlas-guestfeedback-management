-- Drop the existing enum constraint and change complaint_category to text
ALTER TABLE customer_feedback 
ALTER COLUMN complaint_category TYPE text;

-- Update the channel column to also be text instead of enum for flexibility
ALTER TABLE customer_feedback 
ALTER COLUMN channel TYPE text;