-- Allow all authenticated users to view profiles for mentions feature
CREATE POLICY "Authenticated users can view profiles for mentions"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);