import { useState, useMemo, useEffect } from "react";
import { WorkOrder, WorkOrderFormData, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderStats } from "@/components/work-orders/WorkOrderStats";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
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
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [deletingWorkOrder, setDeletingWorkOrder] = useState<WorkOrder | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { permissions, canAccessWorkOrder } = useUserPermissions();

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

  // Handle workOrderId query parameter from email links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const workOrderId = urlParams.get('workOrderId');
    
    if (workOrderId && workOrders.length > 0) {
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        setViewingWorkOrder(workOrder);
        // Clean up the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [workOrders]);
  
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Exclude completed work orders from dashboard
      if (wo.status === 'completed') return false;
      
      // Apply permission-based filtering
      if (!canAccessWorkOrder(wo)) return false;
      
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
  }, [workOrders, canAccessWorkOrder, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, assigneeFilter]);

  const availableStores = useMemo(() => {
    const stores = [...new Set(filteredWorkOrders.map(wo => wo.store_number))];
    return stores.sort();
  }, [filteredWorkOrders]);
  
  const availableMarkets = useMemo(() => {
    const markets = [...new Set(filteredWorkOrders.map(wo => wo.market))];
    return markets.sort();
  }, [filteredWorkOrders]);

  const availableAssignees = useMemo(() => {
    const assignees = [...new Set(filteredWorkOrders.map(wo => wo.assignee).filter(Boolean))];
    return assignees.sort();
  }, [filteredWorkOrders]);
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
      let imageUrl = null;

      // Upload image if provided
      if (formData.image) {
        const fileName = `${Date.now()}-${formData.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('work-orders')
          .upload(fileName, formData.image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Failed to upload image, but work order will be created without it.",
            variant: "destructive"
          });
        } else {
          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('work-orders')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

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
          status: 'pending',
          image_url: imageUrl
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

      // Send critical notifications for all critical work orders
      console.log('Dashboard: Checking if critical notification needed:', { priority: formData.priority, workOrderId: data.id });
      if (formData.priority === 'Critical') {
        console.log('Dashboard: Critical work order created, sending notification...');
        try {
          const result = await supabase.functions.invoke('send-notifications', {
            body: {
              type: 'critical_creation',
              workOrderId: data.id
            }
          });
          console.log('Dashboard: Critical notification result:', result);
        } catch (notificationError) {
          console.error('Dashboard: Error sending critical notification:', notificationError);
          // Don't fail the work order creation if notification fails
        }
      } else {
        console.log('Dashboard: Not a critical work order, skipping notification');
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
      let imageUrl = editingWorkOrder.image_url;

      // Upload new image if provided
      if (formData.image) {
        const fileName = `${Date.now()}-${formData.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('work-orders')
          .upload(fileName, formData.image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Failed to upload new image, keeping existing image.",
            variant: "destructive"
          });
        } else {
          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('work-orders')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('work_orders')
        .update({
          description: formData.description,
          repair_type: formData.repair_type,
          store_number: formData.store_number,
          market: formData.market,
          priority: formData.priority,
          ecosure: formData.ecosure,
          image_url: imageUrl,
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
          ? { ...wo, ...formData, image_url: imageUrl, updated_at: new Date().toISOString() }
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
  const handleViewDetails = async (workOrder: WorkOrder) => {
    setViewingWorkOrder(workOrder);
    
    // Mark work order as viewed if it hasn't been viewed yet
    if (!workOrder.viewed) {
      try {
        const { error } = await supabase
          .from('work_orders')
          .update({ viewed: true })
          .eq('id', workOrder.id);

        if (!error) {
          // Update local state
          setWorkOrders(prev => prev.map(wo => 
            wo.id === workOrder.id ? { ...wo, viewed: true } : wo
          ));
        }
      } catch (error) {
        console.error('Error marking work order as viewed:', error);
        // Don't show error to user as this is not critical
      }
    }
  };

  const handleDelete = (workOrder: WorkOrder) => {
    setDeletingWorkOrder(workOrder);
  };

  const confirmDelete = async () => {
    if (!deletingWorkOrder) return;

    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', deletingWorkOrder.id);

      if (error) throw error;

      toast({
        title: "Work order deleted",
        description: `Work order #${deletingWorkOrder.id.slice(0, 8)} has been deleted successfully.`,
      });

      // Refresh the work orders list
      await fetchWorkOrders();
    } catch (error) {
      console.error('Error deleting work order:', error);
      toast({
        title: "Error",
        description: "Failed to delete work order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingWorkOrder(null);
    }
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
      setWorkOrders(workOrders.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder as WorkOrder : wo));
      setViewingWorkOrder(updatedWorkOrder as WorkOrder);
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
    setAssigneeFilter('all');
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
    setAssigneeFilter('all');
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
              <DialogHeader>
                <DialogTitle>Create New Work Order</DialogTitle>
                <DialogDescription>Submit a new maintenance request for your store</DialogDescription>
              </DialogHeader>
              <WorkOrderForm onSubmit={handleCreateWorkOrder} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <WorkOrderStats workOrders={filteredWorkOrders} onFilterChange={handleStatsFilterChange} />

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
          </div> : <WorkOrderTable 
            workOrders={filteredWorkOrders} 
            onStatusChange={handleStatusChange} 
            onEdit={handleEdit} 
            onViewDetails={handleViewDetails}
            onDelete={handleDelete}
            isAdmin={permissions.isAdmin}
          />}

        {editingWorkOrder && <Dialog open={!!editingWorkOrder} onOpenChange={() => setEditingWorkOrder(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Work Order</DialogTitle>
                <DialogDescription>Update the work order details</DialogDescription>
              </DialogHeader>
              <WorkOrderForm onSubmit={handleEditWorkOrder} onCancel={() => setEditingWorkOrder(null)} initialData={editingWorkOrder} />
            </DialogContent>
          </Dialog>}

        {viewingWorkOrder && <WorkOrderDetails workOrder={viewingWorkOrder} onUpdate={handleUpdateWorkOrder} onClose={() => setViewingWorkOrder(null)} />}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingWorkOrder} onOpenChange={() => setDeletingWorkOrder(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this work order? This action cannot be undone.
                <br />
                <br />
                <strong>Work Order:</strong> {deletingWorkOrder?.repair_type} at Store {deletingWorkOrder?.store_number}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>;
};
export default Index;