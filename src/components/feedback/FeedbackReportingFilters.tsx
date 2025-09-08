import { CustomerFeedback } from "@/types/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FeedbackReportingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (value: string[]) => void;
  categoryFilter: string[];
  onCategoryFilterChange: (value: string[]) => void;
  channelFilter: string[];
  onChannelFilterChange: (value: string[]) => void;
  storeFilter: string[];
  onStoreFilterChange: (value: string[]) => void;
  marketFilter: string[];
  onMarketFilterChange: (value: string[]) => void;
  assigneeFilter: string[];
  onAssigneeFilterChange: (value: string[]) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  dateFrom: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  onDateToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
  availableStores: string[];
  availableMarkets: string[];
  availableAssignees: string[];
  availablePeriods: Array<{ id: string; name: string; start_date: string; end_date: string }>;
}

const statusOptions = [
  { value: 'unopened', label: 'Unopened' },
  { value: 'responded', label: 'Responded' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
];

const priorityOptions = [
  { value: 'Praise', label: 'Praise' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const categoryOptions = [
  { value: 'Food Quality', label: 'Food Quality' },
  { value: 'Service Quality', label: 'Service Quality' },
  { value: 'Cleanliness', label: 'Cleanliness' },
  { value: 'Speed of Service', label: 'Speed of Service' },
  { value: 'Order Accuracy', label: 'Order Accuracy' },
  { value: 'Staff Behavior', label: 'Staff Behavior' },
  { value: 'Facility', label: 'Facility' },
  { value: 'Other', label: 'Other' },
];

const channelOptions = [
  { value: 'yelp', label: 'Yelp' },
  { value: 'qualtrics', label: 'Qualtrics' },
  { value: 'jimmy_johns', label: 'Jimmy Johns' },
];

export function FeedbackReportingFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  channelFilter,
  onChannelFilterChange,
  storeFilter,
  onStoreFilterChange,
  marketFilter,
  onMarketFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  periodFilter,
  onPeriodFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  availableStores,
  availableMarkets,
  availableAssignees,
  availablePeriods,
}: FeedbackReportingFiltersProps) {
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

  const periodOptions = [
    { value: 'all', label: 'All Periods' },
    ...(availablePeriods || []).map(period => ({ 
      value: period.id, 
      label: `${period.name} (${format(new Date(period.start_date + 'T00:00:00'), 'MMM dd, yyyy')} - ${format(new Date(period.end_date + 'T00:00:00'), 'MMM dd, yyyy')})` 
    }))
  ];

  const hasActiveFilters = 
    searchTerm !== '' ||
    statusFilter.length > 0 ||
    priorityFilter.length > 0 ||
    categoryFilter.length > 0 ||
    channelFilter.length > 0 ||
    storeFilter.length > 0 ||
    marketFilter.length > 0 ||
    assigneeFilter.length > 0 ||
    periodFilter !== 'all' ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={statusFilter.length === 1 ? statusFilter[0] : 'multiple'} 
          onValueChange={(value) => onStatusFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status">
              {statusFilter.length === 0 ? 'All Status' : 
               statusFilter.length === 1 ? statusOptions.find(opt => opt.value === statusFilter[0])?.label :
               `${statusFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={priorityFilter.length === 1 ? priorityFilter[0] : 'multiple'} 
          onValueChange={(value) => onPriorityFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority">
              {priorityFilter.length === 0 ? 'All Priorities' : 
               priorityFilter.length === 1 ? priorityOptions.find(opt => opt.value === priorityFilter[0])?.label :
               `${priorityFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Priorities</SelectItem>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={categoryFilter.length === 1 ? categoryFilter[0] : 'multiple'} 
          onValueChange={(value) => onCategoryFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category">
              {categoryFilter.length === 0 ? 'All Categories' : 
               categoryFilter.length === 1 ? categoryOptions.find(opt => opt.value === categoryFilter[0])?.label :
               `${categoryFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select 
          value={channelFilter.length === 1 ? channelFilter[0] : 'multiple'} 
          onValueChange={(value) => onChannelFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Channel">
              {channelFilter.length === 0 ? 'All Channels' : 
               channelFilter.length === 1 ? channelOptions.find(opt => opt.value === channelFilter[0])?.label :
               `${channelFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Channels</SelectItem>
            {channelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={storeFilter.length === 1 ? storeFilter[0] : 'multiple'} 
          onValueChange={(value) => onStoreFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Store">
              {storeFilter.length === 0 ? 'All Stores' : 
               storeFilter.length === 1 ? storeOptions.find(opt => opt.value === storeFilter[0])?.label :
               `${storeFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Stores</SelectItem>
            {storeOptions.slice(1).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={marketFilter.length === 1 ? marketFilter[0] : 'multiple'} 
          onValueChange={(value) => onMarketFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Market">
              {marketFilter.length === 0 ? 'All Markets' : 
               marketFilter.length === 1 ? marketOptions.find(opt => opt.value === marketFilter[0])?.label :
               `${marketFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Markets</SelectItem>
            {marketOptions.slice(1).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select 
          value={assigneeFilter.length === 1 ? assigneeFilter[0] : 'multiple'} 
          onValueChange={(value) => onAssigneeFilterChange(value === 'all' ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assignee">
              {assigneeFilter.length === 0 ? 'All Assignees' : 
               assigneeFilter.length === 1 ? assigneeOptions.find(opt => opt.value === assigneeFilter[0])?.label :
               `${assigneeFilter.length} selected`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border">
            <SelectItem value="all">All Assignees</SelectItem>
            {assigneeOptions.slice(1).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={onDateFromChange}
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
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={onDateToChange}
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