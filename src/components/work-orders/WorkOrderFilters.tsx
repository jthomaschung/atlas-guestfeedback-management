import { WorkOrderStatus, WorkOrderPriority, RepairType } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ArrowUpDown, CalendarArrowUp, CalendarArrowDown } from "lucide-react";

interface WorkOrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: WorkOrderStatus | 'all';
  onStatusFilterChange: (value: WorkOrderStatus | 'all') => void;
  priorityFilter: WorkOrderPriority | 'all';
  onPriorityFilterChange: (value: WorkOrderPriority | 'all') => void;
  storeFilter: string;
  onStoreFilterChange: (value: string) => void;
  marketFilter: string;
  onMarketFilterChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (value: 'newest' | 'oldest') => void;
  onClearFilters: () => void;
  availableStores: string[];
  availableMarkets: string[];
  availableAssignees: string[];
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];


const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
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
  const storeOptions = [
    { value: 'all', label: 'All Stores' },
    ...(availableStores || []).map(store => ({ value: store, label: `Store ${store}` }))
  ];

  const marketOptions = [
    { value: 'all', label: 'All Markets' },
    ...(availableMarkets || []).map(market => ({ value: market, label: market }))
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...(availableAssignees || []).map(assignee => ({ value: assignee, label: assignee }))
  ];

  const hasActiveFilters = 
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    storeFilter !== 'all' ||
    marketFilter !== 'all' ||
    assigneeFilter !== 'all';

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
      
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              {statusOptions.map((option) => (
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
            <SelectContent className="bg-background border border-border">
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={storeFilter} onValueChange={onStoreFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              {storeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={marketFilter} onValueChange={onMarketFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              {marketOptions.map((option) => (
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
            <SelectContent className="bg-background border border-border">
              {assigneeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant={sortOrder === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortOrderChange('newest')}
            className="flex items-center gap-2"
          >
            <CalendarArrowDown className="h-4 w-4" />
            Newest First
          </Button>
          <Button
            variant={sortOrder === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortOrderChange('oldest')}
            className="flex items-center gap-2"
          >
            <CalendarArrowUp className="h-4 w-4" />
            Oldest First
          </Button>
        </div>
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