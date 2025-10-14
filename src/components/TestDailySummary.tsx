import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TestDailySummary() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendTestSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-summary', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test daily summary has been sent! Check Slack DMs for jchung@atlaswe.com and atambunan@atlaswe.com",
      });
    } catch (error: any) {
      console.error('Error sending test summary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test summary",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={sendTestSummary} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? "Sending..." : "Send Test Daily Summary"}
    </Button>
  );
}
