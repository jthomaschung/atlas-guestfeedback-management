import { WorkOrder } from "@/types/work-order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface WorkOrderStatsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderStats({ workOrders }: WorkOrderStatsProps) {
  const totalOrders = workOrders.length;
  const pending = workOrders.filter(wo => wo.status === 'pending').length;
  const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completed = workOrders.filter(wo => wo.status === 'completed').length;
  const overdue = workOrders.filter(wo => 
    wo.dueDate < new Date() && wo.status !== 'completed'
  ).length;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ClipboardList,
      color: 'text-primary',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-info',
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
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