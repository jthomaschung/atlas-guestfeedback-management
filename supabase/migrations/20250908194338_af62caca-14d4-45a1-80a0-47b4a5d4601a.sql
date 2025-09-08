-- Add viewed column if it doesn't exist
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS viewed boolean DEFAULT false;

-- Add priority and assignee columns if they don't exist  
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Low';
ALTER TABLE customer_feedback ADD COLUMN IF NOT EXISTS assignee text;