-- Update user_hierarchy RLS policies to allow admins to manage any user's hierarchy

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own hierarchy" ON public.user_hierarchy;
DROP POLICY IF EXISTS "Users can update their own hierarchy" ON public.user_hierarchy;

-- Create new policies that allow admins to manage any hierarchy
CREATE POLICY "Users can insert hierarchy records" 
ON public.user_hierarchy 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  public.is_admin(auth.uid())
);

CREATE POLICY "Users can update hierarchy records" 
ON public.user_hierarchy 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.is_admin(auth.uid())
);