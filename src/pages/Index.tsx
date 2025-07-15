import { useState, useMemo, useEffect } from "react";
import { WorkOrder, WorkOrderFormData, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderStats } from "@/components/work-orders/WorkOrderStats";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
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
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) || wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) || wo.store_number.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesStore = storeFilter === 'all' || wo.store_number === storeFilter;
      const matchesMarket = marketFilter === 'all' || wo.market === marketFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket;
    });
  }, [workOrders, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter]);
  const handleCreateWorkOrder = async (formData: WorkOrderFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create work orders.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          user_id: user.id,
          description: formData.description,
          repair_type: formData.repair_type,
          store_number: formData.store_number,
          market: formData.market,
          priority: formData.priority,
          ecosure: formData.ecosure,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        toast({
          title: "Error",
          description: "Failed to create work order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Add the new work order to the local state
      setWorkOrders(prev => [data as WorkOrder, ...prev]);
      setIsFormOpen(false);
      toast({
        title: "Work order created",
        description: `Work order for ${formData.repair_type} at store ${formData.store_number} has been created.`
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
  const handleEditWorkOrder = async (formData: WorkOrderFormData) => {
    if (!editingWorkOrder) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          description: formData.description,
          repair_type: formData.repair_type,
          store_number: formData.store_number,
          market: formData.market,
          priority: formData.priority,
          ecosure: formData.ecosure,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingWorkOrder.id);

      if (error) {
        console.error('Error updating work order:', error);
        toast({
          title: "Error",
          description: "Failed to update work order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setWorkOrders(prev => prev.map(wo => 
        wo.id === editingWorkOrder.id 
          ? { ...wo, ...formData, updated_at: new Date().toISOString() }
          : wo
      ));
      setEditingWorkOrder(null);
      toast({
        title: "Work order updated",
        description: `Work order for ${formData.repair_type} has been updated.`
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
  const handleStatusChange = async (id: string, newStatus: WorkOrderStatus) => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating work order status:', error);
        toast({
          title: "Error",
          description: "Failed to update work order status. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setWorkOrders(prev => prev.map(wo => 
        wo.id === id 
          ? { ...wo, ...updates }
          : wo
      ));

      const workOrder = workOrders.find(wo => wo.id === id);
      if (workOrder) {
        toast({
          title: "Status updated",
          description: `Work order for ${workOrder.repair_type} is now ${newStatus.replace('-', ' ')}.`
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleEdit = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
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
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Work Order Dashboard</h1>
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
              <WorkOrderForm onSubmit={handleCreateWorkOrder} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <WorkOrderStats workOrders={workOrders} onFilterChange={handleStatsFilterChange} />

        <WorkOrderFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} priorityFilter={priorityFilter} onPriorityFilterChange={setPriorityFilter} storeFilter={storeFilter} onStoreFilterChange={setStoreFilter} marketFilter={marketFilter} onMarketFilterChange={setMarketFilter} onClearFilters={clearFilters} availableStores={availableStores} availableMarkets={availableMarkets} />

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Loading work orders...</h3>
              <p>Please wait while we fetch your data.</p>
            </div>
          </div>
        ) : filteredWorkOrders.length === 0 ? <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No work orders found</h3>
              <p>Try adjusting your filters or create a new work order.</p>
            </div>
          </div> : <WorkOrderTable workOrders={filteredWorkOrders} onStatusChange={handleStatusChange} onEdit={handleEdit} onViewDetails={handleViewDetails} />}

        {editingWorkOrder && <Dialog open={!!editingWorkOrder} onOpenChange={() => setEditingWorkOrder(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <WorkOrderForm onSubmit={handleEditWorkOrder} onCancel={() => setEditingWorkOrder(null)} initialData={editingWorkOrder} />
            </DialogContent>
          </Dialog>}

        {viewingWorkOrder && <WorkOrderDetails workOrder={viewingWorkOrder} onUpdate={handleUpdateWorkOrder} onClose={() => setViewingWorkOrder(null)} />}
      </div>
    </div>;
};
export default Index;