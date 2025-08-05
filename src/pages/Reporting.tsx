import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
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
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.store_number.includes(searchTerm) ||
                           (wo.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesStore = storeFilter === 'all' || wo.store_number === storeFilter;
      const matchesMarket = marketFilter === 'all' || wo.market === marketFilter;
      const matchesAssignee = assigneeFilter === 'all' || 
                             (assigneeFilter === 'unassigned' && !wo.assignee) ||
                             wo.assignee === assigneeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket && matchesAssignee;
    });
  }, [workOrders, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, assigneeFilter]);

  const availableStores = useMemo(() => {
    const stores = [...new Set(workOrders.map(wo => wo.store_number))];
    return stores.sort();
  }, [workOrders]);

  const availableMarkets = useMemo(() => {
    const markets = [...new Set(workOrders.map(wo => wo.market))];
    return markets.sort();
  }, [workOrders]);

  const availableAssignees = useMemo(() => {
    const assignees = [...new Set(workOrders.map(wo => wo.assignee).filter(Boolean))];
    return assignees.sort();
  }, [workOrders]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setStoreFilter('all');
    setMarketFilter('all');
    setAssigneeFilter('all');
  };

  const calculateStats = (workOrdersToCalculate: WorkOrder[]): ReportingStats => {
    const total = workOrdersToCalculate.length;
    const completed = workOrdersToCalculate.filter(wo => wo.status === 'completed');
    const active = workOrdersToCalculate.filter(wo => wo.status === 'pending' || wo.status === 'in-progress');
    const critical = workOrdersToCalculate.filter(wo => wo.priority === 'Critical');

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
      'pending-approval': 0,
      'in-progress': 0,
      'completed': 0,
      'cancelled': 0
    };
    workOrdersToCalculate.forEach(wo => {
      statusDistribution[wo.status]++;
    });

    // Repair type distribution
    const repairTypeDistribution: Record<string, number> = {};
    workOrdersToCalculate.forEach(wo => {
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

  const stats = useMemo(() => {
    return calculateStats(filteredWorkOrders);
  }, [filteredWorkOrders]);

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

      const workOrdersData = (data || []) as WorkOrder[];
      setWorkOrders(workOrdersData);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Reporting & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View insights and analytics for work order performance
        </p>
      </div>

      <WorkOrderFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter} 
        onStatusFilterChange={setStatusFilter} 
        priorityFilter={priorityFilter} 
        onPriorityFilterChange={setPriorityFilter} 
        storeFilter={storeFilter} 
        onStoreFilterChange={setStoreFilter} 
        marketFilter={marketFilter} 
        onMarketFilterChange={setMarketFilter} 
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        onClearFilters={clearFilters} 
        availableStores={availableStores} 
        availableMarkets={availableMarkets} 
        availableAssignees={availableAssignees}
      />

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