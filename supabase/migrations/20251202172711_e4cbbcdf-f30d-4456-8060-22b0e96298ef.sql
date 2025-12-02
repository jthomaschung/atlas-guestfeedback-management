-- Reset the most recent notification to unread for testing
UPDATE notification_log 
SET read_at = NULL 
WHERE id = '7596d689-a70b-49eb-b953-f4f1d3c53f83';