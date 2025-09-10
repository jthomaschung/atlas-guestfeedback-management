-- Create a dummy feedback entry for testing email functionality
INSERT INTO public.customer_feedback (
  id,
  feedback_date,
  complaint_category,
  channel,
  resolution_status,
  store_number,
  market,
  case_number,
  customer_name,
  customer_email,
  feedback_text,
  user_id,
  priority,
  assignee
) VALUES (
  gen_random_uuid(),
  CURRENT_DATE,
  'Product issue',
  'email',
  'unopened',
  '1234',
  'Test Market',
  'TEST-' || extract(epoch from now())::text,
  'James Chung',
  'jchung@atlaswe.com',
  'This is a test feedback entry for testing email outreach functionality. Please disregard this test case.',
  (SELECT user_id FROM public.profiles WHERE email = 'jchung@atlaswe.com' LIMIT 1),
  'Medium',
  'Test Manager'
);