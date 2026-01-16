import { useState } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentSection } from "./CommentSection";
import { Star, Store, Calendar, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type PraiseComment = {
  id: string;
  feedback_id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

interface PraiseCardProps {
  praise: CustomerFeedback;
  comments: PraiseComment[];
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
}

export function PraiseCard({ 
  praise, 
  comments, 
  onAddComment, 
  onDeleteComment,
  currentUserId 
}: PraiseCardProps) {
  const [showComments, setShowComments] = useState(false);

  const feedbackDate = praise.feedback_date 
    ? new Date(praise.feedback_date) 
    : new Date(praise.created_at);

  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-400 hover:shadow-lg transition-shadow duration-200 bg-gradient-to-r from-amber-50/30 to-transparent">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {praise.customer_name || "Anonymous Customer"}
                </span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  Praise
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Store className="h-3.5 w-3.5" />
                  Store #{praise.store_number}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDistanceToNow(feedbackDate, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            {praise.market}
          </Badge>
        </div>

        {/* Feedback Content */}
        <div className="bg-white/60 rounded-lg p-4 mb-4 border border-amber-100">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {praise.feedback_text || "No feedback text provided."}
          </p>
        </div>

        {/* Channel & Date Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="capitalize">via {praise.channel}</span>
          <span>{format(feedbackDate, 'MMM d, yyyy')}</span>
        </div>

        {/* Comments Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="w-full justify-between hover:bg-amber-50"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {comments.length === 0 
              ? "Add a comment" 
              : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
            }
          </span>
          {showComments ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <CommentSection
              comments={comments}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
