import { useState, useMemo } from "react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Calendar, Clock, MapPin, User, Wrench, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Sample data - in a real app this would come from API
const sampleWorkOrders: WorkOrder[] = [
  {
    id: '1',
    user_id: 'sample-user',
    description: 'The ice machine in the bar area is not producing ice. Needs immediate attention as it affects drink service.',
    repair_type: 'Ice Machine',
    store_number: '001',
    market: 'AZ1',
    priority: 'Critical',
    ecosure: 'Minor',
    status: 'pending',
    assignee: 'John Smith',
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString()
  },
  {
    id: '2',
    user_id: 'sample-user',
    description: 'Walk-in freezer door seal is damaged and not maintaining proper temperature.',
    repair_type: 'Walk In Cooler / Freezer',
    store_number: '045',
    market: 'FL1',
    priority: 'Important',
    ecosure: 'Major',
    status: 'in-progress',
    assignee: 'Sarah Johnson',
    created_at: new Date('2024-01-12').toISOString(),
    updated_at: new Date('2024-01-12').toISOString()
  },
  {
    id: '3',
    user_id: 'sample-user',
    description: 'General maintenance needed for dining area equipment.',
    repair_type: 'General Maintenance',
    store_number: '023',
    market: 'OC',
    priority: 'Low',
    ecosure: 'N/A',
    status: 'completed',
    completed_at: new Date('2024-01-11').toISOString(),
    created_at: new Date('2024-01-08').toISOString(),
    updated_at: new Date('2024-01-11').toISOString()
  },
];

type SortField = 'created_at' | 'priority' | 'status' | 'store_number' | 'repair_type';
type SortDirection = 'asc' | 'desc';

const priorityOrder: Record<WorkOrderPriority, number> = {
  'Critical': 3,
  'Important': 2,
  'Low': 1
};

const statusOrder: Record<WorkOrderStatus, number> = {
  'pending': 1,
  'in-progress': 2,
  'completed': 3,
  'cancelled': 4
};

const WorkOrderTracking = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();

  const availableStores = useMemo(() => {
    const stores = [...new Set(workOrders.map(wo => wo.store_number))];
    return stores.sort();
  }, [workOrders]);

  const availableMarkets = useMemo(() => {
    const markets = [...new Set(workOrders.map(wo => wo.market))];
    return markets.sort();
  }, [workOrders]);

  const filteredAndSortedWorkOrders = useMemo(() => {
    let filtered = workOrders.filter(wo => {
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          wo.store_number.includes(searchTerm) ||
                          (wo.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesStore = storeFilter === 'all' || wo.store_number === storeFilter;
      const matchesMarket = marketFilter === 'all' || wo.market === marketFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket;
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
  }, [workOrders, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, sortField, sortDirection]);

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
  };

  const handleViewDetails = (workOrder: WorkOrder) => {
    setViewingWorkOrder(workOrder);
  };

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => {
    if (!viewingWorkOrder) return;
    const updatedWorkOrder = {
      ...viewingWorkOrder,
      ...updates
    };
    setWorkOrders(workOrders.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo));
    setViewingWorkOrder(updatedWorkOrder);
    toast({
      title: "Work Order Updated",
      description: "Changes have been saved successfully."
    });
  };

  const getStatusBadgeVariant = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'Important': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
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
          onClearFilters={clearFilters}
          availableStores={availableStores}
          availableMarkets={availableMarkets}
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

        <div className="space-y-3">
          {filteredAndSortedWorkOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No work orders found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            filteredAndSortedWorkOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(workOrder)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                        {workOrder.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
                        {workOrder.priority === 'Critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {workOrder.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        {workOrder.repair_type}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Store {workOrder.store_number} - {workOrder.market}
                      </span>
                    </div>
                    
                    <p className="text-foreground font-medium">{workOrder.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(workOrder.created_at)}
                      </span>
                      {workOrder.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {workOrder.assignee}
                        </span>
                      )}
                      {workOrder.completed_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Completed: {formatDate(workOrder.completed_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
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