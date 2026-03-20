UPDATE customer_feedback
SET complaint_category = 'Out of Product',
    resolution_status = 'escalated',
    escalated_at = now(),
    auto_escalated = true,
    sla_deadline = now() + interval '24 hours',
    assignee = 'jonathan.ball@atlaswe.com',
    priority = 'Critical',
    updated_at = now()
WHERE id = '2d2a6b91-6cb9-4e09-a28e-be2b3a7252bc'