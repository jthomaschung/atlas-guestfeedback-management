import { WorkOrder, WorkOrderStatus } from "@/types/work-order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Calendar } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onStatusChange: (id: string, status: WorkOrderStatus) => void;
  onEdit: (workOrder: WorkOrder) => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning-foreground border-warning/20',
  'in-progress': 'bg-info/10 text-info-foreground border-info/20',
  completed: 'bg-success/10 text-success-foreground border-success/20',
};

const priorityColors = {
  Low: 'bg-muted text-muted-foreground border-muted-foreground/20',
  Important: 'bg-warning/10 text-warning-foreground border-warning/20',
  Critical: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
};

const ecoSureColors = {
  'N/A': 'bg-muted text-muted-foreground border-muted-foreground/20',
  'Minor': 'bg-info/10 text-info-foreground border-info/20',
  'Major': 'bg-warning/10 text-warning-foreground border-warning/20',
  'Critical': 'bg-destructive/10 text-destructive-foreground border-destructive/20',
  'Imminent Health': 'bg-destructive text-destructive-foreground border-destructive',
};

export function WorkOrderTable({ workOrders, onStatusChange, onEdit }: WorkOrderTableProps) {
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
                <Badge className={priorityColors[workOrder.priority as keyof typeof priorityColors]}>
                  {workOrder.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[workOrder.status as keyof typeof statusColors]}>
                  {workOrder.status.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={ecoSureColors[workOrder.ecosure as keyof typeof ecoSureColors]}>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(workOrder)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}