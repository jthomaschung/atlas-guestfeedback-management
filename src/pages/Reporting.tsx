import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { ReportingFilters } from "@/components/work-orders/ReportingFilters";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { isWorkOrderOverdue } from "@/lib/utils";

interface ReportingStats {
  averageCompletionTime: number;
  overdueTickets: number;
  criticalIssues: number;
  activeWorkOrders: number;
  statusDistribution: Record<WorkOrderStatus, number>;
  repairTypeDistribution: Record<string, number>;
  marketDistribution: Record<string, number>;
}

const Reporting = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dateCreatedFrom, setDateCreatedFrom] = useState<Date | undefined>();
  const [dateCreatedTo, setDateCreatedTo] = useState<Date | undefined>();
  const [dateCompletedFrom, setDateCompletedFrom] = useState<Date | undefined>();
  const [dateCompletedTo, setDateCompletedTo] = useState<Date | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canAccessWorkOrder } = useUserPermissions();

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Apply permission-based filtering
      if (!canAccessWorkOrder(wo)) return false;
      
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.store_number.includes(searchTerm) ||
                           (wo.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'open' && ['pending', 'in-progress', 'pending-approval'].includes(wo.status)) ||
                           (statusFilter === 'completed' && wo.status === 'completed');
      
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesStore = storeFilter === 'all' || wo.store_number === storeFilter;
      const matchesMarket = marketFilter === 'all' || wo.market === marketFilter;
      const matchesAssignee = assigneeFilter === 'all' || 
                             (assigneeFilter === 'unassigned' && !wo.assignee) ||
                             wo.assignee === assigneeFilter;

      // Date filters
      const createdAt = new Date(wo.created_at);
      const completedAt = wo.completed_at ? new Date(wo.completed_at) : null;
      
      const matchesCreatedFrom = !dateCreatedFrom || createdAt >= dateCreatedFrom;
      const matchesCreatedTo = !dateCreatedTo || createdAt <= dateCreatedTo;
      const matchesCompletedFrom = !dateCompletedFrom || (completedAt && completedAt >= dateCompletedFrom);
      const matchesCompletedTo = !dateCompletedTo || (completedAt && completedAt <= dateCompletedTo);

      return matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket && matchesAssignee &&
             matchesCreatedFrom && matchesCreatedTo && matchesCompletedFrom && matchesCompletedTo;
    });
  }, [workOrders, canAccessWorkOrder, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, assigneeFilter, 
      dateCreatedFrom, dateCreatedTo, dateCompletedFrom, dateCompletedTo]);

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
    setDateCreatedFrom(undefined);
    setDateCreatedTo(undefined);
    setDateCompletedFrom(undefined);
    setDateCompletedTo(undefined);
  };

  const calculateStats = (workOrdersToCalculate: WorkOrder[]): ReportingStats => {
    const total = workOrdersToCalculate.length;
    const completed = workOrdersToCalculate.filter(wo => wo.status === 'completed');
    // Active work orders should include all statuses except completed
    const active = workOrdersToCalculate.filter(wo => wo.status !== 'completed');
    const critical = workOrdersToCalculate.filter(wo => wo.priority === 'Critical');
    
    // Calculate overdue tickets
    const overdue = workOrdersToCalculate.filter(wo => 
      wo.status !== 'completed' && isWorkOrderOverdue(wo.created_at, wo.priority)
    );

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

    // Market distribution for open tickets
    const marketDistribution: Record<string, number> = {};
    const openTickets = workOrdersToCalculate.filter(wo => wo.status !== 'completed');
    openTickets.forEach(wo => {
      marketDistribution[wo.market] = (marketDistribution[wo.market] || 0) + 1;
    });

    return {
      averageCompletionTime,
      overdueTickets: overdue.length,
      criticalIssues: critical.length,
      activeWorkOrders: active.length,
      statusDistribution,
      repairTypeDistribution,
      marketDistribution
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

      <ReportingFilters 
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
        dateCreatedFrom={dateCreatedFrom}
        onDateCreatedFromChange={setDateCreatedFrom}
        dateCreatedTo={dateCreatedTo}
        onDateCreatedToChange={setDateCreatedTo}
        dateCompletedFrom={dateCompletedFrom}
        onDateCompletedFromChange={setDateCompletedFrom}
        dateCompletedTo={dateCompletedTo}
        onDateCompletedToChange={setDateCompletedTo}
        onClearFilters={clearFilters} 
        availableStores={availableStores} 
        availableMarkets={availableMarkets} 
        availableAssignees={availableAssignees}
      />

      {/* Stats Cards */}
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
            <CardTitle className="text-sm font-medium">Overdue Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueTickets}</div>
            <p className="text-xs text-muted-foreground">
              Past due date work orders
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
              All work orders except completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Stacked Vertically */}
      <div className="space-y-8">

        {/* Side by side charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Tickets by Market */}
          <Card>
            <CardHeader>
              <CardTitle>Open Tickets by Market</CardTitle>
              <CardDescription>
                Distribution of open work orders across markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Open Tickets",
                    color: "hsl(213, 94%, 68%)",
                  },
                }}
                className="h-[500px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.marketDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([market, count], index) => {
                          const colors = [
                            'hsl(213, 94%, 68%)', // Blue
                            'hsl(142, 69%, 58%)', // Green  
                            'hsl(45, 93%, 47%)',  // Orange
                            'hsl(262, 83%, 58%)', // Purple
                            'hsl(0, 84%, 60%)',   // Red
                            'hsl(173, 58%, 39%)', // Teal
                            'hsl(48, 96%, 53%)',  // Yellow
                            'hsl(280, 100%, 70%)', // Pink
                          ];
                          
                          return {
                            name: market,
                            value: count,
                            fill: colors[index % colors.length]
                          };
                        })}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {Object.entries(stats.marketDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                              <p className="font-medium text-foreground">Market: {data.name}</p>
                              <p className="text-sm text-muted-foreground">Open Tickets: {data.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Repair Types */}
          <Card>
            <CardHeader>
              <CardTitle>Top Repair Types</CardTitle>
              <CardDescription>
                Most common types of maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[500px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.repairTypeDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([repairType, count], index) => {
                          const colors = [
                            'hsl(213, 94%, 68%)', // Blue
                            'hsl(142, 69%, 58%)', // Green  
                            'hsl(45, 93%, 47%)',  // Orange
                            'hsl(262, 83%, 58%)', // Purple
                            'hsl(0, 84%, 60%)',   // Red
                            'hsl(173, 58%, 39%)', // Teal
                          ];
                          
                          // Create abbreviated names for display
                          const abbreviations: Record<string, string> = {
                            'AC / Heating': 'AC/Heat',
                            'Walk In Cooler / Freezer': 'Cooler/Freezer',
                            'Ice Machine': 'Ice Machine',
                            'Cold Tables': 'Cold Tables',
                            'Oven / Proofer': 'Oven/Proofer',
                            'Plumbing': 'Plumbing',
                            'Electrical': 'Electrical',
                            'General Maintenance': 'Gen. Maint.',
                            'Exterior Signage': 'Ext. Signage',
                            'Retarder': 'Retarder',
                            'Toasted Sandwich Oven': 'Sandwich Oven',
                            'POS / Network': 'POS/Network',
                            'Doors / Windows': 'Doors/Windows'
                          };
                          
                          const shortName = abbreviations[repairType] || 
                            (repairType.length > 10 ? repairType.substring(0, 10) + '...' : repairType);
                          
                          return {
                            name: shortName,
                            fullName: repairType,
                            value: count,
                            fill: colors[index % colors.length]
                          };
                        })}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {Object.entries(stats.repairTypeDistribution).slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                              <p className="font-medium text-foreground">{data.fullName}</p>
                              <p className="text-sm text-muted-foreground">Count: {data.value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
