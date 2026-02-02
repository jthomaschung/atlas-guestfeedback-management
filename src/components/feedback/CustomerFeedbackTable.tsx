import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackCard } from "./CustomerFeedbackCard";

interface CustomerFeedbackTableProps {
  feedbacks: CustomerFeedback[];
  onEdit: (feedback: CustomerFeedback) => void;
  onViewDetails: (feedback: CustomerFeedback) => void;
  onDelete?: (feedback: CustomerFeedback) => void;
  onCategoryChange?: (feedback: CustomerFeedback, newCategory: string) => void;
  isAdmin?: boolean;
  canEditCategory?: boolean;
}

export function CustomerFeedbackTable({ 
  feedbacks, 
  onEdit, 
  onViewDetails, 
  onDelete, 
  onCategoryChange,
  isAdmin, 
  canEditCategory 
}: CustomerFeedbackTableProps) {
  console.log('📋 CustomerFeedbackTable rendering with', feedbacks.length, 'items');
  
  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground text-lg">No feedback items match your current filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting or clearing your filters to see more results.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {feedbacks.map((feedback) => (
          <CustomerFeedbackCard
            key={feedback.id}
            feedback={feedback}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            onCategoryChange={onCategoryChange}
            isAdmin={isAdmin}
            canEditCategory={canEditCategory}
          />
        ))}
      </div>
    </div>
  );
}