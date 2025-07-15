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
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  'in-progress': 'bg-blue-500/10 text-blue-700 border-blue-200',
  completed: 'bg-green-500/10 text-green-700 border-green-200',
};

const priorityColors = {
  Low: 'bg-gray-500/10 text-gray-700 border-gray-200',
  Important: 'bg-orange-500/10 text-orange-700 border-orange-200',
  Critical: 'bg-red-500/10 text-red-700 border-red-200',
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
              <TableCell>{workOrder.ecosure}</TableCell>
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