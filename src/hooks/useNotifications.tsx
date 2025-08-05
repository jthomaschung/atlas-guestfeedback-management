import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const { toast } = useToast();

  const sendCompletionNotification = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'completion',
          workOrderId
        }
      });

      if (error) {
        console.error('Error sending completion notification:', error);
        toast({
          title: "Notification Error",
          description: "Failed to send completion notification",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Notifications Sent",
        description: `Completion notification sent to ${data?.recipients || 0} recipients`,
      });
    } catch (error) {
      console.error('Error sending completion notification:', error);
      toast({
        title: "Notification Error",
        description: "Failed to send completion notification",
        variant: "destructive"
      });
    }
  };

  const sendTaggedNotification = async (workOrderId: string, taggedDisplayName: string, note: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'note_tagged',
          workOrderId,
          taggedDisplayName,
          note
        }
      });

      if (error) {
        console.error('Error sending tagged notification:', error);
        toast({
          title: "Notification Error",
          description: "Failed to send tagged notification",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Tag Notification Sent",
        description: "Tagged user has been notified",
      });
    } catch (error) {
      console.error('Error sending tagged notification:', error);
      toast({
        title: "Notification Error",
        description: "Failed to send tagged notification",
        variant: "destructive"
      });
    }
  };

  return {
    sendCompletionNotification,
    sendTaggedNotification
  };
};