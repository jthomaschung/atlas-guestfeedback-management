-- First check if the enum exists and create it if needed
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'director', 'manager', 'user', 'vp', 'ceo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new values to existing enum if it already exists
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vp';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ceo';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create escalation_log table to track critical issue escalations
CREATE TABLE IF NOT EXISTS public.escalation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  escalated_from TEXT NOT NULL,
  escalated_to TEXT NOT NULL,
  escalation_reason TEXT NOT NULL,
  escalated_by UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  executive_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on escalation_log
ALTER TABLE public.escalation_log ENABLE ROW LEVEL SECURITY;

-- Create policies for escalation_log
DROP POLICY IF EXISTS "Executives can view escalation logs" ON public.escalation_log;
CREATE POLICY "Executives can view escalation logs" 
ON public.escalation_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_hierarchy 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'director', 'vp', 'ceo')
  )
);

DROP POLICY IF EXISTS "System can insert escalation logs" ON public.escalation_log;
CREATE POLICY "System can insert escalation logs" 
ON public.escalation_log 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Executives can update escalation logs" ON public.escalation_log;
CREATE POLICY "Executives can update escalation logs" 
ON public.escalation_log 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_hierarchy 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'director', 'vp', 'ceo')
  )
);

-- Add escalation tracking columns to customer_feedback
ALTER TABLE public.customer_feedback 
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escalated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS executive_notes TEXT,
ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_escalated BOOLEAN DEFAULT false;