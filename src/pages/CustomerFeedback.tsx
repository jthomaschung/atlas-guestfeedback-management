import { useState, useEffect } from "react";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { CustomerFeedback } from "@/types/feedback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CustomerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
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
        priority: 'Low' as CustomerFeedback['priority'], // Default priority
        assignee: 'Unassigned',
        viewed: false
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

  const handleEdit = (feedback: CustomerFeedback) => {
    console.log("Edit feedback:", feedback);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    console.log("View feedback details:", feedback);
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
        description: "Feedback deleted successfully"
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Customer Feedback</h1>
          <p className="text-muted-foreground">
            Monitor and respond to customer feedback from Yelp, Qualtrics, and Jimmy John's channels
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Customer Feedback</h1>
        <p className="text-muted-foreground">
          Monitor and respond to customer feedback from Yelp, Qualtrics, and Jimmy John's channels
        </p>
      </div>
      
      <CustomerFeedbackTable
        feedbacks={feedbacks}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
        isAdmin={true}
      />
    </div>
  );
}