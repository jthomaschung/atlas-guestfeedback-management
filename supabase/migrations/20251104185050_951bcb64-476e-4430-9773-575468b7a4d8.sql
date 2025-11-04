-- Create guest_feedback_notes table for immutable note history
CREATE TABLE public.guest_feedback_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES customer_feedback(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('resolution', 'executive', 'general')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_by_name TEXT NOT NULL,
  mentioned_users TEXT[]
);

-- Create indexes for performance
CREATE INDEX idx_guest_feedback_notes_feedback_id ON public.guest_feedback_notes(feedback_id);
CREATE INDEX idx_guest_feedback_notes_created_at ON public.guest_feedback_notes(created_at);
CREATE INDEX idx_guest_feedback_notes_note_type ON public.guest_feedback_notes(note_type);

-- Enable RLS
ALTER TABLE public.guest_feedback_notes ENABLE ROW LEVEL SECURITY;

-- Users can view notes for feedback they have access to
CREATE POLICY "Users can view notes for accessible feedback"
  ON public.guest_feedback_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customer_feedback cf
      WHERE cf.id = guest_feedback_notes.feedback_id
      AND (
        is_admin(auth.uid())
        OR user_has_market_access_v2(auth.uid(), cf.market)
        OR user_has_store_access(auth.uid(), cf.store_number)
        OR (cf.resolution_status = 'escalated' AND is_executive(auth.uid()))
      )
    )
  );

-- Users can insert notes (but never update or delete - immutable)
CREATE POLICY "Users can create notes for accessible feedback"
  ON public.guest_feedback_notes
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by_user_id
    AND EXISTS (
      SELECT 1 FROM customer_feedback cf
      WHERE cf.id = guest_feedback_notes.feedback_id
      AND (
        is_admin(auth.uid())
        OR user_has_market_access_v2(auth.uid(), cf.market)
        OR user_has_store_access(auth.uid(), cf.store_number)
        OR (cf.resolution_status = 'escalated' AND is_executive(auth.uid()))
      )
    )
  );

-- Migrate existing resolution_notes to new table (only records with valid user_ids)
INSERT INTO public.guest_feedback_notes (
  feedback_id,
  note_text,
  note_type,
  created_at,
  created_by_user_id,
  created_by_name,
  mentioned_users
)
SELECT 
  cf.id as feedback_id,
  cf.resolution_notes as note_text,
  'resolution'::text as note_type,
  cf.updated_at as created_at,
  cf.user_id as created_by_user_id,
  COALESCE(p.display_name, 'System Migration') as created_by_name,
  ARRAY[]::text[] as mentioned_users
FROM customer_feedback cf
LEFT JOIN profiles p ON p.user_id = cf.user_id
WHERE cf.resolution_notes IS NOT NULL 
  AND cf.resolution_notes != ''
  AND cf.user_id != '00000000-0000-0000-0000-000000000000'
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = cf.user_id);

-- Migrate existing executive_notes to new table (only records with valid user_ids)
INSERT INTO public.guest_feedback_notes (
  feedback_id,
  note_text,
  note_type,
  created_at,
  created_by_user_id,
  created_by_name,
  mentioned_users
)
SELECT 
  cf.id as feedback_id,
  cf.executive_notes as note_text,
  'executive'::text as note_type,
  COALESCE(cf.escalated_at, cf.updated_at) as created_at,
  COALESCE(cf.escalated_by, cf.user_id) as created_by_user_id,
  COALESCE(p.display_name, 'Executive') as created_by_name,
  ARRAY[]::text[] as mentioned_users
FROM customer_feedback cf
LEFT JOIN profiles p ON p.user_id = COALESCE(cf.escalated_by, cf.user_id)
WHERE cf.executive_notes IS NOT NULL 
  AND cf.executive_notes != ''
  AND COALESCE(cf.escalated_by, cf.user_id) != '00000000-0000-0000-0000-000000000000'
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = COALESCE(cf.escalated_by, cf.user_id));