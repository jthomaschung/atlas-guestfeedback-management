import { useState, useEffect, useRef } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar, User, Star, MapPin, Phone, Mail, MessageSquare, Clock, AlertTriangle, Store } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPermissions } from "@/hooks/useUserPermissions";
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
  const { toast } = useToast();
  const { permissions, loading: permissionsLoading } = useUserPermissions();
  const processedFeedbackId = useRef<string | null>(null);

  const isAdmin = permissions?.role?.toLowerCase() === 'admin' || permissions?.role?.toLowerCase() === 'dm' || permissions?.isAdmin;

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

    if (!emailMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-customer-outreach', {
        body: {
          feedbackId: feedback.id,
          method: 'email',
          messageContent: emailMessage
        }
      });

      if (error) throw error;

      toast({
        title: "Outreach Email Sent",
        description: "Customer outreach email has been sent successfully.",
      });

      setShowEmailComposer(false);
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
          {isAdmin && (
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
                             <div className="flex gap-2">
                               <Button 
                                 onClick={handleSendOutreach}
                                 disabled={isLoading || !emailMessage.trim()}
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
          )}

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
                <div>
                  <span className="text-muted-foreground">Phone:</span> {feedback.customer_phone || 'Not provided'}
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
              </h3>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded border">
                {feedback.feedback_text}
              </p>
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
                  <Input 
                    id="category"
                    value={category} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    placeholder="Enter category"
                  />
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
              <Textarea 
                id="notes"
                value={resolutionNotes} 
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution notes..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
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