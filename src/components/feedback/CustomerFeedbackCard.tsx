import { CustomerFeedback } from "@/types/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Calendar, Eye, User, Clock, AlertTriangle, Trash2, Star, Phone, Hash, Save, X, ExternalLink } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerFeedbackCardProps {
  feedback: CustomerFeedback;
  onEdit: (feedback: CustomerFeedback) => void;
  onViewDetails: (feedback: CustomerFeedback) => void;
  onDelete?: (feedback: CustomerFeedback) => void;
  onCategoryChange?: (feedback: CustomerFeedback, newCategory: string) => void;
  isAdmin?: boolean;
  canEditCategory?: boolean;
}

const statusColors = {
  unopened: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
  responded: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  resolved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  escalated: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const priorityColors = {
  Praise: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  Low: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  High: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400',
};

const priorityIcons = {
  Praise: Star,
  Low: null,
  High: AlertTriangle,
  Critical: AlertTriangle,
};

const categoryOptions = [
  { value: 'Bread Quality', label: 'Bread Quality' },
  { value: 'Cleanliness', label: 'Cleanliness' },
  { value: 'Closed Early', label: 'Closed Early' },
  { value: 'Missing Items', label: 'Missing Items' },
  { value: 'Other', label: 'Other' },
  { value: 'Out of Product', label: 'Out of Product' },
  { value: 'Praise', label: 'Praise' },
  { value: 'Pricing Issue', label: 'Pricing Issue' },
  { value: 'Product Issue', label: 'Product Issue' },
  { value: 'Rude Service', label: 'Rude Service' },
  { value: 'Sandwich Made Wrong', label: 'Sandwich Made Wrong' },
  { value: 'Slow Service', label: 'Slow Service' },
];

const categoryLabels = categoryOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {} as Record<string, string>);

const channelLabels = {
  yelp: 'Yelp',
  qualtrics: 'Qualtrics',
  jimmy_johns: "Jimmy John's"
};

export function CustomerFeedbackCard({ 
  feedback, 
  onEdit, 
  onViewDetails, 
  onDelete, 
  onCategoryChange,
  isAdmin, 
  canEditCategory = false 
}: CustomerFeedbackCardProps) {
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isUpdatingCalled, setIsUpdatingCalled] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [editedFeedbackText, setEditedFeedbackText] = useState(feedback.feedback_text || '');
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);
  const PriorityIcon = priorityIcons[feedback.priority as keyof typeof priorityIcons];
  const isUrgent = feedback.priority === 'Critical';

  const shouldShowCMXLink = (feedback: CustomerFeedback): boolean => {
    return (
      feedback.complaint_category === 'Product Issue' &&
      feedback.resolution_notes?.toLowerCase().includes('cmx')
    );
  };

  const handleCalledChange = async (checked: boolean) => {
    setIsUpdatingCalled(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ customer_called: checked })
        .eq('id', feedback.id);

      if (error) throw error;

      toast.success(checked ? 'Marked as called' : 'Unmarked as called');
    } catch (error) {
      console.error('Error updating called status:', error);
      toast.error('Failed to update called status');
    } finally {
      setIsUpdatingCalled(false);
    }
  };

  const handleSaveFeedback = async () => {
    setIsUpdatingFeedback(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ 
          feedback_text: editedFeedbackText,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.id);

      if (error) throw error;

      toast.success('Feedback updated successfully');
      setIsEditingFeedback(false);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFeedbackText(feedback.feedback_text || '');
    setIsEditingFeedback(false);
  };

  const handleCategoryChange = async (newCategory: string) => {
    if (!canEditCategory || isUpdatingCategory) return;
    
    setIsUpdatingCategory(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ complaint_category: newCategory })
        .eq('id', feedback.id);

      if (error) throw error;

      onCategoryChange?.(feedback, newCategory);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer",
      isUrgent && "ring-2 ring-red-200 dark:ring-red-800/50",
      feedback.resolution_status === 'resolved' && "opacity-75"
    )} onClick={() => onViewDetails(feedback)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="font-medium">
                Store #{feedback.store_number}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {feedback.market}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {channelLabels[feedback.channel as keyof typeof channelLabels] || feedback.channel}
              </Badge>
              {feedback.case_number && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {feedback.case_number}
                </Badge>
              )}
            </div>
            
            {canEditCategory ? (
              <div className="mb-1" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={feedback.complaint_category}
                  onValueChange={handleCategoryChange}
                  disabled={isUpdatingCategory}
                >
                  <SelectTrigger className="h-8 text-sm font-semibold border border-border px-2 focus:ring-2 focus:ring-offset-1 bg-background hover:bg-muted transition-colors rounded-md">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <h3 className="font-semibold text-sm text-foreground leading-tight mb-1">
                {categoryLabels[feedback.complaint_category as keyof typeof categoryLabels] || feedback.complaint_category}
              </h3>
            )}
            
            {/* Feedback Text with Inline Edit */}
            {isEditingFeedback ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <Textarea
                  value={editedFeedbackText}
                  onChange={(e) => setEditedFeedbackText(e.target.value)}
                  className="text-sm min-h-[80px] resize-none"
                  disabled={isUpdatingFeedback}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveFeedback}
                    disabled={isUpdatingFeedback}
                    className="h-7"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdatingFeedback}
                    className="h-7"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative group/feedback">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {feedback.feedback_text}
                </p>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -right-1 -top-1 h-6 w-6 p-0 opacity-0 group-hover/feedback:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingFeedback(true);
                    }}
                    title="Edit Feedback Text (Admin Only)"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2 sm:ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(feedback);
              }}
              title="Edit Feedback"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(feedback);
              }}
              title="View Details"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(feedback);
                }}
                title="Delete Feedback (Admin Only)"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            <Badge 
              className={cn(
                "transition-colors whitespace-nowrap",
                statusColors[feedback.resolution_status as keyof typeof statusColors]
              )}
            >
              {feedback.resolution_status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            
            <Badge 
              className={cn(
                "transition-colors flex items-center gap-1",
                priorityColors[feedback.priority as keyof typeof priorityColors]
              )}
            >
              {PriorityIcon && <PriorityIcon className="h-3 w-3" />}
              {feedback.priority}
            </Badge>
            
            {feedback.rating && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {feedback.rating}/5
              </Badge>
            )}
          </div>
          
          {/* CMX Link for Product Issues */}
          {shouldShowCMXLink(feedback) && (
            <a
              href="https://jimmyjohns.compliancemetrix.com/rql/p/acoretableauhomevhomeactivator"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-medium text-blue-700 dark:text-blue-400 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open in CMX
            </a>
          )}
          
          {/* Time & Order Information */}
          {(feedback.time_of_day || feedback.order_number || feedback.period) && (
            <div className="flex flex-wrap gap-3 text-xs">
              {feedback.time_of_day && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{feedback.time_of_day}</span>
                </div>
              )}
              {feedback.order_number && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{feedback.order_number}</span>
                </div>
              )}
              {feedback.period && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Period {feedback.period}</span>
                </div>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(feedback.feedback_date + 'T00:00:00'), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="truncate">{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-32">
                  {feedback.assignee && feedback.assignee !== 'unassigned' 
                    ? feedback.assignee 
                    : 'Unassigned'
                  }
                </span>
              </div>
            </div>
            
            {/* Phone Number and Called Checkbox */}
            {feedback.customer_phone && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Phone className="h-3 w-3" />
                <span className="truncate">{feedback.customer_phone}</span>
                <div className="flex items-center gap-1 ml-2">
                  <Checkbox
                    id={`called-${feedback.id}`}
                    checked={feedback.customer_called || false}
                    onCheckedChange={handleCalledChange}
                    disabled={isUpdatingCalled}
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`called-${feedback.id}`}
                    className="text-xs cursor-pointer select-none"
                  >
                    Called Customer
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}