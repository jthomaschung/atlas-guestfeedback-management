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