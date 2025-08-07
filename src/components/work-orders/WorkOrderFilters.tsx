import { WorkOrderStatus, WorkOrderPriority, RepairType } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Search, X } from "lucide-react";

interface WorkOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (value: string[]) => void;
  storeFilter: string[];
  onStoreFilterChange: (value: string[]) => void;
  marketFilter: string[];
  onMarketFilterChange: (value: string[]) => void;
  assigneeFilter: string[];
  onAssigneeFilterChange: (value: string[]) => void;
  onClearFilters: () => void;
  availableStores: string[];
  availableMarkets: string[];
  availableAssignees: string[];
}

const statusOptions: Option[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: Option[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Important', label: 'Important' },
  { value: 'Critical', label: 'Critical' },
];

export function WorkOrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  storeFilter,
  onStoreFilterChange,
  marketFilter,
  onMarketFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  onClearFilters,
  availableStores,
  availableMarkets,
  availableAssignees,
}: WorkOrderFiltersProps) {
  const storeOptions: Option[] = (availableStores || []).map(store => ({ 
    value: store, 
    label: `Store ${store}` 
  }));

  const marketOptions: Option[] = (availableMarkets || []).map(market => ({ 
    value: market, 
    label: market 
  }));

  const assigneeOptions: Option[] = [
    { value: 'unassigned', label: 'Unassigned' },
    ...(availableAssignees || []).map(assignee => ({ 
      value: assignee, 
      label: assignee 
    }))
  ];

  const hasActiveFilters = 
    searchTerm !== '' ||
    statusFilter.length > 0 ||
    priorityFilter.length > 0 ||
    storeFilter.length > 0 ||
    marketFilter.length > 0 ||
    assigneeFilter.length > 0;

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MultiSelect
          options={statusOptions}
          selected={statusFilter}
          onChange={onStatusFilterChange}
          placeholder="All Status"
        />
        
        <MultiSelect
          options={priorityOptions}
          selected={priorityFilter}
          onChange={onPriorityFilterChange}
          placeholder="All Priorities"
        />
        
        <MultiSelect
          options={storeOptions}
          selected={storeFilter}
          onChange={onStoreFilterChange}
          placeholder="All Stores"
        />
        
        <MultiSelect
          options={marketOptions}
          selected={marketFilter}
          onChange={onMarketFilterChange}
          placeholder="All Markets"
        />
        
        <MultiSelect
          options={assigneeOptions}
          selected={assigneeFilter}
          onChange={onAssigneeFilterChange}
          placeholder="All Assignees"
        />
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