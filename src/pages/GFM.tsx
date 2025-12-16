import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerFeedback } from '@/types/feedback';
import { CustomerFeedbackTable } from '@/components/feedback/CustomerFeedbackTable';
import { FeedbackReportingFilters } from '@/components/feedback/FeedbackReportingFilters';
import { FeedbackDetailsDialog } from '@/components/feedback/FeedbackDetailsDialog';
import { CustomerFeedbackStats } from '@/components/feedback/CustomerFeedbackStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function GFM() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [processingFeedbacks, setProcessingFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Filter states
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
  const [periods, setPeriods] = useState<Array<{ id: string; name: string; start_date: string; end_date: string }>>([]);

  useEffect(() => {
    loadGFMFeedback();
    fetchPeriods();
  }, []);

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

  const loadGFMFeedback = async () => {
    try {
      setLoading(true);
      
      // Get all feedback assigned to guestfeedback@atlaswe.com (Guest Feedback Manager)
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .eq('assignee', 'guestfeedback@atlaswe.com')
        .in('resolution_status', ['unopened', 'opened', 'responded', 'processing'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: CustomerFeedback[] = data?.map(item => ({
        ...item,
        feedback_date: item.feedback_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolution_status: item.resolution_status as CustomerFeedback['resolution_status'],
        priority: item.priority as CustomerFeedback['priority']
      })) || [];

      // Separate processing tickets from others
      const processing = formattedData.filter(f => f.resolution_status === 'processing');
      const others = formattedData.filter(f => f.resolution_status !== 'processing');

      setProcessingFeedbacks(processing);
      setFeedbacks(others);
    } catch (error) {
      console.error('Error loading GFM feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load guest feedback manager cases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter feedbacks
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
        return categoryLower.includes(filterLower) || filterLower.includes(categoryLower);
      });
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(fb.channel);
      const matchesStore = storeFilter.length === 0 || storeFilter.includes(fb.store_number);
      const normalizedMarket = fb.market.replace(/([A-Z]+)(\d+)/, '$1 $2');
      const matchesMarket = marketFilter.length === 0 || marketFilter.includes(normalizedMarket);
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
      
      // Date range filter
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const feedbackDate = new Date(fb.feedback_date + 'T00:00:00');
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (feedbackDate < fromDate) matchesDateRange = false;
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (feedbackDate > toDate) matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
             matchesChannel && matchesStore && matchesMarket && matchesAssignee && 
             matchesPeriod && matchesDateRange;
    });

    // Sort by newest first
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.feedback_date).getTime();
      const dateB = new Date(b.feedback_date).getTime();
      return dateB - dateA;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, storeFilter, marketFilter, assigneeFilter, periodFilter, periods, dateFrom, dateTo]);

  // Get available filter options
  const availableStores = useMemo(() => {
    return [...new Set(feedbacks.map(fb => fb.store_number))].sort();
  }, [feedbacks]);

  const availableMarkets = useMemo(() => {
    const normalizeMarket = (market: string) => market.replace(/([A-Z]+)(\d+)/, '$1 $2');
    return [...new Set(feedbacks.map(fb => normalizeMarket(fb.market)))].sort();
  }, [feedbacks]);

  const availableAssignees = useMemo(() => {
    return [...new Set(feedbacks.map(fb => fb.assignee).filter(Boolean))].sort() as string[];
  }, [feedbacks]);

  const clearFilters = () => {
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

  const handleEdit = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleSaveFeedback = async (updatedFeedback: CustomerFeedback) => {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: updatedFeedback.resolution_status,
          resolution_notes: updatedFeedback.resolution_notes,
          priority: updatedFeedback.priority,
          assignee: updatedFeedback.assignee,
          viewed: true
        })
        .eq('id', updatedFeedback.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback updated successfully.",
      });

      setDetailsDialogOpen(false);
      await loadGFMFeedback();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">GFM (Guest Feedback Manager)</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to centrally assigned guest feedback cases
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredFeedbacks.length + processingFeedbacks.length} Total Cases
        </Badge>
      </div>

      <CustomerFeedbackStats feedbacks={[...processingFeedbacks, ...filteredFeedbacks]} />

      {/* Processing Section */}
      {processingFeedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Processing
              </Badge>
              {processingFeedbacks.length} Case{processingFeedbacks.length !== 1 ? 's' : ''}
            </CardTitle>
            <CardDescription>
              Cases currently being processed by the Guest Feedback Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerFeedbackTable
              feedbacks={processingFeedbacks}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
              canEditCategory={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Active Cases Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Feedback Cases</CardTitle>
          <CardDescription>
            Feedback assigned to guestfeedback@atlaswe.com that requires attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              availableStores={availableStores}
              availableMarkets={availableMarkets}
              availableAssignees={availableAssignees}
              availablePeriods={periods}
              onClearFilters={clearFilters}
            />
            
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active feedback cases found.</p>
              </div>
            ) : (
              <CustomerFeedbackTable
                feedbacks={filteredFeedbacks}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
                canEditCategory={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {selectedFeedback && (
        <FeedbackDetailsDialog
          feedback={selectedFeedback}
          isOpen={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          onUpdate={loadGFMFeedback}
        />
      )}
    </div>
  );
}
