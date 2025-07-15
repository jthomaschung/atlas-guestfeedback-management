export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderCategory = 'equipment' | 'cleaning' | 'maintenance' | 'supplies' | 'other';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  dueDate: Date;
  completedAt?: Date;
  location?: string;
  estimatedHours?: number;
}

export interface WorkOrderFormData {
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  assignedTo: string;
  dueDate: Date;
  location?: string;
  estimatedHours?: number;
}