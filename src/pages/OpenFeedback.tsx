import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { FeedbackReportingFilters, ORDER_ISSUES_CATEGORIES } from "@/components/feedback/FeedbackReportingFilters";
import { FeedbackDetailsDialog } from "@/components/feedback/FeedbackDetailsDialog";
import { Button } from "@/components/ui/button";
import { X, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";

const OpenFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [periods, setPeriods] = useState<Array<{ id: string; name: string; start_date: string; end_date: string }>>([]);
  const [stores, setStores] = useState<Array<{ store_number: string }>>([]);
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
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchParams, setSearchParams] = useSearchParams();
  const processedFeedbackIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  const authContext = useAuth();
  const { user: authUser, profile, isSessionReady } = authContext || { user: null, profile: null, isSessionReady: false };
  const { permissions } = useUserPermissions();

  // Handle feedbackId query param to auto-open specific feedback
  useEffect(() => {
    const feedbackId = searchParams.get('feedbackId');
    if (!feedbackId || processedFeedbackIdRef.current === feedbackId) return;
    
    processedFeedbackIdRef.current = feedbackId;
    
    const openFeedbackById = async () => {
      if (feedbacks.length > 0) {
        const found = feedbacks.find(f => f.id === feedbackId);
        if (found) {
          setSelectedFeedback(found);
          setIsDialogOpen(true);
          setSearchParams({}, { replace: true });
          return;
        }
      }
      
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .select('*')
          .eq('id', feedbackId)
          .single();
        
        if (error || !data) {
          toast({ title: 'Error', description: 'Could not find the feedback', variant: 'destructive' });
          setSearchParams({}, { replace: true });
          return;
        }
        
        setSelectedFeedback(mapFeedback(data));
        setIsDialogOpen(true);
        setSearchParams({}, { replace: true });
      } catch {
        setSearchParams({}, { replace: true });
      }
    };
    
    openFeedbackById();
  }, [searchParams, setSearchParams, feedbacks, toast]);

  useEffect(() => {
    if (authUser && isSessionReady) {
      fetchFeedbacks();
      fetchPeriods();
      fetchStores();
    }
  }, [authUser, isSessionReady]);

  const mapFeedback = (item: any): CustomerFeedback => ({
    id: item.id,
    feedback_date: item.feedback_date,
    complaint_category: item.complaint_category,
    channel: item.channel,
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
    priority: (item.priority || 'Low') as CustomerFeedback['priority'],
    assignee: item.assignee || 'Unassigned',
    viewed: item.viewed || false,
    customer_called: item.customer_called || false,
    outreach_sent_at: item.outreach_sent_at,
    outreach_method: item.outreach_method,
    customer_responded_at: item.customer_responded_at,
    customer_response_sentiment: item.customer_response_sentiment,
    escalated_at: item.escalated_at,
    escalated_by: item.escalated_by,
    executive_notes: item.executive_notes,
    sla_deadline: item.sla_deadline,
    auto_escalated: item.auto_escalated,
    time_of_day: item.time_of_day,
    order_number: item.order_number,
    period: item.period,
    ee_action: item.ee_action,
    type_of_feedback: item.type_of_feedback,
    reward: item.reward,
    feedback_source: item.feedback_source,
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data: pageData, error: pageError } = await supabase
          .from('customer_feedback')
          .select('*')
          .not('resolution_status', 'in', '("resolved","acknowledged")')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);
        
        if (pageError) {
          toast({ variant: "destructive", title: "Error", description: "Failed to load feedback" });
          return;
        }
        
        allData = allData.concat(pageData || []);
        hasMore = (pageData?.length || 0) === pageSize;
        from += pageSize;
      }
      
      const data = allData;
      const error = null;

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load feedback" });
        return;
      }

      setFeedbacks((data || []).map(mapFeedback));
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load feedback" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      const { data } = await supabase
        .from('periods')
        .select('*')
        .in('year', [2025, 2026])
        .order('year', { ascending: false })
        .order('period_number', { ascending: false });
      setPeriods(data || []);
    } catch {}
  };

  const fetchStores = async () => {
    try {
      const { data } = await supabase.from('stores').select('store_number').order('store_number');
      setStores(data || []);
    } catch {}
  };

  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter(fb => {
      const matchesSearch = !searchTerm || 
        fb.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        fb.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        fb.case_number?.includes(searchTerm) ||
        fb.store_number?.includes(searchTerm);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(fb.resolution_status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(fb.priority);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.some(cat => {
        if (!cat) return false;
        const categoryLower = fb.complaint_category?.toLowerCase() || '';
        const filterLower = cat.toLowerCase();
        if (filterLower === 'order issues') return ORDER_ISSUES_CATEGORIES.includes(categoryLower);
        return categoryLower === filterLower || categoryLower.includes(filterLower) || filterLower.includes(categoryLower);
      });
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(fb.channel);
      const matchesStore = storeFilter.length === 0 || storeFilter.includes(fb.store_number);
      const normalizedMarket = fb.market.replace(/([A-Z]+)(\d+)/, '$1 $2');
      const matchesMarket = marketFilter.length === 0 || marketFilter.includes(normalizedMarket);
      const matchesAssignee = assigneeFilter.length === 0 || 
        (assigneeFilter.includes('unassigned') && (!fb.assignee || fb.assignee === 'Unassigned')) ||
        (fb.assignee && assigneeFilter.includes(fb.assignee));
      
      let matchesPeriod = true;
      if (periodFilter.length > 0) {
        const selectedPeriods = periods.filter(p => periodFilter.includes(p.id));
        if (selectedPeriods.length > 0) {
          matchesPeriod = selectedPeriods.some(period => 
            fb.feedback_date >= period.start_date && fb.feedback_date <= period.end_date
          );
        }
      }
      
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const feedbackDate = new Date(fb.feedback_date + 'T00:00:00');
        if (dateFrom) { const d = new Date(dateFrom); d.setHours(0,0,0,0); if (feedbackDate < d) matchesDateRange = false; }
        if (dateTo) { const d = new Date(dateTo); d.setHours(23,59,59,999); if (feedbackDate > d) matchesDateRange = false; }
      }

      const matchesFeedbackType = feedbackTypeFilter.length === 0 || 
        feedbackTypeFilter.some(type => type.toLowerCase() === (fb.type_of_feedback?.trim() || '').toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
        matchesChannel && matchesStore && matchesMarket && matchesAssignee && matchesPeriod && matchesDateRange && matchesFeedbackType;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.feedback_date).getTime();
      const dateB = new Date(b.feedback_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, storeFilter, marketFilter, assigneeFilter, periodFilter, periods, sortOrder, dateFrom, dateTo, feedbackTypeFilter]);

  const availableStores = useMemo(() => stores.map(s => s.store_number).sort(), [stores]);
  const availableMarkets = useMemo(() => {
    const markets = [...new Set(feedbacks.map(fb => fb.market.replace(/([A-Z]+)(\d+)/, '$1 $2')))];
    return markets.sort();
  }, [feedbacks]);
  const availableAssignees = useMemo(() => {
    return [...new Set(feedbacks.map(fb => fb.assignee).filter(Boolean))].sort();
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
    if (selectedFeedback) {
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .select('*')
          .eq('id', selectedFeedback.id)
          .single();

        if (error) return;

        const updatedFeedback = mapFeedback(data);

        // If resolved/acknowledged, remove from list
        if (['resolved', 'acknowledged'].includes(updatedFeedback.resolution_status)) {
          setFeedbacks(prev => prev.filter(fb => fb.id !== updatedFeedback.id));
          setIsDialogOpen(false);
          setSelectedFeedback(null);
        } else {
          setFeedbacks(prev => prev.map(fb => fb.id === updatedFeedback.id ? updatedFeedback : fb));
          setSelectedFeedback(updatedFeedback);
        }
      } catch {}
    }
  };

  const handleDelete = async (feedback: CustomerFeedback) => {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .delete()
        .eq('id', feedback.id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete feedback" });
        return;
      }

      toast({ title: "Success", description: `Deleted feedback case ${feedback.case_number}` });
      fetchFeedbacks();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete feedback" });
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

  const hasActiveFilters = searchTerm || statusFilter.length > 0 || priorityFilter.length > 0 || 
    categoryFilter.length > 0 || channelFilter.length > 0 || storeFilter.length > 0 || 
    marketFilter.length > 0 || assigneeFilter.length > 0 || periodFilter.length > 0 || dateFrom || dateTo;

  if (!authUser || !isSessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{!authUser ? 'Authenticating...' : 'Establishing connection...'}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <Inbox className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Open Feedback</h1>
              <p className="text-sm text-muted-foreground">Active tickets requiring attention</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading open tickets...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Open Feedback</h1>
              <p className="text-sm text-muted-foreground">
                {filteredFeedbacks.length} active ticket{filteredFeedbacks.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
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

          {hasActiveFilters && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleClearAllFilters} className="bg-background hover:bg-accent">
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
            onCategoryChange={(feedback, newCategory, newAssignee) => {
              setFeedbacks(prev => prev.map(fb => fb.id === feedback.id
                ? { ...fb, complaint_category: newCategory, ...(newAssignee ? { assignee: newAssignee } : {}) }
                : fb));
            }}
            isAdmin={permissions.isAdmin}
            canEditCategory={permissions.isAdmin}
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
    </div>
  );
};

export default OpenFeedback;
