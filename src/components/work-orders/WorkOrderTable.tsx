import { WorkOrder, WorkOrderStatus } from "@/types/work-order";
import { WorkOrderCard } from "./WorkOrderCard";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
}

export function WorkOrderTable({ workOrders, onStatusChange, onEdit, onViewDetails }: WorkOrderTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workOrders.map((workOrder) => (
          <WorkOrderCard
            key={workOrder.id}
            workOrder={workOrder}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}