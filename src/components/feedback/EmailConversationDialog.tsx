import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, Reply } from "lucide-react";
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
}

export function EmailConversationDialog({
  feedbackId,
  customerEmail,
  customerName,
  isOpen,
  onOpenChange,
}: EmailConversationDialogProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [customerReplyContent, setCustomerReplyContent] = useState("");
  const [showAddCustomerReply, setShowAddCustomerReply] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Call the send-customer-outreach function
      const { data, error } = await supabase.functions.invoke('send-customer-outreach', {
        body: {
          feedbackId,
          method: 'email',
          messageContent: replyContent,
        },
      });

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the customer",
      });

      setReplyContent("");
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

          {/* Reply composition */}
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

            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Write your reply to ${customerName || customerEmail}...`}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={sendReply} disabled={isSending || !replyContent.trim()}>
                {isSending ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
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