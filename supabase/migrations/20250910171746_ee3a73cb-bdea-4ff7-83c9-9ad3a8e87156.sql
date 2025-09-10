-- Add customer outreach tracking fields to customer_feedback table
ALTER TABLE public.customer_feedback 
ADD COLUMN outreach_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN outreach_method TEXT CHECK (outreach_method IN ('email', 'sms', 'both')),
ADD COLUMN customer_responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN customer_response_sentiment TEXT CHECK (customer_response_sentiment IN ('positive', 'neutral', 'negative')),
ADD COLUMN calculated_score NUMERIC DEFAULT 0;

-- Create customer_outreach_log table for detailed tracking
CREATE TABLE public.customer_outreach_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.customer_feedback(id) ON DELETE CASCADE,
  outreach_method TEXT NOT NULL CHECK (outreach_method IN ('email', 'sms')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced')),
  response_received BOOLEAN DEFAULT false,
  response_sentiment TEXT CHECK (response_sentiment IN ('positive', 'neutral', 'negative')),
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customer_outreach_log
ALTER TABLE public.customer_outreach_log ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_outreach_log
CREATE POLICY "Users can view outreach logs for accessible feedback"
ON public.customer_outreach_log
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.customer_feedback cf 
    WHERE cf.id = customer_outreach_log.feedback_id 
    AND (
      is_admin(auth.uid()) OR 
      user_has_market_access(auth.uid(), cf.market) OR 
      (EXISTS (
        SELECT 1 FROM user_permissions up 
        WHERE up.user_id = auth.uid() 
        AND cf.store_number = ANY (up.stores)
      ))
    )
  )
);

CREATE POLICY "System can insert outreach logs" 
ON public.customer_outreach_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update outreach logs" 
ON public.customer_outreach_log 
FOR UPDATE 
USING (true);

-- Create function to calculate feedback score
CREATE OR REPLACE FUNCTION public.calculate_feedback_score(
  complaint_category TEXT,
  outreach_sent_at TIMESTAMP WITH TIME ZONE,
  customer_response_sentiment TEXT,
  feedback_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  base_score NUMERIC := 0;
  final_score NUMERIC := 0;
  response_time_days NUMERIC;
BEGIN
  -- Set base score based on category
  CASE complaint_category
    WHEN 'Praise' THEN base_score := 5;
    WHEN 'Low' THEN base_score := -1;
    WHEN 'Medium' THEN base_score := -2;
    WHEN 'High' THEN base_score := -3;
    WHEN 'Critical' THEN base_score := -5;
    ELSE base_score := -1; -- Default for other categories
  END CASE;

  final_score := base_score;

  -- If it's a negative score and customer was contacted within 2 days, halve it
  IF base_score < 0 AND outreach_sent_at IS NOT NULL THEN
    response_time_days := EXTRACT(EPOCH FROM (outreach_sent_at - (feedback_date + TIME '00:00:00'))) / 86400;
    
    IF response_time_days <= 2 THEN
      final_score := base_score / 2;
    END IF;
  END IF;

  -- Add bonus for positive customer response
  IF customer_response_sentiment = 'positive' THEN
    final_score := final_score + 3;
  END IF;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function to automatically update calculated_score
CREATE OR REPLACE FUNCTION public.update_feedback_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.calculated_score := public.calculate_feedback_score(
    NEW.complaint_category,
    NEW.outreach_sent_at,
    NEW.customer_response_sentiment,
    NEW.feedback_date
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update score on insert/update
CREATE TRIGGER update_customer_feedback_score
  BEFORE INSERT OR UPDATE ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feedback_score();

-- Update existing records with calculated scores
UPDATE public.customer_feedback 
SET calculated_score = public.calculate_feedback_score(
  complaint_category,
  outreach_sent_at,
  customer_response_sentiment,
  feedback_date
);

-- Create indexes for performance
CREATE INDEX idx_customer_feedback_calculated_score ON public.customer_feedback(calculated_score);
CREATE INDEX idx_customer_feedback_outreach_sent_at ON public.customer_feedback(outreach_sent_at);
CREATE INDEX idx_customer_outreach_log_feedback_id ON public.customer_outreach_log(feedback_id);
CREATE INDEX idx_customer_outreach_log_sent_at ON public.customer_outreach_log(sent_at);