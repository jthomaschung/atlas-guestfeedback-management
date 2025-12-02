import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFeedbackNotifications() {
  const { toast } = useToast();

  const sendAssignmentNotification = async (feedbackId: string, assigneeEmail: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-feedback-notification', {
        body: {
          feedbackId,
          assigneeEmail
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast({
          variant: "destructive",
          title: "Notification Error",
          description: "Failed to send assignment notification email.",
        });
        return;
      }

      toast({
        title: "Notification Sent",
        description: `Assignment notification sent to ${assigneeEmail}`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: "destructive",
        title: "Notification Error",
        description: "Failed to send assignment notification email.",
      });
    }
  };

  const sendTaggedSlackNotification = async (feedbackId: string, taggedDisplayName: string, note: string, taggerUserId?: string) => {
    try {
      console.log('🏷️ Sending tagged notification:', { feedbackId, taggedDisplayName, taggerUserId, notePreview: note.substring(0, 50) });
      
      const { data, error } = await supabase.functions.invoke('send-feedback-slack-notification', {
        body: {
          type: 'tagged',
          feedbackId,
          taggedDisplayName,
          taggerUserId,
          note
        }
      });

      if (error) {
        console.error('❌ Error sending tagged Slack notification:', error);
        return;
      }

      console.log('✅ Tagged Slack notification response:', data);
    } catch (error) {
      console.error('❌ Error sending tagged Slack notification:', error);
    }
  };

  return {
    sendAssignmentNotification,
    sendTaggedSlackNotification
  };
}