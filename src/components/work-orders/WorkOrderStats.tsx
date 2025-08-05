import { WorkOrder } from "@/types/work-order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface WorkOrderStatsProps {
  workOrders: WorkOrder[];
  onFilterChange: (type: 'status' | 'priority', value: string) => void;
}

export function WorkOrderStats({ workOrders, onFilterChange }: WorkOrderStatsProps) {
  const pending = workOrders.filter(wo => wo.status === 'pending').length;
  const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length;
  const pendingApproval = workOrders.filter(wo => wo.status === 'pending-approval').length;
  const totalOpenOrders = pending + inProgress + pendingApproval; // Count all open work orders (pending + in-progress + pending-approval)
  const critical = workOrders.filter(wo => wo.priority === 'Critical' && wo.status !== 'completed').length;

  const stats = [
    {
      title: 'Total Open Work Orders',
      value: totalOpenOrders,
      icon: ClipboardList,
      color: 'text-primary',
      onClick: () => onFilterChange('status', 'all'),
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-info',
      onClick: () => onFilterChange('status', 'in-progress'),
    },
    {
      title: 'Pending Approval',
      value: pendingApproval,
      icon: CheckCircle,
      color: 'text-success',
      onClick: () => onFilterChange('status', 'pending-approval'),
    },
    {
      title: 'Critical',
      value: critical,
      icon: AlertTriangle,
      color: 'text-destructive',
      onClick: () => onFilterChange('priority', 'Critical'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}