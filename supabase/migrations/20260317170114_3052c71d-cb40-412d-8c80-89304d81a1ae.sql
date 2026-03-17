-- Create a table to track all refunds and voids (voids to be added later)
CREATE TABLE public.refund_void_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refund_request_id uuid REFERENCES public.refund_requests(id) ON DELETE SET NULL,
  feedback_id uuid REFERENCES public.customer_feedback(id) ON DELETE SET NULL,
  transaction_type text NOT NULL DEFAULT 'refund' CHECK (transaction_type IN ('refund', 'void')),
  amount numeric NOT NULL,
  store_number text,
  market text,
  period text,
  reason text,
  method text,
  customer_name text,
  case_number text,
  processed_by uuid,
  processed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.refund_void_ledger ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view (for reporting)
CREATE POLICY "Authenticated users can view ledger"
  ON public.refund_void_ledger FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert ledger"
  ON public.refund_void_ledger FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for common query patterns
CREATE INDEX idx_refund_void_ledger_store ON public.refund_void_ledger (store_number);
CREATE INDEX idx_refund_void_ledger_market ON public.refund_void_ledger (market);
CREATE INDEX idx_refund_void_ledger_period ON public.refund_void_ledger (period);
CREATE INDEX idx_refund_void_ledger_type ON public.refund_void_ledger (transaction_type);
CREATE INDEX idx_refund_void_ledger_processed_at ON public.refund_void_ledger (processed_at);

-- Create a trigger function to auto-record to ledger when a refund is completed
CREATE OR REPLACE FUNCTION public.record_refund_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO public.refund_void_ledger (
      refund_request_id,
      feedback_id,
      transaction_type,
      amount,
      store_number,
      market,
      reason,
      method,
      customer_name,
      case_number,
      processed_by,
      processed_at
    ) VALUES (
      NEW.id,
      NEW.feedback_id,
      'refund',
      NEW.refund_amount,
      NEW.store_number,
      NEW.market,
      NEW.refund_reason,
      NEW.refund_method,
      NEW.customer_name,
      NEW.case_number,
      NEW.completed_by,
      COALESCE(NEW.completed_at, now())
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to refund_requests
CREATE TRIGGER trg_record_refund_to_ledger
  AFTER UPDATE ON public.refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.record_refund_to_ledger();
