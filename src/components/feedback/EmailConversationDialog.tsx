import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Mail, Reply, MessageSquare, AlertTriangle, Heart, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EmailMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  message_content: string;
  sent_at: string;
  from_email: string;
  to_email: string;
  subject: string;
  delivery_status?: string;
}

interface EmailConversationDialogProps {
  feedbackId: string;
  customerEmail: string;
  customerName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  feedback?: any; // Full feedback object for template selection
}

export function EmailConversationDialog({
  feedbackId,
  customerEmail,
  customerName,
  isOpen,
  onOpenChange,
  feedback,
}: EmailConversationDialogProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [customerReplyContent, setCustomerReplyContent] = useState("");
  const [showAddCustomerReply, setShowAddCustomerReply] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('acknowledgment');
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Auto-select template based on feedback category
  useEffect(() => {
    if (feedback?.complaint_category) {
      const category = feedback.complaint_category.toLowerCase();
      
      if (category === 'praise' || category === 'rockstar service') {
        setSelectedTemplate('praise');
      } else if (category === 'slow service') {
        setSelectedTemplate('slow_service');
      } else if (category === 'sandwich made wrong') {
        setSelectedTemplate('sandwich_wrong');
      } else if (category === 'missing item') {
        setSelectedTemplate('missing_item');
      } else if (category.includes('bread')) {
        setSelectedTemplate('bread_quality');
      } else if (category.includes('product quality')) {
        setSelectedTemplate('product_quality');
      } else if (category.includes('out of product') && category.includes('bread')) {
        setSelectedTemplate('out_of_bread');
      } else if (category.includes('out of product')) {
        setSelectedTemplate('out_of_product');
      } else if (category.includes('closed early')) {
        setSelectedTemplate('closed_early');
      } else if (category.includes('credit card')) {
        setSelectedTemplate('credit_card');
      } else if (category.includes('cleanliness')) {
        setSelectedTemplate('cleanliness');
      } else if (category.includes('loyalty')) {
        setSelectedTemplate('loyalty_issues');
      } else if (category.includes('food poisoning')) {
        setSelectedTemplate('food_poisoning');
      } else {
        setSelectedTemplate('acknowledgment');
      }
    }
  }, [feedback]);

  useEffect(() => {
    if (isOpen && feedbackId) {
      loadEmailConversation();
    }
  }, [isOpen, feedbackId]);

  const loadEmailConversation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_outreach_log')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedMessages: EmailMessage[] = (data || []).map(msg => ({
        id: msg.id,
        direction: msg.direction as 'inbound' | 'outbound',
        message_content: msg.message_content || '',
        sent_at: msg.sent_at,
        from_email: msg.from_email || '',
        to_email: msg.to_email || '',
        subject: msg.subject || '',
        delivery_status: msg.delivery_status || undefined,
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading email conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load email conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() && selectedTemplate !== 'custom') {
      // For templates other than custom, we don't require custom content
    } else if (selectedTemplate === 'custom' && !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Prepare the request body based on template selection
      const requestBody: any = {
        feedbackId,
        method: 'email',
        templateType: selectedTemplate,
      };

      // Add custom message content if provided
      if (replyContent.trim()) {
        requestBody.messageContent = replyContent;
      }

      // Add template-specific data
      if (selectedTemplate === 'resolution') {
        requestBody.resolutionNotes = resolutionNotes;
        requestBody.actionTaken = actionTaken;
      }

      // Call the send-customer-outreach function
      const { data, error } = await supabase.functions.invoke('send-customer-outreach', {
        body: requestBody,
      });

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the customer",
      });

      setReplyContent("");
      setResolutionNotes("");
      setActionTaken("");
      loadEmailConversation(); // Reload to show the new message
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const addCustomerReply = async () => {
    if (!customerReplyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter the customer's reply",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Add the customer reply directly to the outreach log
      const { error } = await supabase
        .from('customer_outreach_log')
        .insert({
          feedback_id: feedbackId,
          direction: 'inbound',
          outreach_method: 'email',
          message_content: customerReplyContent,
          from_email: customerEmail,
          to_email: 'guestfeedback@atlaswe.com',
          subject: `Re: Feedback Response`,
          delivery_status: 'received',
          sent_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update the feedback record to indicate customer responded
      await supabase
        .from('customer_feedback')
        .update({
          customer_responded_at: new Date().toISOString(),
          customer_response_sentiment: 'neutral',
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId);

      toast({
        title: "Customer Reply Added",
        description: "The customer's reply has been added to the conversation",
      });

      setCustomerReplyContent("");
      setShowAddCustomerReply(false);
      loadEmailConversation(); // Reload to show the new message
    } catch (error) {
      console.error('Error adding customer reply:', error);
      toast({
        title: "Error",
        description: "Failed to add customer reply",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'praise': return <Heart className="w-4 h-4" />;
      case 'escalation': return <AlertTriangle className="w-4 h-4" />;
      case 'resolution': return <CheckCircle className="w-4 h-4" />;
      case 'custom': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? <Mail className="w-4 h-4" /> : <Send className="w-4 h-4" />;
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'inbound' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Conversation with {customerName || customerEmail}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Email conversation history */}
          <ScrollArea className="flex-1 border rounded-lg p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Send the first email to start a conversation.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div className={`p-4 rounded-lg border ${getDirectionColor(message.direction)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getDirectionIcon(message.direction)}
                          <Badge variant={message.direction === 'inbound' ? 'default' : 'secondary'}>
                            {message.direction === 'inbound' ? 'From Customer' : 'To Customer'}
                          </Badge>
                          {message.delivery_status && message.direction === 'outbound' && (
                            <Badge variant={message.delivery_status === 'delivered' ? 'default' : 'destructive'}>
                              {message.delivery_status}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(message.sent_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>

                      <div className="text-sm mb-2">
                        <div><strong>From:</strong> {message.from_email}</div>
                        <div><strong>To:</strong> {message.to_email}</div>
                        {message.subject && <div><strong>Subject:</strong> {message.subject}</div>}
                      </div>

                      <div className="whitespace-pre-wrap">
                        {message.message_content}
                      </div>
                    </div>
                    {index < messages.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Template Selection and Reply composition */}
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4" />
                <span className="text-sm font-medium">Send Reply</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCustomerReply(!showAddCustomerReply)}
              >
                {showAddCustomerReply ? 'Cancel' : 'Add Customer Reply'}
              </Button>
            </div>

            {showAddCustomerReply && (
              <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Add Customer's Reply Manually</span>
                </div>
                <Textarea
                  value={customerReplyContent}
                  onChange={(e) => setCustomerReplyContent(e.target.value)}
                  placeholder={`Enter the customer's reply here...`}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddCustomerReply(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addCustomerReply} disabled={isSending || !customerReplyContent.trim()}>
                    Add Reply
                  </Button>
                </div>
              </div>
            )}

            {/* Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="template-select">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acknowledgment">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('acknowledgment')}
                        Acknowledgment
                      </div>
                    </SelectItem>
                    <SelectItem value="slow_service">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('slow_service')}
                        Slow Service
                      </div>
                    </SelectItem>
                    <SelectItem value="sandwich_wrong">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('sandwich_wrong')}
                        Sandwich Made Wrong
                      </div>
                    </SelectItem>
                    <SelectItem value="missing_item">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('missing_item')}
                        Missing Item
                      </div>
                    </SelectItem>
                    <SelectItem value="bread_quality">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('bread_quality')}
                        Bread Quality
                      </div>
                    </SelectItem>
                    <SelectItem value="product_quality">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('product_quality')}
                        Product Quality
                      </div>
                    </SelectItem>
                    <SelectItem value="out_of_bread">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('out_of_bread')}
                        Out of Bread
                      </div>
                    </SelectItem>
                    <SelectItem value="out_of_product">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('out_of_product')}
                        Out of Product
                      </div>
                    </SelectItem>
                    <SelectItem value="closed_early">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('closed_early')}
                        Closed Early
                      </div>
                    </SelectItem>
                    <SelectItem value="praise">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('praise')}
                        Praise
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('credit_card')}
                        Credit Card Issue
                      </div>
                    </SelectItem>
                    <SelectItem value="cleanliness">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('cleanliness')}
                        Cleanliness
                      </div>
                    </SelectItem>
                    <SelectItem value="loyalty_issues">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('loyalty_issues')}
                        Loyalty Program Issues
                      </div>
                    </SelectItem>
                    <SelectItem value="food_poisoning">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('food_poisoning')}
                        Possible Food Poisoning
                      </div>
                    </SelectItem>
                    <SelectItem value="resolution">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('resolution')}
                        Resolution Update
                      </div>
                    </SelectItem>
                    <SelectItem value="escalation">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('escalation')}
                        Escalation Notice
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        {getTemplateIcon('custom')}
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
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="Describe what action was taken..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution-notes">Resolution Notes</Label>
                    <Textarea
                      id="resolution-notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Additional resolution details..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Custom message area - only show for custom template or if user wants to add personal note */}
            <div className="space-y-2">
              <Label htmlFor="reply-content">
                {selectedTemplate === 'custom' ? 'Custom Message' : 'Additional Personal Note (Optional)'}
              </Label>
              <Textarea
                id="reply-content"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={
                  selectedTemplate === 'custom' 
                    ? `Write your custom message to ${customerName || customerEmail}...`
                    : `Add a personal note to the template message...`
                }
                rows={selectedTemplate === 'custom' ? 6 : 3}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={sendReply} disabled={isSending || (selectedTemplate === 'custom' && !replyContent.trim())}>
                {isSending ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send {selectedTemplate === 'custom' ? 'Custom Message' : 'Template Email'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}