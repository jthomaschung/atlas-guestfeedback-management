import { useState, useMemo } from "react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Calendar, Clock, MapPin, User, Wrench, AlertTriangle, Eye, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Sample data - in a real app this would come from API
const sampleWorkOrders: WorkOrder[] = [
  {
    id: '1',
    user_id: 'sample-user',
    description: 'Cold table not working',
    repair_type: 'Cold Tables',
    store_number: '1955',
    market: 'AZ4',
    priority: 'Critical',
    ecosure: 'Minor',
    status: 'pending',
    assignee: 'John Smith',
    created_at: new Date('2024-02-21').toISOString(),
    updated_at: new Date('2024-02-21').toISOString()
  },
  {
    id: '2',
    user_id: 'sample-user',
    description: 'Retarder feels less cool, Ive adjusted temp',
    repair_type: 'Retarder',
    store_number: '4024',
    market: 'IE/LA',
    priority: 'Critical',
    ecosure: 'Major',
    status: 'in-progress',
    assignee: 'Sarah Johnson',
    created_at: new Date('2024-07-09').toISOString(),
    updated_at: new Date('2024-07-09').toISOString()
  },
  {
    id: '3',
    user_id: 'sample-user',
    description: 'Walk-In hovering around 50',
    repair_type: 'Walk In Cooler / Freezer',
    store_number: '3187',
    market: 'FL3',
    priority: 'Critical',
    ecosure: 'N/A',
    status: 'completed',
    assignee: 'Mike Wilson',
    completed_at: new Date('2024-01-24').toISOString(),
    created_at: new Date('2024-01-24').toISOString(),
    updated_at: new Date('2024-01-24').toISOString()
  },
  {
    id: '4',
    user_id: 'sample-user',
    description: 'AC handler on rooftop damaged side panel',
    repair_type: 'AC / Heating',
    store_number: '3612',
    market: 'FL1',
    priority: 'Critical',
    ecosure: 'Major',
    status: 'pending',
    created_at: new Date('2024-05-15').toISOString(),
    updated_at: new Date('2024-05-15').toISOString()
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

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getResponseColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Important': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-8"></TableHead>
                <TableHead className="min-w-[200px]">Repair Description</TableHead>
                <TableHead className="w-[100px]">Assigned To</TableHead>
                <TableHead className="w-[100px]">Response</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
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
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getResponseColor(workOrder.status)}`}>
                      {workOrder.status === 'pending' ? 'Pending' : 
                       workOrder.status === 'in-progress' ? 'Yes' :
                       workOrder.status === 'completed' ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(workOrder.status)}`}></div>
                      <span className="text-xs font-medium">
                        {workOrder.status === 'pending' ? 'Pending' :
                         workOrder.status === 'in-progress' ? 'In Progress' :
                         workOrder.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getPriorityColor(workOrder.priority)}`}>
                      {workOrder.priority === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                      {workOrder.priority}
                    </span>
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