export interface CustomerFeedback {
  id: string;
  feedback_date: string;
  complaint_category: 'praise' | 'service' | 'food_quality' | 'cleanliness' | 'order_accuracy' | 'wait_time' | 'facility_issue' | 'other';
  channel: 'yelp' | 'qualtrics' | 'jimmy_johns';
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
  priority: 'Praise' | 'Low' | 'High' | 'Critical';
  assignee?: string;
  viewed?: boolean;
}