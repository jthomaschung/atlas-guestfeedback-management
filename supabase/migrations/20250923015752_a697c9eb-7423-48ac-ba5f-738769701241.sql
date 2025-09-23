-- Fix the feedback_id for the existing inbound reply to link it to the correct conversation
UPDATE customer_outreach_log 
SET feedback_id = 'e9bf83b9-0f9d-4d45-a1c7-180d4f9adda7' 
WHERE id = 'c36b4f44-164c-4e13-a392-42e7f6522abd';