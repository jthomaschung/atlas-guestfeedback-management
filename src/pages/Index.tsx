import { useState, useMemo } from "react";
import { WorkOrder, WorkOrderFormData, WorkOrderStatus, WorkOrderPriority, RepairType } from "@/types/work-order";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderStats } from "@/components/work-orders/WorkOrderStats";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data
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
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-10').toISOString(),
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
    created_at: new Date('2024-01-12').toISOString(),
    updated_at: new Date('2024-01-12').toISOString(),
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
    created_at: new Date('2024-01-08').toISOString(),
    updated_at: new Date('2024-01-11').toISOString(),
  },
];

const Index = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  
  const { toast } = useToast();

  const availableStores = useMemo(() => {
    const stores = [...new Set(workOrders.map(wo => wo.store_number))];
    return stores.sort();
  }, [workOrders]);

  const availableMarkets = useMemo(() => {
    const markets = [...new Set(workOrders.map(wo => wo.market))];
    return markets.sort();
  }, [workOrders]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.store_number.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesStore = storeFilter === 'all' || wo.store_number === storeFilter;
      const matchesMarket = marketFilter === 'all' || wo.market === marketFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket;
    });
  }, [workOrders, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter]);

  const handleCreateWorkOrder = (formData: WorkOrderFormData) => {
    const newWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      user_id: 'current-user',
      ...formData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setWorkOrders(prev => [newWorkOrder, ...prev]);
    setIsFormOpen(false);
    
    toast({
      title: "Work order created",
      description: `Work order for ${formData.repair_type} at store ${formData.store_number} has been created.`,
    });
  };

  const handleEditWorkOrder = (formData: WorkOrderFormData) => {
    if (!editingWorkOrder) return;
    
    const updatedWorkOrder: WorkOrder = {
      ...editingWorkOrder,
      ...formData,
      updated_at: new Date().toISOString(),
    };
    
    setWorkOrders(prev => 
      prev.map(wo => wo.id === editingWorkOrder.id ? updatedWorkOrder : wo)
    );
    setEditingWorkOrder(null);
    
    toast({
      title: "Work order updated",
      description: `Work order for ${formData.repair_type} has been updated.`,
    });
  };

  const handleStatusChange = (id: string, newStatus: WorkOrderStatus) => {
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === id
          ? {
              ...wo,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : wo
      )
    );
    
    const workOrder = workOrders.find(wo => wo.id === id);
    if (workOrder) {
      toast({
        title: "Status updated",
        description: `Work order for ${workOrder.repair_type} is now ${newStatus.replace('-', ' ')}.`,
      });
    }
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
  };

  const handleViewDetails = (workOrder: WorkOrder) => {
    setViewingWorkOrder(workOrder);
  };

  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => {
    if (!viewingWorkOrder) return;
    
    const updatedWorkOrder = { ...viewingWorkOrder, ...updates };
    setWorkOrders(workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    ));
    setViewingWorkOrder(updatedWorkOrder);
    
    toast({
      title: "Work Order Updated",
      description: "Changes have been saved successfully.",
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setStoreFilter('all');
    setMarketFilter('all');
  };

  const handleStatsFilterChange = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') {
      setStatusFilter(value as WorkOrderStatus | 'all');
      // Reset other filters when clicking stats
      setPriorityFilter('all');
    } else if (type === 'priority') {
      setPriorityFilter(value as WorkOrderPriority | 'all');
      // Reset other filters when clicking stats
      setStatusFilter('all');
    }
    setSearchTerm('');
    setStoreFilter('all');
    setMarketFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Work Order Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage restaurant maintenance and tasks
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <WorkOrderForm
                onSubmit={handleCreateWorkOrder}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <WorkOrderStats workOrders={workOrders} onFilterChange={handleStatsFilterChange} />

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

        {filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No work orders found</h3>
              <p>Try adjusting your filters or create a new work order.</p>
            </div>
          </div>
        ) : (
          <WorkOrderTable
            workOrders={filteredWorkOrders}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />
        )}

        {editingWorkOrder && (
          <Dialog open={!!editingWorkOrder} onOpenChange={() => setEditingWorkOrder(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <WorkOrderForm
                onSubmit={handleEditWorkOrder}
                onCancel={() => setEditingWorkOrder(null)}
                initialData={editingWorkOrder}
              />
            </DialogContent>
          </Dialog>
        )}

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

export default Index;
