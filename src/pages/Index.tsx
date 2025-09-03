import { useState } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { dummyFeedback } from "@/data/dummyFeedback";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [feedbacks] = useState<CustomerFeedback[]>(dummyFeedback);
  const { toast } = useToast();
  const { user } = useAuth();

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
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Response
          </Button>
        </div>

        <CustomerFeedbackTable
          feedbacks={feedbacks}
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