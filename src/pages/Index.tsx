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
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
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
      // Find work order in all work orders, not just filtered ones
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        // Check if user has permission to access this work order
        if (canAccessWorkOrder(workOrder)) {
          setViewingWorkOrder(workOrder);
          // Clean up the URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this work order.",
            variant: "destructive"
          });
          // Clean up the URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // Work order not found, show error
        toast({
          title: "Work Order Not Found",
          description: "The requested work order could not be found.",
          variant: "destructive"
        });
        // Clean up the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [workOrders, canAccessWorkOrder, toast]);
  
  const filteredWorkOrders = useMemo(() => {
    console.log('Filtering work orders:', {
      totalWorkOrders: workOrders.length,
      permissions,
      searchTerm,
      statusFilter,
      priorityFilter,
      storeFilter,
      marketFilter,
      assigneeFilter
    });

    const filtered = workOrders.filter(wo => {
      // Exclude completed work orders from dashboard
      if (wo.status === 'completed') {
        console.log('Excluding completed work order:', wo.id);
        return false;
      }
      
      // Apply permission-based filtering
      const hasPermission = canAccessWorkOrder(wo);
      if (!hasPermission) {
        console.log('Access denied for work order:', wo.id, wo.market, wo.store_number);
        return false;
      }
      
      const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.repair_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           wo.store_number.includes(searchTerm) ||
                           (wo.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(wo.status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(wo.priority);
      const matchesStore = storeFilter.length === 0 || storeFilter.includes(wo.store_number);
      const matchesMarket = marketFilter.length === 0 || marketFilter.includes(wo.market);
      const matchesAssignee = assigneeFilter.length === 0 || 
                             (assigneeFilter.includes('unassigned') && !wo.assignee) ||
                             (wo.assignee && assigneeFilter.includes(wo.assignee));
      
      const allFiltersMatch = matchesSearch && matchesStatus && matchesPriority && matchesStore && matchesMarket && matchesAssignee;
      
      if (hasPermission && !allFiltersMatch) {
        console.log('Work order has permission but filtered out:', wo.id, {
          matchesSearch, matchesStatus, matchesPriority, matchesStore, matchesMarket, matchesAssignee
        });
      }
      
      return allFiltersMatch;
    });

    // Apply sorting by created date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    console.log('Filtered work orders count:', sorted.length);
    console.log('Final filtered work orders:', sorted.map(wo => ({ id: wo.id, market: wo.market, store: wo.store_number, status: wo.status })));
    return sorted;
  }, [workOrders, canAccessWorkOrder, permissions, searchTerm, statusFilter, priorityFilter, storeFilter, marketFilter, assigneeFilter, sortOrder]);

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
    
    // Immediately update local state to remove gray styling
    if (!workOrder.viewed) {
      setWorkOrders(prev => prev.map(wo => 
        wo.id === workOrder.id ? { ...wo, viewed: true } : wo
      ));
      
      // Update database in background
      try {
        await supabase
          .from('work_orders')
          .update({ viewed: true })
          .eq('id', workOrder.id);
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
          viewed: true,
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

      const updatedWorkOrder = { ...viewingWorkOrder, ...updates, viewed: true, updated_at: new Date().toISOString() };
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
    setStatusFilter([]);
    setPriorityFilter([]);
    setStoreFilter([]);
    setMarketFilter([]);
    setAssigneeFilter([]);
  };
  const handleStatsFilterChange = (type: 'status' | 'priority', value: string) => {
    if (type === 'status') {
      if (value === 'open') {
        // Clear status filter to show all open work orders
        setStatusFilter([]);
      } else {
        setStatusFilter([value]);
      }
      // Reset other filters when clicking stats
      setPriorityFilter([]);
    } else if (type === 'priority') {
      setPriorityFilter([value]);
      // Reset other filters when clicking stats
      setStatusFilter([]);
    }
    setSearchTerm('');
    setStoreFilter([]);
    setMarketFilter([]);
    setAssigneeFilter([]);
  };
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Work Order Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
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
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
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