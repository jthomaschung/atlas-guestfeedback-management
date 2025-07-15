import { WorkOrder } from "@/types/work-order";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, MapPin, CheckCircle, Play, Pause } from "lucide-react";
import { format } from "date-fns";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onStatusChange: (id: string, status: WorkOrder['status']) => void;
  onEdit: (workOrder: WorkOrder) => void;
}

const priorityColors = {
  Low: 'bg-muted text-muted-foreground',
  Important: 'bg-warning text-warning-foreground',
  Critical: 'bg-destructive text-destructive-foreground',
};

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info text-info-foreground',
  completed: 'bg-success text-success-foreground',
};

export function WorkOrderCard({ workOrder, onStatusChange, onEdit }: WorkOrderCardProps) {
  const getStatusAction = () => {
    switch (workOrder.status) {
      case 'pending':
        return (
          <Button
            size="sm"
            onClick={() => onStatusChange(workOrder.id, 'in-progress')}
            className="h-8"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        );
      case 'in-progress':
        return (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange(workOrder.id, 'completed')}
            className="h-8"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        );
      case 'completed':
        return (
          <Badge className={statusColors.completed}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-card-foreground">{workOrder.description}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {workOrder.repair_type}
              </Badge>
              <Badge className={`text-xs ${priorityColors[workOrder.priority]}`}>
                {workOrder.priority}
              </Badge>
              <Badge className={`text-xs ${statusColors[workOrder.status]}`}>
                {workOrder.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge className={`text-xs ${workOrder.ecosure === 'N/A' ? 'bg-muted' : 'bg-warning'}`}>
                {workOrder.ecosure}
              </Badge>
            </div>
          </div>
          {getStatusAction()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>Store #{workOrder.store_number} - {workOrder.market}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(workOrder.created_at), 'MMM d')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(workOrder)}
            className="text-xs h-7"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}