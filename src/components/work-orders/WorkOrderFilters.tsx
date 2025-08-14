import { WorkOrderStatus, WorkOrderPriority, RepairType } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Search, X, ArrowUpDown, CalendarArrowUp, CalendarArrowDown } from "lucide-react";

interface WorkOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (values: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (values: string[]) => void;
  storeFilter: string[];
  onStoreFilterChange: (values: string[]) => void;
  marketFilter: string[];
  onMarketFilterChange: (values: string[]) => void;
  assigneeFilter: string[];
  onAssigneeFilterChange: (values: string[]) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (value: 'newest' | 'oldest') => void;
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
  sortOrder,
  onSortOrderChange,
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
    ...(availableAssignees || []).map(assignee => ({ value: assignee, label: assignee }))
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
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <MultiSelect
            options={statusOptions}
            selected={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Select status..."
          />
          
          <MultiSelect
            options={priorityOptions}
            selected={priorityFilter}
            onChange={onPriorityFilterChange}
            placeholder="Select priority..."
          />
          
          <MultiSelect
            options={storeOptions}
            selected={storeFilter}
            onChange={onStoreFilterChange}
            placeholder="Select stores..."
          />
          
          <MultiSelect
            options={marketOptions}
            selected={marketFilter}
            onChange={onMarketFilterChange}
            placeholder="Select markets..."
          />
          
          <MultiSelect
            options={assigneeOptions}
            selected={assigneeFilter}
            onChange={onAssigneeFilterChange}
            placeholder="Select assignees..."
          />
        </div>

        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
            <Button
              variant={sortOrder === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortOrderChange('newest')}
              className="flex items-center gap-2 justify-center sm:min-h-[44px] w-full sm:w-auto"
            >
              <CalendarArrowDown className="h-4 w-4" />
              <span className="hidden sm:inline">Newest First</span>
              <span className="sm:hidden">Newest</span>
            </Button>
            <Button
              variant={sortOrder === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortOrderChange('oldest')}
              className="flex items-center gap-2 justify-center sm:min-h-[44px] w-full sm:w-auto"
            >
              <CalendarArrowUp className="h-4 w-4" />
              <span className="hidden sm:inline">Oldest First</span>
              <span className="sm:hidden">Oldest</span>
            </Button>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground sm:min-h-[44px] w-full sm:w-auto"
            >
              <X className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}