import { useEffect, useRef, useState } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { CustomerFeedbackCard } from "./CustomerFeedbackCard";

interface CustomerFeedbackTableProps {
  feedbacks: CustomerFeedback[];
  onEdit: (feedback: CustomerFeedback) => void;
  onViewDetails: (feedback: CustomerFeedback) => void;
  onDelete?: (feedback: CustomerFeedback) => void;
  onCategoryChange?: (feedback: CustomerFeedback, newCategory: string, newAssignee?: string) => void;
  isAdmin?: boolean;
  canDelete?: boolean;
  canEditCategory?: boolean;
  likes?: Record<string, number>;
  userLikes?: Set<string>;
  onToggleLike?: (feedbackId: string) => void;
}

const BATCH_SIZE = 60;

export function CustomerFeedbackTable({ 
  feedbacks, 
  onEdit, 
  onViewDetails, 
  onDelete, 
  onCategoryChange,
  isAdmin, 
  canDelete,
  canEditCategory,
  likes,
  userLikes,
  onToggleLike,
}: CustomerFeedbackTableProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filtered list changes meaningfully
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [feedbacks.length]);

  useEffect(() => {
    if (visibleCount >= feedbacks.length) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + BATCH_SIZE, feedbacks.length));
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, feedbacks.length]);

  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground text-lg">No feedback items match your current filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting or clearing your filters to see more results.</p>
      </div>
    );
  }

  const visible = feedbacks.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((feedback) => (
          <CustomerFeedbackCard
            key={feedback.id}
            feedback={feedback}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            onCategoryChange={onCategoryChange}
            isAdmin={isAdmin}
            canDelete={canDelete}
            canEditCategory={canEditCategory}
            likeCount={likes?.[feedback.id] || 0}
            isLiked={userLikes?.has(feedback.id) || false}
            onToggleLike={onToggleLike}
          />
        ))}
      </div>
      {visibleCount < feedbacks.length && (
        <div ref={sentinelRef} className="h-12 flex items-center justify-center text-sm text-muted-foreground">
          Loading more…
        </div>
      )}
    </div>
  );
}
