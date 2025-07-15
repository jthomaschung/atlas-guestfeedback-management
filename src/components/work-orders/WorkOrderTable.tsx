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
  pending: 'bg-warning/20 text-warning-foreground border-warning/40 cursor-pointer hover:bg-warning/30 shadow-sm',
  'in-progress': 'bg-info/20 text-info-foreground border-info/40 cursor-pointer hover:bg-info/30 shadow-sm',
  completed: 'bg-success/20 text-success-foreground border-success/40 cursor-pointer hover:bg-success/30 shadow-sm',
  cancelled: 'bg-muted/20 text-muted-foreground border-muted-foreground/40 cursor-pointer hover:bg-muted/30 shadow-sm',
};

const priorityColors = {
  Low: 'bg-muted/20 text-muted-foreground border-muted-foreground/40 cursor-pointer hover:bg-muted/30 shadow-sm',
  Important: 'bg-warning/20 text-warning-foreground border-warning/40 cursor-pointer hover:bg-warning/30 shadow-sm',
  Critical: 'bg-destructive/20 text-destructive-foreground border-destructive/40 cursor-pointer hover:bg-destructive/30 shadow-sm',
};

const ecoSureColors = {
  'N/A': 'bg-muted/20 text-muted-foreground border-muted-foreground/40 cursor-pointer hover:bg-muted/30 shadow-sm',
  'Minor': 'bg-info/20 text-info-foreground border-info/40 cursor-pointer hover:bg-info/30 shadow-sm',
  'Major': 'bg-warning/20 text-warning-foreground border-warning/40 cursor-pointer hover:bg-warning/30 shadow-sm',
  'Critical': 'bg-destructive/20 text-destructive-foreground border-destructive/40 cursor-pointer hover:bg-destructive/30 shadow-sm',
  'Imminent Health': 'bg-destructive text-destructive-foreground border-destructive cursor-pointer hover:bg-destructive/90 shadow-md',
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