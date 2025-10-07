import { useState, useEffect, useRef } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MentionsTextarea } from "@/components/ui/mentions-textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Star, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle, Store, Edit, Save, X, Heart, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useFeedbackNotifications } from "@/hooks/useFeedbackNotifications";
import { EmailConversationDialog } from "./EmailConversationDialog";

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
  'Sandwich Made Wrong': 'Sandwich Made Wrong',
  'Slow Service': 'Slow Service',
  'Rude Service': 'Rude Service',
  'Product Issue': 'Product Issue',
  'Closed Early': 'Closed Early',
  'Praise': 'Praise',
  'Missing Items': 'Missing Items',
  'Credit Card Issue': 'Credit Card Issue',
  'Bread Quality': 'Bread Quality',
  'Out of Product': 'Out of Product',
  'Other': 'Other',
  'Cleanliness': 'Cleanliness',
  'Food Quality': 'Food Quality',
  'Staff Service': 'Staff Service',
  'Delivery Service': 'Delivery Service',
  'Store Appearance': 'Store Appearance',
  'Wait Time': 'Wait Time',
  'Order Accuracy': 'Order Accuracy',
  'Temperature': 'Temperature',
  'Quantity': 'Quantity',
  'Experience': 'Experience',
  'Multiple Issues': 'Multiple Issues',
  'Manager/Supervisor Contact Request': 'Manager/Supervisor Contact Request',
  'Training': 'Training',
  'Appreciation': 'Appreciation'
};

const channelLabels = {
  'Digital Guest Contact': 'Digital Contact',
  'Point of Sale': 'POS',
  'social media': 'Social Media',
  'email': 'Email',
  'phone': 'Phone',
  'survey': 'Survey',
  'website': 'Website'
};

// Helper function to determine assignee based on category, store, and market
const getAssigneeForFeedback = async (storeNumber: string, market: string, category: string): Promise<string> => {
  console.log('🔍 ASSIGNMENT: Looking up assignee for', { storeNumber, market, category });

  try {
    // Get the store manager first
    const { data: storeData } = await supabase
      .from('stores')
      .select('manager')
      .eq('store_number', storeNumber)
      .maybeSingle();

    const storeManager = storeData?.manager;
    console.log('🏪 ASSIGNMENT: Store manager found:', storeManager);

    // Special handling for Praise category - assign to store manager if available
    if (category === 'Praise') {
      if (storeManager && storeManager.trim() !== '') {
        console.log('👏 ASSIGNMENT: Assigning praise to store manager:', storeManager);
        return storeManager;
      }
    }

    // Categories that should go to store managers
    const storeManagerCategories = [
      'Sandwich Made wrong', 'Slow Service', 'Rude Service', 'Missing Item',
      'Cleanliness', 'Food Quality', 'Staff Service', 'Store Appearance',
      'Wait Time', 'Order Accuracy', 'Temperature', 'Quantity', 'Experience',
      'Training', 'Manager/Supervisor Contact Request'
    ];

    if (storeManagerCategories.includes(category)) {
      if (storeManager && storeManager.trim() !== '') {
        console.log('🏪 ASSIGNMENT: Assigning to store manager for category:', category);
        return storeManager;
      }
    }

    // Categories that should go to DMs
    const dmCategories = [
      'Product Issue', 'Closed Early', 'Credit Card Issue', 'Bread Quality',
      'Out of Product', 'Other', 'Multiple Issues', 'Delivery Service'
    ];

    if (dmCategories.includes(category)) {
      console.log('📊 ASSIGNMENT: Looking for DM for category:', category);
      
      // Look up DM for the market - simplified approach
      const { data: dmUsers } = await supabase
        .from('user_permissions')
        .select('user_id')
        .contains('markets', [market]);

      if (dmUsers && dmUsers.length > 0) {
        // Get the profile for the first DM user
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', dmUsers[0].user_id)
          .single();

        if (profileData?.display_name) {
          console.log('📊 ASSIGNMENT: Found DM:', profileData.display_name);
          return profileData.display_name;
        }
      }
    }

    // Fallback to store manager if no specific assignment found
    if (storeManager && storeManager.trim() !== '') {
      console.log('🔄 ASSIGNMENT: Fallback to store manager:', storeManager);
      return storeManager;
    }

  } catch (error) {
    console.error('❌ ASSIGNMENT: Error looking up assignee:', error);
  }

  console.log('⚠️ ASSIGNMENT: No assignment found, defaulting to Unassigned');
  return 'Unassigned';
};

export function FeedbackDetailsDialog({ feedback, isOpen, onClose, onUpdate }: FeedbackDetailsDialogProps) {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [storeNumber, setStoreNumber] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailConversation, setShowEmailConversation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('acknowledgment');
  const [emailResolutionNotes, setEmailResolutionNotes] = useState("");
  const [emailActionTaken, setEmailActionTaken] = useState("");
  const [customerCalled, setCustomerCalled] = useState<boolean>(false);
  const [isUpdatingCalled, setIsUpdatingCalled] = useState(false);
  const [isEditingFeedbackText, setIsEditingFeedbackText] = useState(false);
  const [editedFeedbackText, setEditedFeedbackText] = useState<string>('');
  const [isUpdatingFeedbackText, setIsUpdatingFeedbackText] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  const { sendAssignmentNotification } = useFeedbackNotifications();
  const processedFeedbackId = useRef<string | null>(null);

  const isAdmin = permissions?.role?.toLowerCase() === 'admin' || permissions?.role?.toLowerCase() === 'dm' || permissions?.isAdmin || permissions?.isDirectorOrAbove;

  // Check acknowledgment status
  const checkAcknowledgmentStatus = async () => {
    if (!feedback || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('critical_feedback_approvals')
        .select('id')
        .eq('feedback_id', feedback.id)
        .eq('approver_user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking acknowledgment:', error);
        return;
      }
      
      console.log('Acknowledgment check:', { feedbackId: feedback.id, userId: user.id, hasData: !!data });
      setHasAcknowledged(!!data);
    } catch (error) {
      console.error('Error checking acknowledgment status:', error);
    }
  };

  // Update local state when feedback changes
  useEffect(() => {
    if (feedback) {
      setStatus(feedback.resolution_status);
      setPriority(feedback.priority);
      setAssignee(feedback.assignee || '');
      setCategory(feedback.complaint_category || '');
      setResolutionNotes(feedback.resolution_notes || '');
      setStoreNumber(feedback.store_number || '');
      setMarket(feedback.market || '');
      setCustomerCalled(feedback.customer_called || false);
      setEditedFeedbackText(feedback.feedback_text || '');
      
      // Set default email message
      setEmailMessage(`Dear ${feedback.customer_name || 'Valued Customer'},

Thank you for taking the time to share your feedback regarding your recent visit to our store #${feedback.store_number}.

We take all customer feedback seriously and are committed to providing excellent service. Your feedback helps us improve our operations and better serve our customers.

${feedback.feedback_text ? `We have reviewed your specific concern: "${feedback.feedback_text}"` : ''}

We would like to follow up with you to ensure your concerns are addressed. Please don't hesitate to contact us if you have any questions or would like to discuss this further.

Thank you for choosing us and giving us the opportunity to serve you better.

Best regards,
Customer Service Team`);
    }
  }, [feedback]);

  // Check acknowledgment when feedback or user changes
  useEffect(() => {
    if (feedback && user && isOpen) {
      checkAcknowledgmentStatus();
    } else if (!isOpen) {
      // Reset when dialog closes
      setHasAcknowledged(false);
    }
  }, [feedback?.id, user?.id, isOpen]);

  // Auto-mark as viewed and change status when dialog opens
  useEffect(() => {
    if (feedback && isOpen && feedback.id !== processedFeedbackId.current) {
      console.log('🔍 FEEDBACK DIALOG: Auto-update check', {
        feedbackId: feedback.id,
        currentStatus: feedback.resolution_status,
        isViewed: feedback.viewed,
        processedId: processedFeedbackId.current
      });

      const shouldUpdate = !feedback.viewed || feedback.resolution_status === 'unopened';
      
      if (shouldUpdate) {
        console.log('🔄 FEEDBACK DIALOG: Performing auto-update');
        
        // Mark this feedback as processed to prevent multiple updates
        processedFeedbackId.current = feedback.id;
        
        const updateFeedback = async () => {
          try {
            const updates: any = {
              viewed: true,
              updated_at: new Date().toISOString(),
            };

            // Only change status if it's currently 'unopened'
            if (feedback.resolution_status === 'unopened') {
              updates.resolution_status = 'opened';
              setStatus('opened');
            }

            const { error } = await supabase
              .from('customer_feedback')
              .update(updates)
              .eq('id', feedback.id);

            if (error) {
              console.error('❌ FEEDBACK DIALOG: Error auto-updating feedback:', error);
            } else {
              console.log('✅ FEEDBACK DIALOG: Auto-update successful');
            }
          } catch (error) {
            console.error('❌ FEEDBACK DIALOG: Exception during auto-update:', error);
          }
        };

        updateFeedback();
      } else {
        console.log('⏭️ FEEDBACK DIALOG: No auto-update needed');
      }
    }
  }, [feedback, isOpen]);

  // Reset processedFeedbackId when dialog closes
  useEffect(() => {
    if (!isOpen) {
      processedFeedbackId.current = null;
    }
  }, [isOpen]);

  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory);
    
    // Auto-assign based on the new category and current store/market
    if (feedback && storeNumber && market) {
      try {
        const newAssignee = await getAssigneeForFeedback(storeNumber, market, newCategory);
        setAssignee(newAssignee);
        
        toast({
          title: "Category Updated",
          description: `Category changed to ${newCategory}. Assignee updated to ${newAssignee}.`,
        });
      } catch (error) {
        console.error('Error auto-assigning:', error);
        toast({
          title: "Category Updated",
          description: `Category changed to ${newCategory}. Please manually set the assignee.`,
        });
      }
    }
  };

  const handleStoreNumberChange = async (newStoreNumber: string) => {
    setStoreNumber(newStoreNumber);
    
    if (newStoreNumber && newStoreNumber !== feedback?.store_number) {
      try {
        // Lookup market for the new store number
        const { data: storeData } = await supabase
          .from('stores')
          .select('region')
          .eq('store_number', newStoreNumber)
          .maybeSingle();

        if (storeData?.region) {
          const newMarket = storeData.region;
          setMarket(newMarket);
          
          // Auto-assign based on new store and category
          const newAssignee = await getAssigneeForFeedback(newStoreNumber, newMarket, category);
          setAssignee(newAssignee);
          
          toast({
            title: "Store Updated",
            description: `Updated to store ${newStoreNumber} in ${newMarket}. Assignee updated to ${newAssignee}.`,
          });
        } else {
          toast({
            title: "Store Not Found",
            description: `Store ${newStoreNumber} not found in database.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error looking up store:', error);
        toast({
          title: "Error",
          description: "Failed to lookup store information.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendOutreach = async () => {
    if (!feedback?.customer_email) {
      toast({
        title: "Error",
        description: "No customer email available for outreach.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTemplate === 'custom' && !emailMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requestBody: any = {
        feedbackId: feedback.id,
        method: 'email',
        templateType: selectedTemplate,
      };

      // Add custom message for custom template
      if (selectedTemplate === 'custom') {
        requestBody.messageContent = emailMessage;
      }

      // Add resolution-specific fields
      if (selectedTemplate === 'resolution') {
        requestBody.actionTaken = emailActionTaken;
        requestBody.resolutionNotes = emailResolutionNotes;
      }

      const { error } = await supabase.functions.invoke('send-customer-outreach', {
        body: requestBody
      });

      if (error) throw error;

      toast({
        title: "Outreach Email Sent",
        description: "Customer outreach email has been sent successfully.",
      });

      setShowEmailComposer(false);
      setEmailMessage("");
      setEmailActionTaken("");
      setEmailResolutionNotes("");
      onUpdate();
    } catch (error) {
      console.error('Error sending outreach:', error);
      toast({
        title: "Error",
        description: "Failed to send outreach email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    if (!feedback || !assignee || assignee === 'Unassigned') {
      toast({
        title: "Error",
        description: "Please assign this feedback to someone before testing notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the notification system
      await sendAssignmentNotification(feedback.id, assignee);
      
      toast({
        title: "Test Notification Sent",
        description: `Test notification emails sent for assignee: ${assignee}`,
      });
    } catch (error) {
      console.error('Error testing notifications:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notifications. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalledChange = async (checked: boolean) => {
    if (!feedback) return;
    
    setIsUpdatingCalled(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ customer_called: checked })
        .eq('id', feedback.id);

      if (error) throw error;

      setCustomerCalled(checked);
      toast({
        title: checked ? "Marked as Called" : "Unmarked as Called",
        description: checked ? "Customer has been marked as called." : "Customer call status cleared.",
      });
    } catch (error) {
      console.error('Error updating called status:', error);
      toast({
        title: "Error",
        description: "Failed to update called status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingCalled(false);
    }
  };

  const handleAcknowledgeCritical = async () => {
    if (!feedback) return;
    
    setIsLoading(true);
    try {
      // Get user role
      const userRole = permissions?.role?.toLowerCase();
      
      if (!userRole || !['dm', 'director', 'vp', 'ceo', 'admin'].includes(userRole)) {
        toast({
          title: "Error",
          description: "You don't have permission to acknowledge critical feedback.",
          variant: "destructive",
        });
        return;
      }

      // Insert approval record
      const { error } = await supabase
        .from('critical_feedback_approvals')
        .insert({
          feedback_id: feedback.id,
          approver_user_id: user?.id,
          approver_role: userRole,
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setHasAcknowledged(true);
      
      toast({
        title: "Critical Feedback Acknowledged",
        description: `You have acknowledged this critical feedback as ${userRole.toUpperCase()}.`,
      });
      
      // Re-check acknowledgment status after successful insert
      await checkAcknowledgmentStatus();
      onUpdate();
    } catch (error) {
      console.error('Error acknowledging critical feedback:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge critical feedback.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFeedbackText = async () => {
    if (!feedback) return;
    
    setIsUpdatingFeedbackText(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ 
          feedback_text: editedFeedbackText,
          updated_at: new Date().toISOString()
        })
        .eq('id', feedback.id);

      if (error) throw error;

      toast({
        title: "Feedback Updated",
        description: "Customer feedback text has been updated successfully.",
      });
      
      setIsEditingFeedbackText(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating feedback text:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback text.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingFeedbackText(false);
    }
  };

  const handleCancelEditFeedbackText = () => {
    setEditedFeedbackText(feedback?.feedback_text || '');
    setIsEditingFeedbackText(false);
  };

  const handleSave = async () => {
    if (!feedback) return;

    // Validate that resolution notes are required for resolved status
    if (status === 'resolved' && (!resolutionNotes || resolutionNotes.trim() === '')) {
      toast({
        title: "Resolution Notes Required",
        description: "Please add resolution notes before marking this feedback as resolved.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: status,
          priority: priority,
          assignee: assignee || null,
          complaint_category: category,
          resolution_notes: resolutionNotes || null,
          store_number: storeNumber,
          market: market,
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
          <DialogDescription>
            View and manage customer feedback details, status, and resolution notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-medium">
              Store #{storeNumber}
            </Badge>
            <Badge variant="secondary">{market}</Badge>
            <Badge 
              variant={status === 'resolved' ? 'default' : status === 'escalated' ? 'destructive' : 'secondary'}
            >
              {status}
            </Badge>
            <Badge variant="outline" className={`${
              priority === 'Critical' ? 'border-red-500 text-red-500' :
              priority === 'High' ? 'border-orange-500 text-orange-500' :
              priority === 'Medium' ? 'border-yellow-500 text-yellow-500' :
              priority === 'Low' ? 'border-blue-500 text-blue-500' :
              'border-green-500 text-green-500'
            }`}>
              {priority} Priority
            </Badge>
            {feedback.outreach_sent_at && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Mail className="h-3 w-3 mr-1" />
                Email Sent
              </Badge>
            )}
          </div>

          {/* Customer Outreach Section */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Customer Outreach
            </h3>
            
            {feedback.customer_email ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{feedback.customer_email}</span>
                </div>
                
                {feedback.outreach_sent_at ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Outreach sent:</span>
                      <span>{new Date(feedback.outreach_sent_at).toLocaleDateString()} at {new Date(feedback.outreach_sent_at).toLocaleTimeString()}</span>
                    </div>
                    {feedback.customer_response_sentiment && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Response sentiment:</span>
                        <Badge variant={
                          feedback.customer_response_sentiment === 'positive' ? 'default' :
                          feedback.customer_response_sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {feedback.customer_response_sentiment}
                        </Badge>
                      </div>
                    )}
                    <Button 
                      onClick={() => setShowEmailConversation(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Email Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {!showEmailComposer ? (
                        <>
                          <Button 
                            onClick={() => setShowEmailComposer(true)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Compose Email to Customer
                          </Button>
                          <Button 
                            onClick={() => setShowEmailConversation(true)}
                            variant="outline"
                            disabled={isLoading}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Conversation
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3 w-full">
                          {/* Template Selection */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                              <Label htmlFor="template-select">Email Template</Label>
                              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="acknowledgment">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-3 w-3" />
                                      Acknowledgment
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="praise">
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-3 w-3" />
                                      Praise Response
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="resolution">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3" />
                                      Resolution Update
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="escalation">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-3 w-3" />
                                      Escalation Notice
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      Custom Message
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Template-specific fields */}
                            {selectedTemplate === 'resolution' && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="action-taken">Action Taken</Label>
                                  <Textarea
                                    id="action-taken"
                                    value={emailActionTaken}
                                    onChange={(e) => setEmailActionTaken(e.target.value)}
                                    placeholder="Describe what action was taken..."
                                    rows={2}
                                    className="resize-none text-sm"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="resolution-notes">Resolution Notes</Label>
                                  <Textarea
                                    id="resolution-notes"
                                    value={emailResolutionNotes}
                                    onChange={(e) => setEmailResolutionNotes(e.target.value)}
                                    placeholder="Additional resolution details..."
                                    rows={2}
                                    className="resize-none text-sm"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Email Preview */}
                          <Card className="p-4 bg-muted/30 border-2">
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Preview
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium">Subject: </span>
                                <span className="text-muted-foreground">
                                  {selectedTemplate === 'acknowledgment' && `Thank you for your feedback - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'praise' && `Thank you for your kind words! - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'resolution' && `Resolution Update for Case #${feedback.case_number}`}
                                  {selectedTemplate === 'escalation' && `URGENT: Your feedback has been escalated - Case #${feedback.case_number}`}
                                  {selectedTemplate === 'custom' && `Regarding your feedback - Case #${feedback.case_number}`}
                                </span>
                              </div>
                              <Separator />
                              <div className="space-y-2 text-muted-foreground max-h-60 overflow-y-auto">
                                <p>Dear {feedback.customer_name || 'Valued Customer'},</p>
                                
                                {selectedTemplate === 'acknowledgment' && (
                                  <>
                                    <p>Thank you for taking the time to share your feedback with us. We have received your message and want to assure you that we take all customer feedback seriously.</p>
                                    <div className="bg-background/50 p-3 rounded border my-2">
                                      <p className="font-medium mb-1">Feedback Details:</p>
                                      <p className="text-xs">Case Number: {feedback.case_number}</p>
                                      <p className="text-xs">Store Number: {feedback.store_number}</p>
                                      <p className="text-xs">Date: {new Date(feedback.feedback_date).toLocaleDateString()}</p>
                                      <p className="text-xs">Category: {feedback.complaint_category}</p>
                                    </div>
                                    <p>{feedback.priority === 'Critical' || feedback.priority === 'High' 
                                      ? 'Your feedback has been marked as high priority and will be reviewed by our management team within 24 hours.'
                                      : 'We will review your feedback and respond appropriately based on the nature of your concerns.'
                                    }</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'praise' && (
                                  <>
                                    <p>Thank you so much for taking the time to share your positive experience with us! Feedback like yours truly makes our day and motivates our team to continue providing excellent service.</p>
                                    <p>We've shared your kind words with the team at Store #{feedback.store_number}. They will be thrilled to hear that their hard work made a positive impact on your visit.</p>
                                    <p>We look forward to serving you again soon!</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'resolution' && (
                                  <>
                                    <p>Thank you for bringing this matter to our attention. I wanted to update you on the resolution of your concern regarding your visit on {new Date(feedback.feedback_date).toLocaleDateString()}.</p>
                                    {emailActionTaken && (
                                      <div className="bg-background/50 p-3 rounded border my-2">
                                        <p className="font-medium mb-1">Action Taken:</p>
                                        <p className="text-xs">{emailActionTaken}</p>
                                      </div>
                                    )}
                                    {emailResolutionNotes && (
                                      <div className="bg-background/50 p-3 rounded border my-2">
                                        <p className="font-medium mb-1">Resolution Details:</p>
                                        <p className="text-xs">{emailResolutionNotes}</p>
                                      </div>
                                    )}
                                    <p>We appreciate your patience and understanding as we worked to address your concerns. If you have any questions about this resolution, please don't hesitate to reach out.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'escalation' && (
                                  <>
                                    <p className="font-medium text-orange-600">This message requires immediate attention.</p>
                                    <p>Your feedback regarding your visit on {new Date(feedback.feedback_date).toLocaleDateString()} has been escalated to our management team for immediate review and action.</p>
                                    <div className="bg-background/50 p-3 rounded border my-2">
                                      <p className="font-medium mb-1">Escalation Details:</p>
                                      <p className="text-xs">Case Number: {feedback.case_number}</p>
                                      <p className="text-xs">Store: #{feedback.store_number}</p>
                                      <p className="text-xs">Priority: {feedback.priority}</p>
                                    </div>
                                    <p>A member of our management team will contact you within 24 hours to discuss this matter and work towards a resolution.</p>
                                  </>
                                )}
                                
                                {selectedTemplate === 'custom' && emailMessage && (
                                  <p className="whitespace-pre-wrap">{emailMessage}</p>
                                )}
                                
                                {selectedTemplate === 'custom' && !emailMessage && (
                                  <p className="italic text-muted-foreground/60">Enter your custom message above to see the preview...</p>
                                )}
                                
                                <p className="pt-2 border-t mt-4">
                                  Best regards,<br />
                                  Customer Service Team<br />
                                  <a href="mailto:guestfeedback@atlaswe.com" className="text-primary underline">guestfeedback@atlaswe.com</a>
                                </p>
                              </div>
                            </div>
                          </Card>

                          {/* Custom Message (only for custom template) */}
                          {selectedTemplate === 'custom' && (
                            <div>
                              <Label htmlFor="emailMessage">Email Message</Label>
                              <Textarea 
                                id="emailMessage"
                                value={emailMessage}
                                onChange={(e) => setEmailMessage(e.target.value)}
                                placeholder="Write your message to the customer..."
                                rows={8}
                                className="mt-1"
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSendOutreach}
                              disabled={isLoading || (selectedTemplate === 'custom' && !emailMessage.trim())}
                              className="flex-1"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {isLoading ? "Sending..." : "Send Email"}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowEmailComposer(false)}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No customer email available for outreach.</p>
            )}
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span> {feedback.customer_name || 'Not provided'}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {feedback.customer_email || 'Not provided'}
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {feedback.customer_phone || 'Not provided'}
                  </div>
                  {feedback.customer_phone && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Checkbox
                        id="customer-called"
                        checked={customerCalled}
                        onCheckedChange={handleCalledChange}
                        disabled={isUpdatingCalled}
                      />
                      <label
                        htmlFor="customer-called"
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        Called Customer
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Case Number:</span> {feedback.case_number}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Feedback Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span> {new Date(feedback.feedback_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Channel:</span> {feedback.channel}
                </div>
                {feedback.rating && (
                  <div>
                    <span className="text-muted-foreground">Rating:</span> {feedback.rating}/5
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created:</span> {new Date(feedback.created_at).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback Text */}
          {feedback.feedback_text && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Customer Feedback
                {isAdmin && !isEditingFeedbackText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 ml-auto"
                    onClick={() => setIsEditingFeedbackText(true)}
                    title="Edit Feedback Text (Admin Only)"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </h3>
              
              {isEditingFeedbackText ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedFeedbackText}
                    onChange={(e) => setEditedFeedbackText(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isUpdatingFeedbackText}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveFeedbackText}
                      disabled={isUpdatingFeedbackText}
                    >
                      <Save className="h-3 w-3 mr-2" />
                      {isUpdatingFeedbackText ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditFeedbackText}
                      disabled={isUpdatingFeedbackText}
                    >
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded border">
                  {feedback.feedback_text}
                </p>
              )}
            </Card>
          )}

          {/* Editable Fields */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Resolution Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unopened">Unopened</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={!isAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Praise">Praise</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input 
                  id="assignee"
                  value={assignee} 
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-60 overflow-y-auto">
                      <SelectItem value="Sandwich Made Wrong">Sandwich Made Wrong</SelectItem>
                      <SelectItem value="Slow Service">Slow Service</SelectItem>
                      <SelectItem value="Rude Service">Rude Service</SelectItem>
                      <SelectItem value="Product Issue">Product Issue</SelectItem>
                      <SelectItem value="Closed Early">Closed Early</SelectItem>
                      <SelectItem value="Praise">Praise</SelectItem>
                      <SelectItem value="Missing Item">Missing Item</SelectItem>
                      <SelectItem value="Credit Card Issue">Credit Card Issue</SelectItem>
                      <SelectItem value="Bread Quality">Bread Quality</SelectItem>
                      <SelectItem value="Out of Product">Out of Product</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="Possible Food Poisoning">Possible Food Poisoning</SelectItem>
                      <SelectItem value="Loyalty Program Issues">Loyalty Program Issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeNumber">Store Number</Label>
                  <Input 
                    id="storeNumber"
                    value={storeNumber} 
                    onChange={(e) => handleStoreNumberChange(e.target.value)}
                    placeholder="Enter store number"
                  />
                </div>
                <div>
                  <Label htmlFor="market">Market</Label>
                  <Input 
                    id="market"
                    value={market} 
                    onChange={(e) => setMarket(e.target.value)}
                    placeholder="Market (auto-filled)"
                    disabled
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Resolution Notes</Label>
              <MentionsTextarea 
                id="notes"
                value={resolutionNotes} 
                onChange={setResolutionNotes}
                placeholder="Enter resolution notes... Use @username to mention someone"
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {feedback?.priority === 'Critical' && ['dm', 'director', 'vp', 'ceo', 'admin'].includes(permissions?.role?.toLowerCase() || '') && (
            <Button 
              variant="default"
              onClick={handleAcknowledgeCritical} 
              disabled={isLoading || hasAcknowledged}
              className={hasAcknowledged ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {hasAcknowledged ? "Acknowledged" : (isLoading ? "Acknowledging..." : "Acknowledge Critical Feedback")}
            </Button>
          )}
          {isAdmin && (
            <Button 
              variant="secondary" 
              onClick={handleTestNotifications} 
              disabled={isLoading || !assignee || assignee === 'Unassigned'}
            >
              {isLoading ? "Testing..." : "🧪 Test Notifications"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Email Conversation Dialog */}
      {feedback?.customer_email && (
        <EmailConversationDialog
          feedbackId={feedback.id}
          customerEmail={feedback.customer_email}
          customerName={feedback.customer_name || feedback.customer_email}
          isOpen={showEmailConversation}
          onOpenChange={setShowEmailConversation}
        />
      )}
    </Dialog>
  );
};