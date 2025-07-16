import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/work-order";
import { WorkOrderTable } from "@/components/work-orders/WorkOrderTable";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { WorkOrderDetails } from "@/components/work-orders/WorkOrderDetails";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function PendingApproval() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    repairType: "all",
    market: "all",
    priority: "all",
    assignee: "all",
  });

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("status", "pending-approval")
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
    let filtered = workOrders;

    if (filters.search) {
      filtered = filtered.filter(
        (wo) =>
          wo.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          wo.store_number.includes(filters.search) ||
          wo.repair_type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.repairType !== "all") {
      filtered = filtered.filter((wo) => wo.repair_type === filters.repairType);
    }

    if (filters.market !== "all") {
      filtered = filtered.filter((wo) => wo.market === filters.market);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter((wo) => wo.priority === filters.priority);
    }

    if (filters.assignee !== "all") {
      if (filters.assignee === "unassigned") {
        filtered = filtered.filter((wo) => !wo.assignee);
      } else {
        filtered = filtered.filter((wo) => wo.assignee === filters.assignee);
      }
    }

    setFilteredWorkOrders(filtered);
  }, [workOrders, filters]);

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

  const availableRepairTypes = [...new Set(workOrders.map(wo => wo.repair_type))];
  const availableMarkets = [...new Set(workOrders.map(wo => wo.market))];
  const availableAssignees = [...new Set(workOrders.map(wo => wo.assignee).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Approval</h1>
        <p className="text-muted-foreground">
          Work orders awaiting approval ({filteredWorkOrders.length} of {workOrders.length})
        </p>
      </div>

      <WorkOrderFilters
        searchTerm={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        statusFilter="all"
        onStatusFilterChange={() => {}}
        priorityFilter={filters.priority as any}
        onPriorityFilterChange={(value) => setFilters(prev => ({ ...prev, priority: value as string }))}
        storeFilter="all"
        onStoreFilterChange={() => {}}
        marketFilter={filters.market}
        onMarketFilterChange={(value) => setFilters(prev => ({ ...prev, market: value }))}
        assigneeFilter={filters.assignee}
        onAssigneeFilterChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}
        onClearFilters={() => setFilters({ search: "", repairType: "all", market: "all", priority: "all", assignee: "all" })}
        availableStores={[...new Set(workOrders.map(wo => wo.store_number))]}
        availableMarkets={availableMarkets}
        availableAssignees={availableAssignees}
      />

      {filteredWorkOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No work orders pending approval</p>
        </div>
      ) : (
        <WorkOrderTable
          workOrders={filteredWorkOrders}
          onStatusChange={handleStatusChange}
          onEdit={(workOrder) => setSelectedWorkOrder(workOrder)}
          onViewDetails={(workOrder) => setSelectedWorkOrder(workOrder)}
        />
      )}

      {selectedWorkOrder && (
        <WorkOrderDetails
          workOrder={selectedWorkOrder}
          onUpdate={(updates) => handleWorkOrderUpdate(selectedWorkOrder.id, updates)}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </div>
  );
}