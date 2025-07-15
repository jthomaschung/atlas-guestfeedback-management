export type RepairType = 
  | 'AC / Heating'
  | 'Walk In Cooler / Freezer'
  | 'Ice Machine'
  | 'Cold Tables'
  | 'Oven / Proofer'
  | 'Plumbing'
  | 'Electrical'
  | 'General Maintenance'
  | 'Exterior Signage'
  | 'Retarder'
  | 'Toasted Sandwich Oven'
  | 'POS / Network'
  | 'Doors / Windows';

export type Market = 
  | 'AZ1' | 'AZ2' | 'AZ3' | 'AZ4' | 'AZ5'
  | 'IE/LA' | 'OC'
  | 'MN1' | 'MN2'
  | 'NE1' | 'NE2' | 'NE3' | 'NE4'
  | 'FL1' | 'FL2' | 'FL3'
  | 'PA';

export type WorkOrderPriority = 'Critical' | 'Important' | 'Low';

export type EcoSure = 'Imminent Health' | 'Critical' | 'Major' | 'Minor' | 'N/A';

export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface WorkOrderFormData {
  description: string;
  repair_type: RepairType;
  store_number: string;
  market: Market;
  priority: WorkOrderPriority;
  ecosure: EcoSure;
  assignee?: string;
  image?: File;
}

export interface WorkOrder {
  id: string;
  user_id: string;
  description: string;
  repair_type: RepairType;
  store_number: string;
  market: Market;
  priority: WorkOrderPriority;
  ecosure: EcoSure;
  status: WorkOrderStatus;
  assignee?: string;
  image_url?: string;
  notes?: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}