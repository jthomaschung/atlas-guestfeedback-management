import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerFeedback } from '@/types/feedback';
import { CustomerFeedbackTable } from '@/components/feedback/CustomerFeedbackTable';
import { FeedbackReportingFilters } from '@/components/feedback/FeedbackReportingFilters';
import { FeedbackDetailsDialog } from '@/components/feedback/FeedbackDetailsDialog';
import { CustomerFeedbackStats } from '@/components/feedback/CustomerFeedbackStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Loader2, Archive, Download } from 'lucide-react';
import { Period } from '@/types/period';

export default function FeedbackArchive() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { permissions } = useUserPermissions();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
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
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    if (user?.email) {
      loadArchivedFeedback();
      loadPeriods();
    }
  }, [user?.email]);

  const loadPeriods = async () => {
    const { data } = await supabase
      .from('periods')
      .select('*')
      .order('start_date', { ascending: false });
    if (data) setPeriods(data);
  };

  const loadArchivedFeedback = async () => {
    try {
      setLoading(true);
      
      // Get resolved feedback that the user has access to
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .eq('resolution_status', 'resolved')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedData: CustomerFeedback[] = data?.map(item => ({
        ...item,
        feedback_date: item.feedback_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolution_status: item.resolution_status as CustomerFeedback['resolution_status'],
        priority: item.priority as CustomerFeedback['priority']
      })) || [];

      setFeedbacks(formattedData);
    } catch (error) {
      console.error('Error loading archived feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load archived feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Derived filter options
  const availableStores = useMemo(() => [...new Set(feedbacks.map(f => f.store_number))].sort(), [feedbacks]);
  const availableMarkets = useMemo(() => [...new Set(feedbacks.map(f => f.market))].sort(), [feedbacks]);
  const availableAssignees = useMemo(() => [...new Set(feedbacks.map(f => f.assignee).filter(Boolean))].sort() as string[], [feedbacks]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          feedback.case_number?.toLowerCase().includes(search) ||
          feedback.customer_name?.toLowerCase().includes(search) ||
          feedback.customer_email?.toLowerCase().includes(search) ||
          feedback.feedback_text?.toLowerCase().includes(search) ||
          feedback.store_number?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(feedback.resolution_status || '')) return false;

      // Priority filter
      if (priorityFilter.length > 0 && !priorityFilter.includes(feedback.priority || '')) return false;

      // Category filter
      if (categoryFilter.length > 0 && !categoryFilter.includes(feedback.complaint_category || '')) return false;

      // Channel filter
      if (channelFilter.length > 0 && !channelFilter.includes(feedback.channel || '')) return false;

      // Store filter
      if (storeFilter.length > 0 && !storeFilter.includes(feedback.store_number)) return false;

      // Market filter
      if (marketFilter.length > 0 && !marketFilter.includes(feedback.market)) return false;

      // Assignee filter
      if (assigneeFilter.length > 0 && !assigneeFilter.includes(feedback.assignee || '')) return false;

      // Period filter
      if (periodFilter.length > 0) {
        const matchesPeriod = periodFilter.some(periodName => {
          const period = periods.find(p => p.name === periodName);
          if (!period) return false;
          const feedbackDate = new Date(feedback.feedback_date);
          return feedbackDate >= new Date(period.start_date) && feedbackDate <= new Date(period.end_date);
        });
        if (!matchesPeriod) return false;
      }

      // Date range filter
      if (dateFrom) {
        const feedbackDate = new Date(feedback.feedback_date);
        if (feedbackDate < dateFrom) return false;
      }
      if (dateTo) {
        const feedbackDate = new Date(feedback.feedback_date);
        if (feedbackDate > dateTo) return false;
      }

      return true;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, storeFilter, marketFilter, assigneeFilter, periodFilter, dateFrom, dateTo, periods]);

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleReopen = async (feedback: CustomerFeedback) => {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ 
          resolution_status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback case reopened successfully.",
      });

      await loadArchivedFeedback();
    } catch (error) {
      console.error('Error reopening feedback:', error);
      toast({
        title: "Error",
        description: "Failed to reopen feedback case. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (feedback: CustomerFeedback) => {
    if (!permissions.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete feedback records.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_feedback')
        .delete()
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback record deleted successfully.",
      });

      await loadArchivedFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (filteredFeedbacks.length === 0) {
      toast({
        title: "No Data",
        description: "No feedback data to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Case Number',
      'Store Number',
      'Market',
      'Channel',
      'Category',
      'Priority',
      'Customer Name',
      'Customer Email',
      'Feedback Date',
      'Feedback Text',
      'Resolution Status',
      'Resolution Notes',
      'Assignee',
      'Created At',
      'Updated At'
    ];

    const csvData = filteredFeedbacks.map(feedback => [
      feedback.case_number,
      feedback.store_number,
      feedback.market,
      feedback.channel,
      feedback.complaint_category,
      feedback.priority,
      feedback.customer_name || '',
      feedback.customer_email || '',
      feedback.feedback_date,
      `"${feedback.feedback_text?.replace(/"/g, '""') || ''}"`,
      feedback.resolution_status,
      `"${feedback.resolution_notes?.replace(/"/g, '""') || ''}"`,
      feedback.assignee || '',
      feedback.created_at,
      feedback.updated_at
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-archive-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Feedback archive exported successfully.",
    });
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
      <div className="space-y-6">
        {/* User Info */}
        <div className="mb-2">
          <p className="text-sm text-foreground">
            Welcome, {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {permissions.isAdmin 
              ? "Administrator Access - All Markets & Stores"
              : permissions.isDirectorOrAbove
              ? `${permissions.role} Access - ${permissions.markets.length > 0 ? permissions.markets.join(', ') : 'All Markets'}`
              : `Store Access - ${permissions.stores.length > 0 ? permissions.stores.join(', ') : 'Limited Access'}`
            }
          </p>
        </div>

        {/* Feedback Archive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Archive className="h-8 w-8" />
              Feedback Archive
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage resolved feedback cases
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Badge variant="secondary" className="text-sm">
              {filteredFeedbacks.length} Resolved Cases
            </Badge>
          </div>
        </div>
      </div>

      <CustomerFeedbackStats feedbacks={filteredFeedbacks} />

      <Card>
        <CardHeader>
          <CardTitle>Resolved Feedback Cases</CardTitle>
          <CardDescription>
            Feedback cases that have been marked as resolved
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
              availablePeriods={periods.map(p => ({ id: p.id, name: p.name, start_date: p.start_date, end_date: p.end_date }))}
              onClearFilters={() => {
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
              }}
            />
            
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resolved feedback cases found.</p>
              </div>
            ) : (
              <CustomerFeedbackTable
                feedbacks={filteredFeedbacks}
                onEdit={(feedback) => handleReopen(feedback)}
                onViewDetails={handleViewDetails}
                onDelete={permissions.isAdmin ? handleDelete : undefined}
                isAdmin={permissions.isAdmin}
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
          onUpdate={loadArchivedFeedback}
        />
      )}
    </div>
  );
}