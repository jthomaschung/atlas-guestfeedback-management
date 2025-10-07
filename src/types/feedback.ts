export interface CustomerFeedback {
  id: string;
  feedback_date: string;
  complaint_category: string; // Accept any string from webhook
  channel: string; // Accept any string from webhook
  rating?: number;
  resolution_status: 'unopened' | 'opened' | 'responded' | 'resolved' | 'escalated';
  resolution_notes?: string;
  store_number: string;
  market: string;
  case_number: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  feedback_text?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  priority: 'Praise' | 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: string;
  viewed?: boolean;
  outreach_sent_at?: string;
  outreach_method?: string;
  customer_responded_at?: string;
  customer_response_sentiment?: string;
  calculated_score?: number;
  // New escalation fields
  escalated_at?: string;
  escalated_by?: string;
  executive_notes?: string;
  sla_deadline?: string;
  auto_escalated?: boolean;
  // Approval workflow fields
  approval_status?: string;
  ceo_approved_at?: string;
  vp_approved_at?: string;
  director_approved_at?: string;
  dm_approved_at?: string;
  ready_for_dm_resolution?: boolean;
  customer_called?: boolean;
}