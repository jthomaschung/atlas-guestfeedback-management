-- Create default notification preferences for Anthony Luna
INSERT INTO public.notification_preferences (user_id, email_on_completion, email_on_tagged, email_on_assignment)
VALUES ('31e85486-3942-4270-8375-76749c66744e', true, true, true)
ON CONFLICT (user_id) DO NOTHING;