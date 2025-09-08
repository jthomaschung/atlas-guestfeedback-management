import { useState, useEffect } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, User, Star, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPermissions } from "@/hooks/useUserPermissions";

interface FeedbackDetailsDialogProps {
  feedback: CustomerFeedback | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
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

const categoryLabels = {
  praise: 'Praise',
  service: 'Service',
  food_quality: 'Food Quality',
  cleanliness: 'Cleanliness',
  order_accuracy: 'Order Accuracy',
  wait_time: 'Wait Time',
  facility_issue: 'Facility Issue',
  other: 'Other'
};

const channelLabels = {
  yelp: 'Yelp',
  qualtrics: 'Qualtrics',
  jimmy_johns: "Jimmy John's"
};

export function FeedbackDetailsDialog({ feedback, isOpen, onClose, onUpdate }: FeedbackDetailsDialogProps) {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { permissions, loading: permissionsLoading } = useUserPermissions();

  // Update local state when feedback changes
  useEffect(() => {
    if (feedback) {
      setStatus(feedback.resolution_status);
      setPriority(feedback.priority);
      setAssignee(feedback.assignee || '');
      setResolutionNotes(feedback.resolution_notes || '');
    }
  }, [feedback]);

  // Auto-mark as viewed and change status when dialog opens
  useEffect(() => {
    if (feedback && isOpen) {
      console.log('🔍 FEEDBACK DIALOG: Auto-update check', {
        feedbackId: feedback.id,
        currentStatus: feedback.resolution_status,
        isViewed: feedback.viewed,
        shouldUpdate: !feedback.viewed || feedback.resolution_status === 'unopened'
      });
      
      if (!feedback.viewed || feedback.resolution_status === 'unopened') {
        const updateFeedback = async () => {
          try {
            const updateData: any = {
              viewed: true,
              updated_at: new Date().toISOString(),
            };
            
            // If status is unopened, change it to opened
            if (feedback.resolution_status === 'unopened') {
              updateData.resolution_status = 'opened';
              setStatus('opened');
              console.log('🔄 FEEDBACK DIALOG: Changing status from unopened to opened');
            }
            
            console.log('📝 FEEDBACK DIALOG: Updating feedback', { feedbackId: feedback.id, updateData });
            
            const { data, error } = await supabase
              .from('customer_feedback')
              .update(updateData)
              .eq('id', feedback.id)
              .select();

            if (error) {
              console.error('❌ FEEDBACK DIALOG: Update error', error);
            } else {
              console.log('✅ FEEDBACK DIALOG: Update successful', data);
              onUpdate(); // Refresh the list to show updated status
            }
          } catch (error) {
            console.error('❌ FEEDBACK DIALOG: Exception during update', error);
          }
        };
        
        // Small delay to ensure dialog is fully mounted
        setTimeout(updateFeedback, 200);
      }
    }
  }, [feedback, isOpen, onUpdate]);

  const handleSave = async () => {
    if (!feedback) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: status,
          priority: priority,
          assignee: assignee || null,
          resolution_notes: resolutionNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Feedback Updated",
        description: "The feedback has been successfully updated.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Details - Case #{feedback.case_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-medium">
              Store #{feedback.store_number}
            </Badge>
            <Badge variant="secondary">
              {feedback.market}
            </Badge>
            <Badge variant="outline">
              {channelLabels[feedback.channel as keyof typeof channelLabels] || feedback.channel}
            </Badge>
            <Badge className={cn("transition-colors", statusColors[feedback.resolution_status as keyof typeof statusColors])}>
              {feedback.resolution_status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className={cn("transition-colors", priorityColors[feedback.priority as keyof typeof priorityColors])}>
              {feedback.priority === 'Praise' && <Star className="h-3 w-3 mr-1" />}
              {(feedback.priority === 'High' || feedback.priority === 'Critical') && <AlertTriangle className="h-3 w-3 mr-1" />}
              {feedback.priority}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-semibold">Customer Information</h4>
              {feedback.customer_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  {feedback.customer_name}
                </div>
              )}
              {feedback.customer_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {feedback.customer_email}
                </div>
              )}
              {feedback.customer_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {feedback.customer_phone}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Feedback Details</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(feedback.feedback_date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {(() => {
                  console.log('🔍 FEEDBACK DIALOG: Permission check', { 
                    isAdmin: permissions.isAdmin, 
                    permissions,
                    permissionsLoading,
                    userEmail: feedback.user_id 
                  });
                  return !permissionsLoading && permissions.isAdmin;
                })() ? (
                  <Select 
                    value={feedback.complaint_category} 
                    onValueChange={async (newCategory) => {
                      try {
                        const { error } = await supabase
                          .from('customer_feedback')
                          .update({ complaint_category: newCategory })
                          .eq('id', feedback.id);

                        if (error) throw error;
                        
                        onUpdate();
                        toast({
                          title: "Success",
                          description: "Category updated successfully"
                        });
                      } catch (error) {
                        console.error('Error updating category:', error);
                        toast({
                          variant: "destructive",
                          title: "Error", 
                          description: "Failed to update category"
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 border-none p-0 bg-transparent hover:bg-muted/50 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="praise">Praise</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="food_quality">Food Quality</SelectItem>
                      <SelectItem value="cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="order_accuracy">Order Accuracy</SelectItem>
                      <SelectItem value="wait_time">Wait Time</SelectItem>
                      <SelectItem value="facility_issue">Facility Issue</SelectItem>
                      <SelectItem value="Missing Item">Missing Item</SelectItem>
                      <SelectItem value="Slow Service">Slow Service</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-muted-foreground">
                    {categoryLabels[feedback.complaint_category as keyof typeof categoryLabels] || feedback.complaint_category}
                  </span>
                )}
              </div>
              {feedback.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  {feedback.rating}/5 Rating
                </div>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Feedback</Label>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{feedback.feedback_text}</p>
            </div>
          </div>

          {/* Edit Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Resolution Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unopened">Unopened</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Praise">Praise</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="Enter assignee name"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Resolution Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add resolution notes..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}