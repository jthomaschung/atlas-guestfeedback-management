export interface CustomerFeedback {
  id: string;
  feedback_date: string;
  complaint_category: string; // Accept any string from webhook
  channel: string; // Accept any string from webhook
  rating?: number;
  resolution_status: 'unopened' | 'responded' | 'resolved' | 'escalated';
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
}