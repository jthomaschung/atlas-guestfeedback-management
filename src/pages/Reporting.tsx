import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportingStats {
  averageCompletionTime: number;
  completionRate: number;
  criticalIssues: number;
  activeWorkOrders: number;
  statusDistribution: Record<WorkOrderStatus, number>;
  repairTypeDistribution: Record<string, number>;
}

const Reporting = () => {
  const [stats, setStats] = useState<ReportingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateStats = (workOrders: WorkOrder[]): ReportingStats => {
    const total = workOrders.length;
    const completed = workOrders.filter(wo => wo.status === 'completed');
    const active = workOrders.filter(wo => wo.status === 'pending' || wo.status === 'in-progress');
    const critical = workOrders.filter(wo => wo.priority === 'Critical');

    // Calculate average completion time
    const completionTimes = completed
      .filter(wo => wo.completed_at)
      .map(wo => {
        const created = new Date(wo.created_at);
        const completed = new Date(wo.completed_at!);
        return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      });
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;

    // Calculate completion rate
    const completionRate = total > 0 ? (completed.length / total) * 100 : 0;

    // Status distribution
    const statusDistribution: Record<WorkOrderStatus, number> = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
      'cancelled': 0
    };
    workOrders.forEach(wo => {
      statusDistribution[wo.status]++;
    });

    // Repair type distribution
    const repairTypeDistribution: Record<string, number> = {};
    workOrders.forEach(wo => {
      repairTypeDistribution[wo.repair_type] = (repairTypeDistribution[wo.repair_type] || 0) + 1;
    });

    return {
      averageCompletionTime,
      completionRate,
      criticalIssues: critical.length,
      activeWorkOrders: active.length,
      statusDistribution,
      repairTypeDistribution
    };
  };

  const fetchReportingData = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*');

      if (error) {
        console.error('Error fetching work orders for reporting:', error);
        toast({
          title: "Error",
          description: "Failed to load reporting data. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }

      const workOrders = (data || []) as WorkOrder[];
      const calculatedStats = calculateStats(workOrders);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReportingData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reporting data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load reporting data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Reporting & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View insights and analytics for work order performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCompletionTime > 0 ? `${stats.averageCompletionTime.toFixed(1)} days` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.statusDistribution.completed} of {Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)} orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              High priority work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pending + In Progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Status</CardTitle>
            <CardDescription>
              Distribution of work orders across different statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) > 0 
                          ? (stats.statusDistribution.pending / Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{stats.statusDistribution.pending}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) > 0 
                          ? (stats.statusDistribution['in-progress'] / Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{stats.statusDistribution['in-progress']}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) > 0 
                          ? (stats.statusDistribution.completed / Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{stats.statusDistribution.completed}</span>
                </div>
              </div>
              {stats.statusDistribution.cancelled > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) > 0 
                            ? (stats.statusDistribution.cancelled / Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0)) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{stats.statusDistribution.cancelled}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Repair Types</CardTitle>
            <CardDescription>
              Most common types of maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.repairTypeDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([repairType, count]) => (
                  <div key={repairType} className="flex items-center justify-between">
                    <span className="text-sm">{repairType}</span>
                    <span className="text-sm text-muted-foreground">{count} requests</span>
                  </div>
                ))}
              {Object.keys(stats.repairTypeDistribution).length === 0 && (
                <p className="text-sm text-muted-foreground">No repair types available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reporting;