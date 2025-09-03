import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackCard } from "./CustomerFeedbackCard";

interface CustomerFeedbackTableProps {
  feedbacks: CustomerFeedback[];
  onEdit: (feedback: CustomerFeedback) => void;
  onViewDetails: (feedback: CustomerFeedback) => void;
  onDelete?: (feedback: CustomerFeedback) => void;
  isAdmin?: boolean;
}

export function CustomerFeedbackTable({ feedbacks, onEdit, onViewDetails, onDelete, isAdmin }: CustomerFeedbackTableProps) {
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
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}