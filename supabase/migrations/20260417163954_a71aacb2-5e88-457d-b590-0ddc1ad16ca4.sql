UPDATE public.customer_feedback cf
SET assignee = 'store' || cf.store_number || '@atlaswe.com',
    updated_at = now()
WHERE cf.assignee IS DISTINCT FROM ('store' || cf.store_number || '@atlaswe.com')
  AND LOWER(cf.complaint_category) IN (
    'order accuracy',
    'missing item',
    'sandwich made wrong',
    'sandwich wrong',
    'sandwich issue',
    'bread quality',
    'product quality',
    'cleanliness',
    'slow service',
    'rude staff',
    'closed early',
    'out of product - bread',
    'out of product - other',
    'out of product'
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.email = 'store' || cf.store_number || '@atlaswe.com'
  );