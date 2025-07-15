import { WorkOrderStatus, WorkOrderPriority, RepairType } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface WorkOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: WorkOrderStatus | 'all';
  onStatusFilterChange: (value: WorkOrderStatus | 'all') => void;
  categoryFilter: RepairType | 'all';
  onCategoryFilterChange: (value: RepairType | 'all') => void;
  priorityFilter: WorkOrderPriority | 'all';
  onPriorityFilterChange: (value: WorkOrderPriority | 'all') => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'AC / Heating', label: 'AC / Heating' },
  { value: 'Walk In Cooler / Freezer', label: 'Walk In Cooler / Freezer' },
  { value: 'Ice Machine', label: 'Ice Machine' },
  { value: 'Cold Tables', label: 'Cold Tables' },
  { value: 'Oven / Proofer', label: 'Oven / Proofer' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'General Maintenance', label: 'General Maintenance' },
  { value: 'Exterior Signage', label: 'Exterior Signage' },
  { value: 'Retarder', label: 'Retarder' },
  { value: 'Toasted Sandwich Oven', label: 'Toasted Sandwich Oven' },
  { value: 'POS / Network', label: 'POS / Network' },
  { value: 'Doors / Windows', label: 'Doors / Windows' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Important', label: 'Important' },
  { value: 'Critical', label: 'Critical' },
];

const staffMembers = [
  'All Assignees',
  'John Smith',
  'Maria Garcia',
  'David Chen',
  'Sarah Johnson',
  'Mike Williams',
  'Lisa Brown',
];

export function WorkOrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  onClearFilters,
}: WorkOrderFiltersProps) {
  const hasActiveFilters = 
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'All Assignees';

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search work orders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((staff) => (
              <SelectItem key={staff} value={staff}>
                {staff}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}