-- Make the feedback-screenshots bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'feedback-screenshots';