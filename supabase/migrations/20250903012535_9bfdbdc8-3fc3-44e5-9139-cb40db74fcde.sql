-- Create customer feedback tables for guest feedback data

-- First, create an enum for feedback channels
CREATE TYPE feedback_channel AS ENUM ('yelp', 'qualtrics', 'jimmy_johns');

-- Create an enum for complaint categories
CREATE TYPE complaint_category AS ENUM (
  'sandwich_made_wrong',
  'slow_service', 
  'rude_service',
  'product_issue',
  'closed_early',
  'praise',
  'missing_item',
  'credit_card_issue',
  'bread_quality',
  'out_of_product',
  'other',
  'cleanliness',
  'possible_food_poisoning',
  'loyalty_program_issues'
);

-- Create the main customer feedback table
CREATE TABLE public.customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_number TEXT NOT NULL,
  market TEXT NOT NULL,
  feedback_date DATE NOT NULL,
  case_number TEXT NOT NULL,
  complaint_category complaint_category NOT NULL,
  channel feedback_channel NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  feedback_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  resolution_status TEXT DEFAULT 'pending',
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL -- User who imported/created the feedback record
);

-- Enable RLS on customer feedback table
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for customer feedback
CREATE POLICY "Users can view feedback for their accessible stores" 
ON public.customer_feedback 
FOR SELECT 
USING (
  -- Admins can see all feedback
  is_admin(auth.uid()) OR
  -- Users can see feedback for stores/markets they have permission for
  EXISTS (
    SELECT 1 FROM public.user_permissions up 
    WHERE up.user_id = auth.uid() 
    AND (
      -- Has access to this specific store
      store_number = ANY(up.stores) OR
      -- Has access to this market
      market = ANY(up.markets)
    )
  )
);

CREATE POLICY "Users can create feedback records" 
ON public.customer_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and record creators can update feedback" 
ON public.customer_feedback 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = user_id
);

CREATE POLICY "Only admins can delete feedback records" 
ON public.customer_feedback 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_customer_feedback_store_number ON public.customer_feedback(store_number);
CREATE INDEX idx_customer_feedback_market ON public.customer_feedback(market);
CREATE INDEX idx_customer_feedback_date ON public.customer_feedback(feedback_date);
CREATE INDEX idx_customer_feedback_category ON public.customer_feedback(complaint_category);
CREATE INDEX idx_customer_feedback_channel ON public.customer_feedback(channel);
CREATE INDEX idx_customer_feedback_case_number ON public.customer_feedback(case_number);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_feedback_updated_at
BEFORE UPDATE ON public.customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();