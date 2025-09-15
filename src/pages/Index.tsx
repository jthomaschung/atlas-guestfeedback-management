import { useState, useMemo, useEffect } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { CustomerFeedbackStats } from "@/components/feedback/CustomerFeedbackStats";
import { FeedbackReportingFilters } from "@/components/feedback/FeedbackReportingFilters";
import { FeedbackDetailsDialog } from "@/components/feedback/FeedbackDetailsDialog";
import { ComplaintTrendsChart } from "@/components/feedback/ComplaintTrendsChart";
import { CategoryBreakdownChart } from "@/components/feedback/CategoryBreakdownChart";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [periods, setPeriods] = useState<Array<{ id: string; name: string; start_date: string; end_date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();
  const authContext = useAuth();
  const { user, profile } = authContext || { user: null, profile: null };
  const { permissions } = useUserPermissions();

  useEffect(() => {
    fetchFeedbacks();
    fetchPeriods();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customer feedback"
        });
        return;
      }

      // Map database records to CustomerFeedback interface
      const mappedFeedbacks: CustomerFeedback[] = (data || []).map(item => ({
        id: item.id,
        feedback_date: item.feedback_date,
        complaint_category: item.complaint_category as CustomerFeedback['complaint_category'],
        channel: item.channel as CustomerFeedback['channel'],
        rating: item.rating,
        resolution_status: (item.resolution_status || 'unopened') as CustomerFeedback['resolution_status'],
        resolution_notes: item.resolution_notes,
        store_number: item.store_number,
        market: item.market,
        case_number: item.case_number,
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        feedback_text: item.feedback_text,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Set default values for fields that might be missing
        priority: (item.priority || 'Low') as CustomerFeedback['priority'],
        assignee: item.assignee || 'Unassigned',
        viewed: item.viewed || false
      }));

      setFeedbacks(mappedFeedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to load customer feedback"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (error) {
        console.error('Error fetching periods:', error);
        return;
      }

      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

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
      
      // Period filter
      let matchesPeriod = true;
      if (periodFilter.length > 0) {
        const selectedPeriods = periods.filter(p => periodFilter.includes(p.id));
        if (selectedPeriods.length > 0) {
          const feedbackDate = new Date(fb.feedback_date);
          matchesPeriod = selectedPeriods.some(period => {
            const periodStart = new Date(period.start_date);
            const periodEnd = new Date(period.end_date);
            return feedbackDate >= periodStart && feedbackDate <= periodEnd;
          });
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
              matchesChannel && matchesStore && matchesMarket && matchesAssignee && matchesPeriod;
    });

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Apply date filters if set
    return filtered.filter(fb => {
      if (dateFrom && new Date(fb.feedback_date) < dateFrom) return false;
      if (dateTo && new Date(fb.feedback_date) > dateTo) return false;
      return true;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, storeFilter, marketFilter, assigneeFilter, periodFilter, periods, sortOrder, dateFrom, dateTo]);

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
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);
  };

  const handleFeedbackUpdate = async () => {
    // Fetch only the updated feedback item to avoid replacing the entire array
    if (selectedFeedback) {
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .select('*')
          .eq('id', selectedFeedback.id)
          .single();

        if (error) {
          console.error('Error fetching updated feedback:', error);
          return;
        }

        // Update the feedbacks array with the updated item
        const updatedFeedback: CustomerFeedback = {
          id: data.id,
          feedback_date: data.feedback_date,
          complaint_category: data.complaint_category as CustomerFeedback['complaint_category'],
          channel: data.channel as CustomerFeedback['channel'],
          rating: data.rating,
          resolution_status: (data.resolution_status || 'unopened') as CustomerFeedback['resolution_status'],
          resolution_notes: data.resolution_notes,
          store_number: data.store_number,
          market: data.market,
          case_number: data.case_number,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          feedback_text: data.feedback_text,
          user_id: data.user_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          priority: (data.priority || 'Low') as CustomerFeedback['priority'],
          assignee: data.assignee || 'Unassigned',
          viewed: data.viewed || false
        };

        // Update the feedbacks array
        setFeedbacks(prev => prev.map(fb => fb.id === updatedFeedback.id ? updatedFeedback : fb));
        
        // Update the selected feedback to prevent stale reference
        setSelectedFeedback(updatedFeedback);
      } catch (error) {
        console.error('Error updating feedback:', error);
      }
    }
  };

  const handleDelete = async (feedback: CustomerFeedback) => {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .delete()
        .eq('id', feedback.id);

      if (error) {
        console.error('Error deleting feedback:', error);
        toast({
          variant: "destructive",
          title: "Error", 
          description: "Failed to delete feedback"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Deleted feedback case ${feedback.case_number}`
      });
      
      // Refresh the list
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete feedback"
      });
    }
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
    setPeriodFilter([]);
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  if (loading) {
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
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading feedback...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Welcome Message */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Welcome, {profile?.display_name || profile?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="text-sm text-muted-foreground">
                {permissions.isAdmin ? (
                  "Administrator Access - All Markets & Stores"
                ) : permissions.markets.length > 0 ? (
                  `Market Access: ${permissions.markets.join(', ')}`
                ) : permissions.stores.length > 0 ? (
                  `Store Access: ${permissions.stores.join(', ')}`
                ) : (
                  "Loading access permissions..."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Feedback Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitor and respond to customer feedback from Yelp, Qualtrics, and Jimmy John's channels
            </p>
          </div>
          
        </div>

        <CustomerFeedbackStats 
          feedbacks={filteredFeedbacks}
          onFilterChange={(type, value) => {
            if (type === 'status') {
              if (value === 'open') {
                // Show all open statuses (unopened + opened + responded + escalated)
                setStatusFilter(['unopened', 'opened', 'responded', 'escalated']);
              } else {
                setStatusFilter([value]);
              }
            } else if (type === 'priority') {
              setPriorityFilter([value]);
            }
          }}
        />

        <ComplaintTrendsChart className="mb-6" />

        <CategoryBreakdownChart 
          className="mb-6" 
          feedbacks={filteredFeedbacks}
        />

        <FeedbackReportingFilters
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
          periodFilter={periodFilter}
          onPeriodFilterChange={setPeriodFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClearFilters={handleClearAllFilters} 
          availableStores={availableStores} 
          availableMarkets={availableMarkets} 
          availableAssignees={availableAssignees}
          availablePeriods={periods}
        />

        {/* Prominent Clear Filters Button */}
        {(searchTerm || statusFilter.length > 0 || priorityFilter.length > 0 || 
          categoryFilter.length > 0 || channelFilter.length > 0 || storeFilter.length > 0 || 
          marketFilter.length > 0 || assigneeFilter.length > 0 || periodFilter.length > 0 || dateFrom || dateTo) && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleClearAllFilters}
              className="bg-background hover:bg-accent"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}

        <CustomerFeedbackTable
          feedbacks={filteredFeedbacks}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          isAdmin={true}
        />

        <FeedbackDetailsDialog
          feedback={selectedFeedback}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedFeedback(null);
          }}
          onUpdate={handleFeedbackUpdate}
        />
      </div>
    </div>
  );
};

export default Index;