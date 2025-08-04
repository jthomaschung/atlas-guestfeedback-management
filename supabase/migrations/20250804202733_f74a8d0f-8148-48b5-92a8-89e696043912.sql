-- Create user hierarchy table for notification routing
CREATE TABLE public.user_hierarchy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  manager_id UUID,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

-- Create policies for user hierarchy
CREATE POLICY "Users can view hierarchy" 
ON public.user_hierarchy 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own hierarchy" 
ON public.user_hierarchy 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hierarchy" 
ON public.user_hierarchy 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_on_completion BOOLEAN DEFAULT true,
  email_on_tagged BOOLEAN DEFAULT true,
  email_on_assignment BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification preferences
CREATE POLICY "Users can view their own preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.notification_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.notification_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create notification log table
CREATE TABLE public.notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  work_order_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Create policy for notification log
CREATE POLICY "Users can view notification logs" 
ON public.notification_log 
FOR SELECT 
USING (true);

-- Add trigger for timestamp updates
CREATE TRIGGER update_user_hierarchy_updated_at
BEFORE UPDATE ON public.user_hierarchy
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();