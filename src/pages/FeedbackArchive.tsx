import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerFeedback } from '@/types/feedback';
import { CustomerFeedbackTable } from '@/components/feedback/CustomerFeedbackTable';
import { SimpleFeedbackFilters } from '@/components/feedback/SimpleFeedbackFilters';
import { FeedbackDetailsDialog } from '@/components/feedback/FeedbackDetailsDialog';
import { CustomerFeedbackStats } from '@/components/feedback/CustomerFeedbackStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Loader2, Archive, Download } from 'lucide-react';

export default function FeedbackArchive() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { permissions } = useUserPermissions();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (user?.email) {
      loadArchivedFeedback();
    }
  }, [user?.email]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setFilteredFeedbacks(formattedData);
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
        <div className={`mb-2 transition-all duration-300 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
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
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
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
            <SimpleFeedbackFilters 
              feedbacks={feedbacks}
              onFilter={setFilteredFeedbacks}
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