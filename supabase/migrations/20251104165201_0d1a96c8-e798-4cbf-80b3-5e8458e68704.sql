-- Create email templates table for managing customer outreach templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  email_body TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read templates
CREATE POLICY "Anyone can view email templates"
ON public.email_templates
FOR SELECT
USING (true);

-- Authenticated users can update templates
CREATE POLICY "Authenticated users can update email templates"
ON public.email_templates
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Admins can insert and delete templates
CREATE POLICY "Admins can insert email templates"
ON public.email_templates
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_hierarchy
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete email templates"
ON public.email_templates
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.user_hierarchy
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_email_templates_template_key ON public.email_templates(template_key);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);

-- Add comment
COMMENT ON TABLE public.email_templates IS 'Stores editable email templates for customer outreach';

-- Insert default templates
INSERT INTO public.email_templates (template_key, template_name, subject_line, email_body, description, category) VALUES
('acknowledgment', 'Acknowledgment Email', 'Thank You for Your Feedback', 'Dear {{customer_name}},\n\nThank you for taking the time to share your feedback with us. We appreciate hearing from our valued customers.\n\nYour feedback has been received and our team will review it carefully.\n\nBest regards,\n{{store_name}} Team', 'Standard acknowledgment for received feedback', 'general'),
('praise', 'Praise Response Email', 'Thank You for Your Kind Words!', 'Dear {{customer_name}},\n\nThank you so much for your wonderful feedback! We are thrilled to hear about your positive experience at our {{store_name}} location.\n\nWe will make sure to share your kind words with our team.\n\nBest regards,\n{{store_name}} Team', 'Response to positive feedback and praise', 'positive'),
('escalation', 'Escalation Email', 'We''re Here to Help - Important Follow-up', 'Dear {{customer_name}},\n\nWe have reviewed your recent feedback regarding your experience at our {{store_name}} location, and we sincerely apologize for any inconvenience.\n\nYour concern is important to us, and we would like to discuss this matter further with you.\n\nBest regards,\n{{store_name}} Management Team', 'Email for escalated issues requiring management attention', 'escalation'),
('resolution', 'Resolution Email', 'Resolution of Your Recent Feedback', 'Dear {{customer_name}},\n\nThank you for bringing your concern to our attention. We have investigated the issue and taken the following actions:\n\n{{resolution_details}}\n\nWe hope this resolves your concern satisfactorily.\n\nBest regards,\n{{store_name}} Team', 'Email confirming issue resolution', 'resolution');
