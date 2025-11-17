import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrendData {
  periodName: string;
  rudeService: number;
  sandwichMadeWrong: number;
  missingItem: number;
  praise: number;
  periodId: string;
  startDate: string;
  endDate: string;
}

interface ComplaintTrendsChartProps {
  className?: string;
  feedbacks?: any[];
  periods?: Array<{ id: string; name: string; start_date: string; end_date: string; period_number?: number; year?: number }>;
}

const chartConfig = {
  rudeService: {
    label: "Rude Service",
    color: "#ef4444",
  },
  sandwichMadeWrong: {
    label: "Sandwich Made Wrong",
    color: "#f59e0b",
  },
  missingItem: {
    label: "Missing Item", 
    color: "#3b82f6",
  },
  praise: {
    label: "Praise",
    color: "#10b981",
  },
};

export function ComplaintTrendsChart({ className, feedbacks = [], periods = [] }: ComplaintTrendsChartProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalPeriods, setInternalPeriods] = useState<Array<{ id: string; name: string; start_date: string; end_date: string; period_number?: number; year?: number }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (periods.length === 0) {
      fetchPeriods();
    } else {
      setInternalPeriods(periods);
    }
  }, [periods]);

  useEffect(() => {
    if (feedbacks.length > 0 && internalPeriods.length > 0) {
      // Use provided filtered feedbacks
      processData(feedbacks, internalPeriods);
    } else if (periods.length > 0 && internalPeriods.length > 0) {
      // Periods provided but no feedbacks, fetch all feedbacks
      fetchAllTrendData();
    } else if (feedbacks.length === 0 && internalPeriods.length === 0) {
      // Nothing provided, fetch everything
      fetchAllTrendData();
    }
  }, [feedbacks, internalPeriods]);

  const fetchPeriods = async () => {
    try {
      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (periodsError) throw periodsError;
      setInternalPeriods(periodsData || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const processData = (complaints: any[], periodsToUse: any[]) => {
    try {
      setLoading(true);
      
      const processedData: TrendData[] = periodsToUse.map(period => {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);

        const periodComplaints = complaints.filter(complaint => {
          const complaintDate = new Date(complaint.feedback_date);
          return complaintDate >= periodStart && complaintDate <= periodEnd;
        });

        const rudeService = periodComplaints.filter(c => c.complaint_category?.toLowerCase().includes('rude service')).length;
        const sandwichMadeWrong = periodComplaints.filter(c => c.complaint_category?.toLowerCase().includes('sandwich made wrong')).length;
        const missingItem = periodComplaints.filter(c => c.complaint_category?.toLowerCase().includes('missing item')).length;
        const praise = periodComplaints.filter(c => {
          const cat = c.complaint_category?.toLowerCase();
          return cat?.includes('praise') || cat?.includes('rockstar service');
        }).length;

        return {
          periodName: period.name,
          rudeService,
          sandwichMadeWrong,
          missingItem,
          praise,
          periodId: period.id,
          startDate: period.start_date,
          endDate: period.end_date
        };
      });

      setTrendData(processedData);
    } catch (error) {
      console.error('Error processing trend data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process trend data"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTrendData = async () => {
    try {
      setLoading(true);

      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (periodsError) throw periodsError;

      const { data: complaints, error: complaintsError } = await supabase
        .from('customer_feedback')
        .select('feedback_date, complaint_category')
        .or('complaint_category.ilike.%rude service%,complaint_category.ilike.%sandwich made wrong%,complaint_category.ilike.%missing item%,complaint_category.ilike.%praise%,complaint_category.ilike.%rockstar service%');

      if (complaintsError) throw complaintsError;

      processData(complaints || [], periodsData || []);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to load trend data"
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading trends...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Complaint Trends Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track complaint patterns across 4-week periods for key service issues
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="periodName" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="rudeService"
                stroke="var(--color-rudeService)"
                strokeWidth={2}
                dot={{ fill: "var(--color-rudeService)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="sandwichMadeWrong"
                stroke="var(--color-sandwichMadeWrong)"
                strokeWidth={2}
                dot={{ fill: "var(--color-sandwichMadeWrong)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="missingItem"
                stroke="var(--color-missingItem)"
                strokeWidth={2}
                dot={{ fill: "var(--color-missingItem)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="praise"
                stroke="var(--color-praise)"
                strokeWidth={2}
                dot={{ fill: "var(--color-praise)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}