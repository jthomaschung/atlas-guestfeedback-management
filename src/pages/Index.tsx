import { useState, useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { CustomerFeedbackStats } from "@/components/feedback/CustomerFeedbackStats";
import { FeedbackFilters } from "@/components/feedback/FeedbackFilters";
import { dummyFeedback } from "@/data/dummyFeedback";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [feedbacks] = useState<CustomerFeedback[]>(dummyFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();
  const { user } = useAuth();

  // Filter and sort feedbacks
  const filteredFeedbacks = useMemo(() => {
    const filtered = feedbacks.filter(fb => {
      const matchesSearch = fb.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           fb.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           fb.case_number.includes(searchTerm) ||
                           fb.store_number.includes(searchTerm);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(fb.resolution_status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(fb.priority);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(fb.complaint_category);
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(fb.channel);
      const matchesStore = storeFilter.length === 0 || storeFilter.includes(fb.store_number);
      const matchesMarket = marketFilter.length === 0 || marketFilter.includes(fb.market);
      const matchesAssignee = assigneeFilter.length === 0 || 
                             (assigneeFilter.includes('unassigned') && (!fb.assignee || fb.assignee === 'Unassigned')) ||
                             (fb.assignee && assigneeFilter.includes(fb.assignee));
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
             matchesChannel && matchesStore && matchesMarket && matchesAssignee;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, storeFilter, marketFilter, assigneeFilter, sortOrder]);

  // Get available filter options
  const availableStores = useMemo(() => {
    const stores = [...new Set(feedbacks.map(fb => fb.store_number))];
    return stores.sort();
  }, [feedbacks]);
  
  const availableMarkets = useMemo(() => {
    const markets = [...new Set(feedbacks.map(fb => fb.market))];
    return markets.sort();
  }, [feedbacks]);

  const availableAssignees = useMemo(() => {
    const assignees = [...new Set(feedbacks.map(fb => fb.assignee).filter(Boolean))];
    return assignees.sort();
  }, [feedbacks]);

  const handleEdit = (feedback: CustomerFeedback) => {
    console.log("Edit feedback:", feedback);
    toast({
      title: "Edit Feedback",
      description: `Editing feedback from ${feedback.customer_name}`,
    });
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    console.log("View feedback details:", feedback);
    toast({
      title: "View Details",
      description: `Viewing details for case ${feedback.case_number}`,
    });
  };

  const handleDelete = (feedback: CustomerFeedback) => {
    console.log("Delete feedback:", feedback);
    toast({
      title: "Delete Feedback",
      description: `Deleted feedback case ${feedback.case_number}`,
      variant: "destructive",
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setCategoryFilter([]);
    setChannelFilter([]);
    setStoreFilter([]);
    setMarketFilter([]);
    setAssigneeFilter([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Feedback Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitor and respond to customer feedback from Yelp, Qualtrics, and Jimmy John's channels
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Response
            </Button>
          </div>
        </div>

        <CustomerFeedbackStats 
          feedbacks={filteredFeedbacks} 
        />

        <FeedbackFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          channelFilter={channelFilter}
          onChannelFilterChange={setChannelFilter}
          storeFilter={storeFilter}
          onStoreFilterChange={setStoreFilter}
          marketFilter={marketFilter}
          onMarketFilterChange={setMarketFilter}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          availableStores={availableStores}
          availableMarkets={availableMarkets}
          availableAssignees={availableAssignees}
          onClearAllFilters={handleClearAllFilters}
        />

        <CustomerFeedbackTable
          feedbacks={filteredFeedbacks}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default Index;