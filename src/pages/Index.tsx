import { useState, useMemo } from "react";
import { WorkOrder, WorkOrderFormData, WorkOrderStatus, WorkOrderCategory, WorkOrderPriority } from "@/types/work-order";
import { WorkOrderCard } from "@/components/work-orders/WorkOrderCard";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderStats } from "@/components/work-orders/WorkOrderStats";
import { WorkOrderFilters } from "@/components/work-orders/WorkOrderFilters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data
const sampleWorkOrders: WorkOrder[] = [
  {
    id: '1',
    title: 'Fix broken ice machine',
    description: 'The ice machine in the bar area is not producing ice. Needs immediate attention as it affects drink service.',
    category: 'equipment',
    priority: 'urgent',
    status: 'pending',
    assignedTo: 'John Smith',
    createdBy: 'Manager',
    createdAt: new Date('2024-01-10'),
    dueDate: new Date('2024-01-15'),
    location: 'Bar Area',
    estimatedHours: 2,
  },
  {
    id: '2',
    title: 'Deep clean fryer',
    description: 'Weekly deep cleaning of the main fryer unit including oil change and filter replacement.',
    category: 'cleaning',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Maria Garcia',
    createdBy: 'Head Chef',
    createdAt: new Date('2024-01-12'),
    dueDate: new Date('2024-01-18'),
    location: 'Kitchen',
    estimatedHours: 3,
  },
  {
    id: '3',
    title: 'Replace dining room light bulbs',
    description: 'Several light bulbs in the main dining area need replacement. Check all fixtures.',
    category: 'maintenance',
    priority: 'low',
    status: 'completed',
    assignedTo: 'David Chen',
    createdBy: 'Floor Manager',
    createdAt: new Date('2024-01-08'),
    dueDate: new Date('2024-01-12'),
    completedAt: new Date('2024-01-11'),
    location: 'Dining Room',
    estimatedHours: 1,
  },
  {
    id: '4',
    title: 'Repair freezer door seal',
    description: 'Walk-in freezer door seal is damaged and not maintaining proper temperature.',
    category: 'equipment',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Sarah Johnson',
    createdBy: 'Kitchen Manager',
    createdAt: new Date('2024-01-13'),
    dueDate: new Date('2024-01-14'),
    location: 'Kitchen Storage',
    estimatedHours: 1.5,
  },
  {
    id: '5',
    title: 'Restock cleaning supplies',
    description: 'Running low on sanitizer, paper towels, and cleaning chemicals for the kitchen.',
    category: 'supplies',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Mike Williams',
    createdBy: 'Assistant Manager',
    createdAt: new Date('2024-01-13'),
    dueDate: new Date('2024-01-16'),
    location: 'Storage Room',
    estimatedHours: 0.5,
  },
];

const Index = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(sampleWorkOrders);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<WorkOrderCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('All Assignees');
  
  const { toast } = useToast();

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || wo.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'All Assignees' || wo.assignedTo === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssignee;
    });
  }, [workOrders, searchTerm, statusFilter, categoryFilter, priorityFilter, assigneeFilter]);

  const handleCreateWorkOrder = (formData: WorkOrderFormData) => {
    const newWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdBy: 'Current User',
      createdAt: new Date(),
    };
    
    setWorkOrders(prev => [newWorkOrder, ...prev]);
    setIsFormOpen(false);
    
    toast({
      title: "Work order created",
      description: `"${formData.title}" has been created and assigned to ${formData.assignedTo}.`,
    });
  };

  const handleEditWorkOrder = (formData: WorkOrderFormData) => {
    if (!editingWorkOrder) return;
    
    const updatedWorkOrder: WorkOrder = {
      ...editingWorkOrder,
      ...formData,
    };
    
    setWorkOrders(prev => 
      prev.map(wo => wo.id === editingWorkOrder.id ? updatedWorkOrder : wo)
    );
    setEditingWorkOrder(null);
    
    toast({
      title: "Work order updated",
      description: `"${formData.title}" has been updated.`,
    });
  };

  const handleStatusChange = (id: string, newStatus: WorkOrderStatus) => {
    setWorkOrders(prev =>
      prev.map(wo =>
        wo.id === id
          ? {
              ...wo,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date() : undefined,
            }
          : wo
      )
    );
    
    const workOrder = workOrders.find(wo => wo.id === id);
    if (workOrder) {
      toast({
        title: "Status updated",
        description: `"${workOrder.title}" is now ${newStatus.replace('-', ' ')}.`,
      });
    }
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('All Assignees');
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

        <WorkOrderStats workOrders={workOrders} />

        <WorkOrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          onClearFilters={clearFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkOrders.map(workOrder => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
            />
          ))}
          
          {filteredWorkOrders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No work orders found</h3>
                <p>Try adjusting your filters or create a new work order.</p>
              </div>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default Index;
