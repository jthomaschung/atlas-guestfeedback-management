import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Loader2 } from "lucide-react";

export default function OnHold() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [deletingWorkOrder, setDeletingWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { permissions, canAccessWorkOrder } = useUserPermissions();

  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: [] as string[],
    priorityFilter: [] as string[],
    storeFilter: [] as string[],
    marketFilter: [] as string[],
    assigneeFilter: [] as string[],
    sortOrder: 'newest' as 'newest' | 'oldest'
  });

  useEffect(() => {
    if (user) {
      fetchWorkOrders();
    }
  }, [user]);

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("status", "on-hold")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkOrders(data as WorkOrder[] || []);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch work orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = workOrders.filter(workOrder => {
      // Apply permission-based filtering
      if (!canAccessWorkOrder(workOrder)) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          workOrder.repair_type?.toLowerCase().includes(searchLower) ||
          workOrder.description?.toLowerCase().includes(searchLower) ||
          workOrder.store_number?.toLowerCase().includes(searchLower) ||
          workOrder.assignee?.toLowerCase().includes(searchLower) ||
          workOrder.market?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.statusFilter.length > 0 && !filters.statusFilter.includes(workOrder.status)) {
        return false;
      }

      // Priority filter
      if (filters.priorityFilter.length > 0 && !filters.priorityFilter.includes(workOrder.priority)) {
        return false;
      }

      // Store filter
      if (filters.storeFilter.length > 0 && !filters.storeFilter.includes(workOrder.store_number || '')) {
        return false;
      }

      // Market filter
      if (filters.marketFilter.length > 0 && !filters.marketFilter.includes(workOrder.market || '')) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeFilter.length > 0) {
        if (filters.assigneeFilter.includes('unassigned') && workOrder.assignee) {
          if (!filters.assigneeFilter.includes(workOrder.assignee)) {
            return false;
          }
        } else if (!filters.assigneeFilter.includes('unassigned') && !workOrder.assignee) {
          return false;
        } else if (workOrder.assignee && !filters.assigneeFilter.includes(workOrder.assignee) && !filters.assigneeFilter.includes('unassigned')) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return filters.sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });

    setFilteredWorkOrders(filtered);
  }, [workOrders, canAccessWorkOrder, filters]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updates = { 
        status, 
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };
      
      const { error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchWorkOrders();
      toast({
        title: "Status Updated",
        description: "Work order status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive",
      });
    }
  };

  const handleWorkOrderUpdate = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchWorkOrders();
      setSelectedWorkOrder(null);
      toast({
        title: "Work Order Updated",
        description: "Work order has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating work order:", error);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive",
      });
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

  const availableStores = [...new Set(workOrders.map(wo => wo.store_number))];
  const availableMarkets = [...new Set(workOrders.map(wo => wo.market))];
  const availableAssignees = [...new Set(workOrders.map(wo => wo.assignee).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">On Hold Work Orders</h1>
            <p className="text-muted-foreground mt-1">
              Work orders currently on hold ({filteredWorkOrders.length} of {workOrders.length})
            </p>
          </div>
        </div>

        <WorkOrderFilters 
          searchTerm={filters.searchTerm} 
          onSearchChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
          statusFilter={filters.statusFilter}
          onStatusFilterChange={(values) => setFilters(prev => ({ ...prev, statusFilter: values }))}
          priorityFilter={filters.priorityFilter}
          onPriorityFilterChange={(values) => setFilters(prev => ({ ...prev, priorityFilter: values }))}
          storeFilter={filters.storeFilter}
          onStoreFilterChange={(values) => setFilters(prev => ({ ...prev, storeFilter: values }))}
          marketFilter={filters.marketFilter}
          onMarketFilterChange={(values) => setFilters(prev => ({ ...prev, marketFilter: values }))}
          assigneeFilter={filters.assigneeFilter}
          onAssigneeFilterChange={(values) => setFilters(prev => ({ ...prev, assigneeFilter: values }))}
          sortOrder={filters.sortOrder}
          onSortOrderChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value }))}
          onClearFilters={() => setFilters({
            searchTerm: '',
            statusFilter: [],
            priorityFilter: [],
            storeFilter: [],
            marketFilter: [],
            assigneeFilter: [],
            sortOrder: 'newest'
          })}
          availableStores={availableStores} 
          availableMarkets={availableMarkets} 
          availableAssignees={availableAssignees}
        />

        {filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No work orders on hold</p>
          </div>
        ) : (
          <WorkOrderTable
            workOrders={filteredWorkOrders}
            onStatusChange={handleStatusChange}
            onEdit={(workOrder) => setSelectedWorkOrder(workOrder)}
            onViewDetails={(workOrder) => setSelectedWorkOrder(workOrder)}
            onDelete={handleDelete}
            isAdmin={permissions.isAdmin}
          />
        )}

        {selectedWorkOrder && (
          <WorkOrderDetails
            workOrder={selectedWorkOrder}
            onUpdate={(updates) => handleWorkOrderUpdate(selectedWorkOrder.id, updates)}
            onClose={() => setSelectedWorkOrder(null)}
          />
        )}

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
    </div>
  );
}