import { useState } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface FeedbackFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (statuses: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (priorities: string[]) => void;
  categoryFilter: string[];
  onCategoryFilterChange: (categories: string[]) => void;
  channelFilter: string[];
  onChannelFilterChange: (channels: string[]) => void;
  storeFilter: string[];
  onStoreFilterChange: (stores: string[]) => void;
  marketFilter: string[];
  onMarketFilterChange: (markets: string[]) => void;
  assigneeFilter: string[];
  onAssigneeFilterChange: (assignees: string[]) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
  availableStores: string[];
  availableMarkets: string[];
  availableAssignees: string[];
  onClearAllFilters: () => void;
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
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const categoryOptions = [
  { value: 'Sandwich Made wrong', label: 'Sandwich Made wrong' },
  { value: 'Slow Service', label: 'Slow Service' },
  { value: 'Rude Service', label: 'Rude Service' },
  { value: 'Product issue', label: 'Product issue' },
  { value: 'Closed Early', label: 'Closed Early' },
  { value: 'Praise', label: 'Praise' },
  { value: 'Missing Item', label: 'Missing Item' },
  { value: 'Credit Card Issue', label: 'Credit Card Issue' },
  { value: 'Bread Quality', label: 'Bread Quality' },
  { value: 'Out of product', label: 'Out of product' },
  { value: 'Other', label: 'Other' },
  { value: 'Cleanliness', label: 'Cleanliness' },
  { value: 'Possible Food Poisoning', label: 'Possible Food Poisoning' },
  { value: 'Loyalty Program Issues', label: 'Loyalty Program Issues' }
];

const channelOptions = [
  { value: 'yelp', label: 'Yelp' },
  { value: 'qualtrics', label: 'Qualtrics' },
  { value: 'jimmy_johns', label: "Jimmy John's" },
];

export function FeedbackFilters({
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
  sortOrder,
  onSortOrderChange,
  availableStores,
  availableMarkets,
  availableAssignees,
  onClearAllFilters,
}: FeedbackFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = statusFilter.length + priorityFilter.length + categoryFilter.length + 
    channelFilter.length + storeFilter.length + marketFilter.length + assigneeFilter.length;

  const handleStatusChange = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (priorityFilter.includes(priority)) {
      onPriorityFilterChange(priorityFilter.filter(p => p !== priority));
    } else {
      onPriorityFilterChange([...priorityFilter, priority]);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (categoryFilter.includes(category)) {
      onCategoryFilterChange(categoryFilter.filter(c => c !== category));
    } else {
      onCategoryFilterChange([...categoryFilter, category]);
    }
  };

  const handleChannelChange = (channel: string) => {
    if (channelFilter.includes(channel)) {
      onChannelFilterChange(channelFilter.filter(c => c !== channel));
    } else {
      onChannelFilterChange([...channelFilter, channel]);
    }
  };

  const handleStoreChange = (store: string) => {
    if (storeFilter.includes(store)) {
      onStoreFilterChange(storeFilter.filter(s => s !== store));
    } else {
      onStoreFilterChange([...storeFilter, store]);
    }
  };

  const handleMarketChange = (market: string) => {
    if (marketFilter.includes(market)) {
      onMarketFilterChange(marketFilter.filter(m => m !== market));
    } else {
      onMarketFilterChange([...marketFilter, market]);
    }
  };

  const handleAssigneeChange = (assignee: string) => {
    if (assigneeFilter.includes(assignee)) {
      onAssigneeFilterChange(assigneeFilter.filter(a => a !== assignee));
    } else {
      onAssigneeFilterChange([...assigneeFilter, assignee]);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Search and Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search feedback, customer name, case number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Sort Order */}
      <div className="flex gap-2">
        <Button
          variant={sortOrder === 'newest' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortOrderChange('newest')}
        >
          Newest First
        </Button>
        <Button
          variant={sortOrder === 'oldest' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortOrderChange('oldest')}
        >
          Oldest First
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Status
                {statusFilter.length > 0 && (
                  <Badge variant="secondary">{statusFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50">
              <DropdownMenuLabel>Resolution Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilter.includes(option.value)}
                  onCheckedChange={() => handleStatusChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Priority
                {priorityFilter.length > 0 && (
                  <Badge variant="secondary">{priorityFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50">
              <DropdownMenuLabel>Priority Level</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {priorityOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={priorityFilter.includes(option.value)}
                  onCheckedChange={() => handlePriorityChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Category
                {categoryFilter.length > 0 && (
                  <Badge variant="secondary">{categoryFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50">
              <DropdownMenuLabel>Feedback Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categoryOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={categoryFilter.includes(option.value)}
                  onCheckedChange={() => handleCategoryChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Channel Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Channel
                {channelFilter.length > 0 && (
                  <Badge variant="secondary">{channelFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50">
              <DropdownMenuLabel>Feedback Channel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {channelOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={channelFilter.includes(option.value)}
                  onCheckedChange={() => handleChannelChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Store Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Store
                {storeFilter.length > 0 && (
                  <Badge variant="secondary">{storeFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50 max-h-60 overflow-y-auto">
              <DropdownMenuLabel>Store Number</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableStores.map((store) => (
                <DropdownMenuCheckboxItem
                  key={store}
                  checked={storeFilter.includes(store)}
                  onCheckedChange={() => handleStoreChange(store)}
                >
                  Store {store}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Market Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Market
                {marketFilter.length > 0 && (
                  <Badge variant="secondary">{marketFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50">
              <DropdownMenuLabel>Market</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableMarkets.map((market) => (
                <DropdownMenuCheckboxItem
                  key={market}
                  checked={marketFilter.includes(market)}
                  onCheckedChange={() => handleMarketChange(market)}
                >
                  {market}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assignee Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-background">
                Assignee
                {assigneeFilter.length > 0 && (
                  <Badge variant="secondary">{assigneeFilter.length}</Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background z-50 max-h-60 overflow-y-auto">
              <DropdownMenuLabel>Assigned To</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={assigneeFilter.includes('unassigned')}
                onCheckedChange={() => handleAssigneeChange('unassigned')}
              >
                Unassigned
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {availableAssignees.map((assignee) => (
                <DropdownMenuCheckboxItem
                  key={assignee}
                  checked={assigneeFilter.includes(assignee)}
                  onCheckedChange={() => handleAssigneeChange(assignee)}
                >
                  {assignee}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}