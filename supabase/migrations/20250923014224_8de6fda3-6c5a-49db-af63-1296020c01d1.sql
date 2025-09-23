-- Create debug table for webhook data
CREATE TABLE public.debug_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_data JSONB NOT NULL,
  content_type TEXT,
  method TEXT,
  headers JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debug_webhooks ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view debug data
CREATE POLICY "Admins can view debug webhooks" 
ON public.debug_webhooks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);