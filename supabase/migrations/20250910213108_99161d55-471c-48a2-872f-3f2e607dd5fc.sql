-- Extend customer_outreach_log to support email conversations
ALTER TABLE customer_outreach_log 
ADD COLUMN direction text DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN email_message_id text,
ADD COLUMN replied_to_id uuid REFERENCES customer_outreach_log(id),
ADD COLUMN from_email text,
ADD COLUMN to_email text,
ADD COLUMN subject text,
ADD COLUMN email_thread_id text;

-- Create index for better performance on email threads
CREATE INDEX idx_customer_outreach_log_thread ON customer_outreach_log(email_thread_id);
CREATE INDEX idx_customer_outreach_log_feedback ON customer_outreach_log(feedback_id, sent_at);

-- Update RLS policies to allow inserting inbound emails
DROP POLICY IF EXISTS "System can insert outreach logs" ON customer_outreach_log;
CREATE POLICY "System can insert outreach logs" ON customer_outreach_log
  FOR INSERT WITH CHECK (true);

-- Add policy for email webhook to insert inbound emails
CREATE POLICY "Email webhook can insert inbound messages" ON customer_outreach_log
  FOR INSERT WITH CHECK (direction = 'inbound');