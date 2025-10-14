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
      // Send with weekOffset=0 to get current week's data for testing
      const { data, error } = await supabase.functions.invoke('send-weekly-performance-summary', {
        body: { weekOffset: 0 } // 0 = current week, 1 = last week
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test weekly summary sent for THIS WEEK's data! Check Slack DMs.",
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
