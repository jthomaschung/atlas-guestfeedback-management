-- Create table for user market/store permissions
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  markets TEXT[] DEFAULT '{}',
  stores TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can insert user permissions" 
ON public.user_permissions 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update user permissions" 
ON public.user_permissions 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Update notification_preferences policies to allow admin access
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.notification_preferences;

CREATE POLICY "Users can view preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update preferences" 
ON public.notification_preferences 
FOR UPDATE 
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Create trigger for user_permissions timestamp updates
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();