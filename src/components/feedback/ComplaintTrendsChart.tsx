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
  periodId: string;
  startDate: string;
  endDate: string;
}

interface ComplaintTrendsChartProps {
  className?: string;
}

const chartConfig = {
  rudeService: {
    label: "Rude Service",
    color: "hsl(var(--destructive))",
  },
  sandwichMadeWrong: {
    label: "Sandwich Made Wrong",
    color: "hsl(var(--warning))",
  },
  missingItem: {
    label: "Missing Item", 
    color: "hsl(var(--info))",
  },
};

export function ComplaintTrendsChart({ className }: ComplaintTrendsChartProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      setLoading(true);

      // First get all periods for 2025
      const { data: periods, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (periodsError) {
        console.error('Error fetching periods:', periodsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load period data"
        });
        return;
      }

      // Get complaint data for the target categories
      const { data: complaints, error: complaintsError } = await supabase
        .from('customer_feedback')
        .select('feedback_date, complaint_category')
        .in('complaint_category', ['Rude Service', 'Sandwich Made Wrong', 'Missing Item']);

      if (complaintsError) {
        console.error('Error fetching complaints:', complaintsError);
        toast({
          variant: "destructive", 
          title: "Error",
          description: "Failed to load complaint data"
        });
        return;
      }

      // Process the data to create trend chart data
      const processedData: TrendData[] = periods.map(period => {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);

        // Count complaints for each category in this period
        const periodComplaints = complaints.filter(complaint => {
          const complaintDate = new Date(complaint.feedback_date);
          return complaintDate >= periodStart && complaintDate <= periodEnd;
        });

        const rudeService = periodComplaints.filter(c => c.complaint_category === 'Rude Service').length;
        const sandwichMadeWrong = periodComplaints.filter(c => c.complaint_category === 'Sandwich Made Wrong').length;
        const missingItem = periodComplaints.filter(c => c.complaint_category === 'Missing Item').length;

        return {
          periodName: period.name,
          rudeService,
          sandwichMadeWrong,
          missingItem,
          periodId: period.id,
          startDate: period.start_date,
          endDate: period.end_date
        };
      });

      setTrendData(processedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to load trend data"
      });
    } finally {
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
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}