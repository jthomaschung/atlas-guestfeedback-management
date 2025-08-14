import { WorkOrder, WorkOrderStatus } from "@/types/work-order";
import { WorkOrderCard } from "./WorkOrderCard";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
  onDelete?: (workOrder: WorkOrder) => void;
  isAdmin?: boolean;
}

export function WorkOrderTable({ workOrders, onStatusChange, onEdit, onViewDetails, onDelete, isAdmin }: WorkOrderTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {workOrders.map((workOrder) => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}