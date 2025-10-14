import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TestDailySummary() {
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const { toast } = useToast();

  const sendTestDailySummary = async () => {
    setIsLoadingDaily(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-summary', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test daily summary has been sent! Check Slack DMs.",
      });
    } catch (error: any) {
      console.error('Error sending test summary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test summary",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const sendTestWeeklySummary = async () => {
    setIsLoadingWeekly(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-weekly-performance-summary', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test weekly summary has been sent! Check Slack DMs for all managers.",
      });
    } catch (error: any) {
      console.error('Error sending weekly summary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send weekly summary",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={sendTestDailySummary} 
        disabled={isLoadingDaily}
        variant="outline"
      >
        {isLoadingDaily ? "Sending..." : "Test Daily Summary"}
      </Button>
      <Button 
        onClick={sendTestWeeklySummary} 
        disabled={isLoadingWeekly}
        variant="outline"
      >
        {isLoadingWeekly ? "Sending..." : "Test Weekly Summary"}
      </Button>
    </div>
  );
}
