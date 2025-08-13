import { WorkOrder } from "@/types/work-order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Calendar, Eye, User, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn, isWorkOrderOverdue } from "@/lib/utils";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onEdit: (workOrder: WorkOrder) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
  onDelete?: (workOrder: WorkOrder) => void;
  isAdmin?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  'pending-approval': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const priorityColors = {
  Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  Important: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
};

const priorityIcons = {
  Low: null,
  Important: AlertTriangle,
  Critical: AlertTriangle,
};

export function WorkOrderCard({ workOrder, onEdit, onViewDetails, onDelete, isAdmin }: WorkOrderCardProps) {
  const PriorityIcon = priorityIcons[workOrder.priority as keyof typeof priorityIcons];
  const isUrgent = workOrder.priority === 'Critical';
  const isOverdue = isWorkOrderOverdue(workOrder.created_at, workOrder.priority);

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
      isUrgent && "ring-2 ring-red-200 dark:ring-red-800/50",
      workOrder.status === 'completed' && "opacity-75",
      !workOrder.viewed && "opacity-60 grayscale-[0.3]"
    )} onClick={() => onViewDetails(workOrder)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-medium">
                Store {workOrder.store_number}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {workOrder.market}
              </Badge>
              {isOverdue && workOrder.status !== 'completed' && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Overdue
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-sm text-foreground leading-tight mb-1">
              {workOrder.repair_type}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {workOrder.description}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2 sm:ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workOrder);
              }}
              title="Edit Work Order"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(workOrder);
              }}
              title="View Details"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workOrder);
                }}
                title="Delete Work Order (Admin Only)"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            <Badge 
              className={cn(
                "transition-colors whitespace-nowrap",
                statusColors[workOrder.status as keyof typeof statusColors]
              )}
            >
              {workOrder.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            
            <Badge 
              className={cn(
                "transition-colors flex items-center gap-1",
                priorityColors[workOrder.priority as keyof typeof priorityColors]
              )}
            >
              {PriorityIcon && <PriorityIcon className="h-3 w-3" />}
              {workOrder.priority}
            </Badge>
            
            {workOrder.ecosure !== 'N/A' && (
              <Badge variant="outline" className="text-xs">
                Ecosure: {workOrder.ecosure}
              </Badge>
            )}
          </div>
          
          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(workOrder.created_at), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="truncate">{formatDistanceToNow(new Date(workOrder.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-32">
                {workOrder.assignee && workOrder.assignee !== 'unassigned' 
                  ? workOrder.assignee 
                  : 'Unassigned'
                }
              </span>
            </div>
          </div>
          
          {workOrder.completed_at && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Clock className="h-3 w-3" />
              <span>Completed {format(new Date(workOrder.completed_at), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}