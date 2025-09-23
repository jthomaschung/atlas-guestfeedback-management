import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Send, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { parseEmailContent } from '@/utils/emailParser';

interface OutreachMessage {
  id: string;
  feedback_id: string;
  direction: 'inbound' | 'outbound';
  outreach_method: string;
  message_content: string;
  from_email: string;
  to_email: string;
  subject: string;
  sent_at: string;
  delivery_status: string;
  response_sentiment?: string;
  email_message_id?: string;
  email_thread_id?: string;
}

interface EmailConversationViewProps {
  feedbackId: string;
  customerEmail: string;
  customerName: string;
  caseNumber: string;
}

export function EmailConversationView({ 
  feedbackId, 
  customerEmail, 
  customerName, 
  caseNumber 
}: EmailConversationViewProps) {
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubject, setReplySubject] = useState(`Re: Thank you for your feedback - Case #${caseNumber}`);
  const { toast } = useToast();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_outreach_log')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as OutreachMessage[]);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-customer-outreach', {
        body: {
          feedbackId,
          method: 'email',
          messageContent: replyContent,
          templateType: 'custom',
          customSubject: replySubject
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply sent successfully"
      });

      setReplyContent('');
      await loadMessages(); // Reload to show the new message

    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('outreach-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_outreach_log',
          filter: `feedback_id=eq.${feedbackId}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [feedbackId]);

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    
    const variants = {
      positive: 'default',
      negative: 'destructive', 
      neutral: 'secondary'
    } as const;

    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || 'secondary'}>
        {sentiment}
      </Badge>
    );
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? 
      <ArrowDown className="h-4 w-4 text-green-600" /> : 
      <ArrowUp className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Conversation</h3>
          <p className="text-sm text-muted-foreground">
            {customerName} ({customerEmail})
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMessages}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Message History */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`${message.direction === 'inbound' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDirectionIcon(message.direction)}
                  <span className="font-medium">
                    {message.direction === 'inbound' ? 'Customer Reply' : 'Our Response'}
                  </span>
                  {getSentimentBadge(message.response_sentiment)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(message.sent_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {message.subject && (
                <p className="text-sm font-medium text-muted-foreground">
                  Subject: {message.subject}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap">
                {parseEmailContent(message.message_content, message.direction)}
              </div>
              {message.delivery_status && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {message.delivery_status}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No conversation history yet
          </div>
        )}
      </div>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reply-subject">Subject</Label>
            <Input
              id="reply-subject"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          
          <div>
            <Label htmlFor="reply-content">Message</Label>
            <Textarea
              id="reply-content"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply here..."
              rows={6}
            />
          </div>

          <Button 
            onClick={sendReply} 
            disabled={sending || !replyContent.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Reply'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}