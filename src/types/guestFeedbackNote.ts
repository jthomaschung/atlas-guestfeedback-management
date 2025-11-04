export interface GuestFeedbackNote {
  id: string;
  feedback_id: string;
  note_text: string;
  note_type: 'resolution' | 'executive' | 'general';
  created_at: string;
  created_by_user_id: string;
  created_by_name: string;
  mentioned_users: string[] | null;
}
