INSERT INTO refund_requests (
  feedback_id, requested_by, refund_amount, refund_reason, refund_method,
  notes, store_number, market, customer_name, customer_email, customer_phone,
  case_number, requires_director_approval, requires_catering_approval, status
) VALUES (
  'e3051934-473f-497e-94e1-f70875fe8cd0',
  'ffa7a6b9-ddfd-47ca-8a86-66b69d87b738',
  15.99,
  'Wrong Order',
  'Original Payment Method',
  'Test refund request for email functionality verification',
  '2821',
  'OC',
  'Test Customer',
  'testcustomer@example.com',
  '555-0100',
  'CCC8501910',
  false,
  false,
  'pending'
);