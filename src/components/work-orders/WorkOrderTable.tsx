import { WorkOrder, WorkOrderStatus } from "@/types/work-order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
}

const statusColors = {
  pending: 'bg-status-pending text-status-pending-foreground border-status-pending cursor-pointer hover:bg-status-pending/90 shadow-sm',
  'in-progress': 'bg-status-in-progress text-status-in-progress-foreground border-status-in-progress cursor-pointer hover:bg-status-in-progress/90 shadow-sm',
  completed: 'bg-status-completed text-status-completed-foreground border-status-completed cursor-pointer hover:bg-status-completed/90 shadow-sm',
  cancelled: 'bg-status-cancelled text-status-cancelled-foreground border-status-cancelled cursor-pointer hover:bg-status-cancelled/90 shadow-sm',
};

const priorityColors = {
  Low: 'bg-priority-low text-priority-low-foreground border-priority-low cursor-pointer hover:bg-priority-low/90 shadow-sm',
  Important: 'bg-priority-important text-priority-important-foreground border-priority-important cursor-pointer hover:bg-priority-important/90 shadow-sm',
  Critical: 'bg-priority-critical text-priority-critical-foreground border-priority-critical cursor-pointer hover:bg-priority-critical/90 shadow-sm',
};

const ecoSureColors = {
  'N/A': 'bg-muted text-muted-foreground border-muted cursor-pointer hover:bg-muted/90 shadow-sm',
  'Minor': 'bg-muted text-muted-foreground border-muted cursor-pointer hover:bg-muted/90 shadow-sm',
  'Major': 'bg-muted text-muted-foreground border-muted cursor-pointer hover:bg-muted/90 shadow-sm',
  'Critical': 'bg-muted text-muted-foreground border-muted cursor-pointer hover:bg-muted/90 shadow-sm',
  'Imminent Health': 'bg-muted text-muted-foreground border-muted cursor-pointer hover:bg-muted/90 shadow-sm',
};

export function WorkOrderTable({ workOrders, onStatusChange, onEdit, onViewDetails }: WorkOrderTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Market</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ecosure</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <TableRow key={workOrder.id}>
              <TableCell className="font-medium">{workOrder.store_number}</TableCell>
              <TableCell>{workOrder.market}</TableCell>
              <TableCell className="max-w-md">
                <div className="truncate" title={workOrder.description}>
                  {workOrder.description}
                </div>
              </TableCell>
              <TableCell>{workOrder.repair_type}</TableCell>
              <TableCell>
                <Badge 
                  className={priorityColors[workOrder.priority as keyof typeof priorityColors]}
                  onClick={() => onViewDetails(workOrder)}
                  title="Click to view/edit details"
                >
                  {workOrder.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={statusColors[workOrder.status as keyof typeof statusColors]}
                  onClick={() => onViewDetails(workOrder)}
                  title="Click to view/edit details"
                >
                  {workOrder.status.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={ecoSureColors[workOrder.ecosure as keyof typeof ecoSureColors]}
                  onClick={() => onViewDetails(workOrder)}
                  title="Click to view/edit details"
                >
                  {workOrder.ecosure}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(workOrder)}
                    title="View Details"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(workOrder)}
                    title="Edit Work Order"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}