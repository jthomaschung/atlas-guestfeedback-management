import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface AccuracyTrendsChartProps {
  feedbacks: CustomerFeedback[];
  timeRange: "7days" | "30days" | "90days";
}

export function AccuracyTrendsChart({ feedbacks, timeRange }: AccuracyTrendsChartProps) {
  const chartData = useMemo(() => {
    const groupedByDate: Record<string, { missingItems: number; sandwichWrong: number }> = {};

    feedbacks.forEach((feedback) => {
      const date = new Date(feedback.feedback_date).toISOString().split('T')[0];
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = { missingItems: 0, sandwichWrong: 0 };
      }

      if (feedback.complaint_category === "Missing item") {
        groupedByDate[date].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        groupedByDate[date].sandwichWrong += 1;
      }
    });

    // Sort by date and format for chart
    return Object.entries(groupedByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Missing Items": counts.missingItems,
        "Sandwich Made Wrong": counts.sandwichWrong,
      }));
  }, [feedbacks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Accuracy Issues Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Missing Items" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))" }}
            />
            <Line 
              type="monotone" 
              dataKey="Sandwich Made Wrong" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
