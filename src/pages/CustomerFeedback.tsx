import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { dummyFeedback } from "@/data/dummyFeedback";
import { CustomerFeedback } from "@/types/feedback";

export default function CustomerFeedbackPage() {
  const handleEdit = (feedback: CustomerFeedback) => {
    console.log("Edit feedback:", feedback);
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    console.log("View feedback details:", feedback);
  };

  const handleDelete = (feedback: CustomerFeedback) => {
    console.log("Delete feedback:", feedback);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Customer Feedback</h1>
        <p className="text-muted-foreground">
          Monitor and respond to customer feedback from Yelp, Qualtrics, and Jimmy John's channels
        </p>
      </div>
      
      <CustomerFeedbackTable
        feedbacks={dummyFeedback}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
        isAdmin={true}
      />
    </div>
  );
}