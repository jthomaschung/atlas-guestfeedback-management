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

export default function GFM() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<CustomerFeedback[]>([]);
  const [processingFeedbacks, setProcessingFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadGFMFeedback();
  }, []);

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
      setFilteredFeedbacks(others);
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