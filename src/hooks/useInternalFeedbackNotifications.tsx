import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInternalFeedbackNotifications = () => {
  const { toast } = useToast();

  const sendStatusChangeNotification = async (
    feedbackId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> => {
    try {
      console.log(
        `Sending internal feedback status change notification: ${feedbackId} (${oldStatus} -> ${newStatus})`
      );

      const { data, error } = await supabase.functions.invoke(
        "send-internal-feedback-notification",
        {
          body: {
            feedbackId,
            oldStatus,
            newStatus,
          },
        }
      );

      if (error) {
        console.error("Error sending notification:", error);
        // Don't show error toast - notification failure shouldn't block the UI
        return;
      }

      console.log("Notification sent successfully:", data);
    } catch (error) {
      console.error("Error in sendStatusChangeNotification:", error);
      // Silent fail - notification is a nice-to-have, not critical
    }
  };

  return {
    sendStatusChangeNotification,
  };
};
