-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public access to screenshots" ON storage.objects;

-- Allow authenticated users to upload their own screenshots
CREATE POLICY "Users can upload their own screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feedback-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Make all screenshots publicly accessible for reading
CREATE POLICY "Public can view screenshots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'feedback-screenshots');