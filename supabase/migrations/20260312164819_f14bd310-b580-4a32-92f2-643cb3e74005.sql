
-- Create refund_requests table
CREATE TABLE public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  refund_amount NUMERIC(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_method TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'director_approved', 'approved', 'denied', 'completed')),
  
  -- Approval chain
  manager_approved_by UUID REFERENCES auth.users(id),
  manager_approved_at TIMESTAMPTZ,
  manager_notes TEXT,
  director_approved_by UUID REFERENCES auth.users(id),
  director_approved_at TIMESTAMPTZ,
  director_notes TEXT,
  final_approved_by UUID REFERENCES auth.users(id),
  final_approved_at TIMESTAMPTZ,
  final_notes TEXT,
  denied_by UUID REFERENCES auth.users(id),
  denied_at TIMESTAMPTZ,
  denial_reason TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  
  -- Context from feedback
  store_number TEXT,
  market TEXT,
  customer_name TEXT,
  case_number TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view refund requests
CREATE POLICY "Authenticated users can view refund requests"
  ON public.refund_requests FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can insert refund requests
CREATE POLICY "Authenticated users can create refund requests"
  ON public.refund_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requested_by);

-- Authenticated users can update refund requests
CREATE POLICY "Authenticated users can update refund requests"
  ON public.refund_requests FOR UPDATE TO authenticated
  USING (true);

-- Index for quick lookups
CREATE INDEX idx_refund_requests_feedback_id ON public.refund_requests(feedback_id);
CREATE INDEX idx_refund_requests_status ON public.refund_requests(status);
