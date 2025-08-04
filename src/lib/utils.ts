import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addBusinessDays, isAfter } from "date-fns"
import { WorkOrderPriority } from "@/types/work-order"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBusinessDaysForPriority(priority: WorkOrderPriority): number {
  switch (priority) {
    case 'Critical':
      return 3;
    case 'Important':
      return 10;
    case 'Low':
      return 60;
    default:
      return 7; // fallback
  }
}

export function isWorkOrderOverdue(createdAt: string, priority: WorkOrderPriority): boolean {
  const createdDate = new Date(createdAt);
  const businessDays = getBusinessDaysForPriority(priority);
  const dueDate = addBusinessDays(createdDate, businessDays);
  return isAfter(new Date(), dueDate);
}
