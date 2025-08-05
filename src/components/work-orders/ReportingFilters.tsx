import { WorkOrderPriority } from "@/types/work-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'open' | 'completed';
  onStatusFilterChange: (value: 'all' | 'open' | 'completed') => void;
  priorityFilter: WorkOrderPriority | 'all';
  onPriorityFilterChange: (value: WorkOrderPriority | 'all') => void;
  storeFilter: string;
  onStoreFilterChange: (value: string) => void;
  marketFilter: string;
  onMarketFilterChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  dateCreatedFrom: Date | undefined;
  onDateCreatedFromChange: (date: Date | undefined) => void;
  dateCreatedTo: Date | undefined;
  onDateCreatedToChange: (date: Date | undefined) => void;
  dateCompletedFrom: Date | undefined;
  onDateCompletedFromChange: (date: Date | undefined) => void;
  dateCompletedTo: Date | undefined;
  onDateCompletedToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
  availableStores: string[];
  availableMarkets: string[];
  availableAssignees: string[];
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open (Pending, In-Progress, Pending Approval)' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Important', label: 'Important' },
  { value: 'Critical', label: 'Critical' },
];

export function ReportingFilters({
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
  dateCreatedFrom,
  onDateCreatedFromChange,
  dateCreatedTo,
  onDateCreatedToChange,
  dateCompletedFrom,
  onDateCompletedFromChange,
  dateCompletedTo,
  onDateCompletedToChange,
  onClearFilters,
  availableStores,
  availableMarkets,
  availableAssignees,
}: ReportingFiltersProps) {
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
    assigneeFilter !== 'all' ||
    dateCreatedFrom ||
    dateCreatedTo ||
    dateCompletedFrom ||
    dateCompletedTo;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateCreatedFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateCreatedFrom ? format(dateCreatedFrom, "PPP") : "Created from"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateCreatedFrom}
              onSelect={onDateCreatedFromChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateCreatedTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateCreatedTo ? format(dateCreatedTo, "PPP") : "Created to"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateCreatedTo}
              onSelect={onDateCreatedToChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateCompletedFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateCompletedFrom ? format(dateCompletedFrom, "PPP") : "Completed from"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateCompletedFrom}
              onSelect={onDateCompletedFromChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateCompletedTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateCompletedTo ? format(dateCompletedTo, "PPP") : "Completed to"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateCompletedTo}
              onSelect={onDateCompletedToChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
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