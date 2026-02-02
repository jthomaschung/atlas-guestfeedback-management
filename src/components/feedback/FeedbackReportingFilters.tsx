import { CustomerFeedback } from "@/types/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect, Option } from "@/components/ui/multi-select";
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
  periodFilter: string[];
  onPeriodFilterChange: (value: string[]) => void;
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
  { value: 'Bread Quality', label: 'Bread Quality' },
  { value: 'Cleanliness', label: 'Cleanliness' },
  { value: 'Closed Early', label: 'Closed Early' },
  { value: 'Order Issues', label: 'Order Issues' },
  { value: 'Other', label: 'Other' },
  { value: 'Out of Product', label: 'Out of Product' },
  { value: 'Praise', label: 'Praise' },
  { value: 'Pricing Issue', label: 'Pricing Issue' },
  { value: 'Product Issue', label: 'Product Issue' },
  { value: 'Rude Service', label: 'Rude Service' },
  { value: 'Slow Service', label: 'Slow Service' },
];

// Order Issues combines: Sandwich Made Wrong, Missing Item/Items (case-insensitive)
export const ORDER_ISSUES_CATEGORIES = ['sandwich made wrong', 'missing item', 'missing items'];

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

  const periodOptions: Option[] = (availablePeriods || []).map(period => {
    const startParts = period.start_date.split('-');
    const endParts = period.end_date.split('-');
    const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
    const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
    
    return {
      value: period.id, 
      label: `${period.name} (${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')})` 
    };
  });

  const hasActiveFilters = 
    searchTerm !== '' ||
    statusFilter.length > 0 ||
    priorityFilter.length > 0 ||
    categoryFilter.length > 0 ||
    channelFilter.length > 0 ||
    storeFilter.length > 0 ||
    marketFilter.length > 0 ||
    assigneeFilter.length > 0 ||
    periodFilter.length > 0 ||
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
        <MultiSelect
          options={periodOptions}
          selected={periodFilter}
          onChange={onPeriodFilterChange}
          placeholder="Select Periods"
        />

        <MultiSelect
          options={statusOptions}
          selected={statusFilter}
          onChange={onStatusFilterChange}
          placeholder="Select Status"
        />
        
        <MultiSelect
          options={priorityOptions}
          selected={priorityFilter}
          onChange={onPriorityFilterChange}
          placeholder="Select Priority"
        />
        
        <MultiSelect
          options={categoryOptions}
          selected={categoryFilter}
          onChange={onCategoryFilterChange}
          placeholder="Select Categories"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <MultiSelect
          options={channelOptions}
          selected={channelFilter}
          onChange={onChannelFilterChange}
          placeholder="Select Channels"
        />
        
        <MultiSelect
          options={storeOptions}
          selected={storeFilter}
          onChange={onStoreFilterChange}
          placeholder="Select Stores"
        />
        
        <MultiSelect
          options={marketOptions}
          selected={marketFilter}
          onChange={onMarketFilterChange}
          placeholder="Select Markets"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <MultiSelect
          options={assigneeOptions}
          selected={assigneeFilter}
          onChange={onAssigneeFilterChange}
          placeholder="Select Assignees"
        />

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
      
      {/* Debug info - shows filter state */}
      <div className="mt-4 p-3 bg-orange-500 text-white rounded text-xs">
        🔍 FILTER STATE: period=[{periodFilter.join(',')}] store=[{storeFilter.join(',')}]
      </div>
    </div>
  );
}