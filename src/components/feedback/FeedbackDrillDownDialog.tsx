import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackCard } from "./CustomerFeedbackCard";

interface FeedbackDrillDownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  feedbacks: CustomerFeedback[];
  onViewDetails: (feedback: CustomerFeedback) => void;
}

export function FeedbackDrillDownDialog({
  isOpen,
  onClose,
  title,
  feedbacks,
  onViewDetails,
}: FeedbackDrillDownDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {feedbacks.length} feedback item{feedbacks.length !== 1 ? 's' : ''} found
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          <div className="space-y-4 pb-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback items to display.
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <CustomerFeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onEdit={() => onViewDetails(feedback)}
                  onViewDetails={() => onViewDetails(feedback)}
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
