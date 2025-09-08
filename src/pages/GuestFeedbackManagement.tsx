import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerFeedback } from '@/types/feedback';
import { CustomerFeedbackTable } from '@/components/feedback/CustomerFeedbackTable';
import { SimpleFeedbackFilters } from '@/components/feedback/SimpleFeedbackFilters';
import { FeedbackDetailsDialog } from '@/components/feedback/FeedbackDetailsDialog';
import { CustomerFeedbackStats } from '@/components/feedback/CustomerFeedbackStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function GuestFeedbackManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadGuestFeedbackManagerFeedback();
    }
  }, [user?.email]);

  const loadGuestFeedbackManagerFeedback = async () => {
    try {
      setLoading(true);
      
      // Get feedback assigned to current user (guest feedback manager) or general guest feedback
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .or(`assignee.eq.${user?.email},assignee.eq.guestfeedback@atlaswe.com`)
        .in('resolution_status', ['opened', 'responded'])
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

      setFeedbacks(formattedData);
      setFilteredFeedbacks(formattedData);
    } catch (error) {
      console.error('Error loading guest feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load guest feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };

  const handleCategoryChange = async (feedback: CustomerFeedback, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ complaint_category: newCategory })
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback category updated successfully.",
      });

      await loadGuestFeedbackManagerFeedback();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
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
      await loadGuestFeedbackManagerFeedback();
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest Feedback Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to guest feedback assigned to you
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredFeedbacks.length} Active Cases
        </Badge>
      </div>

      <CustomerFeedbackStats feedbacks={filteredFeedbacks} />

      <Card>
        <CardHeader>
          <CardTitle>Active Feedback Cases</CardTitle>
          <CardDescription>
            Feedback assigned to guest feedback management team that requires attention
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
                <p className="text-muted-foreground">No active feedback cases found.</p>
              </div>
            ) : (
              <CustomerFeedbackTable
                feedbacks={filteredFeedbacks}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
                onCategoryChange={handleCategoryChange}
                canEditCategory={true}
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
          onUpdate={loadGuestFeedbackManagerFeedback}
        />
      )}
    </div>
  );
}