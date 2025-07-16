import { useState, useMemo, useEffect } from "react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Calendar, Clock, MapPin, User, Wrench, AlertTriangle, Eye, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type SortField = 'created_at' | 'priority' | 'status' | 'store_number' | 'repair_type';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<WorkOrderPriority, number> = {
  'Critical': 3,
  'Important': 2,
  'Low': 1
};

const statusOrder: Record<WorkOrderStatus, number> = {
  'pending': 1,
  'pending-approval': 2,
  'in-progress': 3,
  'completed': 4,
  'cancelled': 5
};

const WorkOrderTracking = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch work orders from Supabase
  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders:', error);
        toast({
          title: "Error",
          description: "Failed to load work orders. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }

      setWorkOrders((data || []) as WorkOrder[]);
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
      fetchWorkOrders();
    }
  }, [user]);

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

  const filteredAndSortedWorkOrders = useMemo(() => {
    let filtered = workOrders.filter(wo => {
      // Exclude completed work orders from tracking
      if (wo.status === 'completed') return false;
      
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

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'priority':
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'store_number':
          aValue = a.store_number;
          bValue = b.store_number;
          break;
        case 'repair_type':
          aValue = a.repair_type;
          bValue = b.repair_type;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [workOrders, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, assigneeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setStoreFilter('all');
    setMarketFilter('all');
    setAssigneeFilter('all');
  };

  const handleViewDetails = (workOrder: WorkOrder) => {
    setViewingWorkOrder(workOrder);
  };

  const handleUpdateWorkOrder = async (updates: Partial<WorkOrder>) => {
    if (!viewingWorkOrder) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', viewingWorkOrder.id);

      if (error) {
        console.error('Error updating work order:', error);
        toast({
          title: "Error",
          description: "Failed to update work order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const updatedWorkOrder = { ...viewingWorkOrder, ...updates, updated_at: new Date().toISOString() };
      setWorkOrders(workOrders.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo));
      setViewingWorkOrder(updatedWorkOrder);
      toast({
        title: "Work Order Updated",
        description: "Changes have been saved successfully."
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    const priorityColors = {
      Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
      Important: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Work Order Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and track all work orders with advanced filtering and sorting
            </p>
          </div>
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedWorkOrders.length} of {workOrders.length} work orders
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="store_number">Store Number</SelectItem>
                <SelectItem value="repair_type">Repair Type</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortDirection === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                <h3 className="text-lg font-medium mb-2">Loading work orders...</h3>
                <p>Please wait while we fetch your data.</p>
              </div>
            </div>
          ) : filteredAndSortedWorkOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No work orders found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[200px]">Repair Description</TableHead>
                <TableHead className="w-[100px]">Assigned To</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[80px]">Priority</TableHead>
                <TableHead className="w-[100px]">Repair Type</TableHead>
                <TableHead className="w-[120px]">Date Submitted</TableHead>
                <TableHead className="w-[80px]">Store #</TableHead>
                <TableHead className="w-[80px]">Market</TableHead>
                <TableHead className="w-[100px]">Date Closed</TableHead>
                <TableHead className="w-[40px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedWorkOrders.map((workOrder) => (
                <TableRow key={workOrder.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {workOrder.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {workOrder.assignee ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {workOrder.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status === 'pending' ? 'Pending' :
                       workOrder.status === 'in-progress' ? 'In Progress' :
                       workOrder.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`flex items-center gap-1 ${getPriorityColor(workOrder.priority)}`}>
                      {workOrder.priority === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                      {workOrder.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {workOrder.repair_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(workOrder.created_at)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {workOrder.store_number}
                  </TableCell>
                  <TableCell className="text-center">
                    {workOrder.market}
                  </TableCell>
                  <TableCell className="text-xs">
                    {workOrder.completed_at ? formatDate(workOrder.completed_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(workOrder)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          )}
        </div>

        {viewingWorkOrder && (
          <WorkOrderDetails
            workOrder={viewingWorkOrder}
            onUpdate={handleUpdateWorkOrder}
            onClose={() => setViewingWorkOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkOrderTracking;