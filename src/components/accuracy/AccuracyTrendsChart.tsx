import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Period } from "@/types/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface AccuracyTrendsChartProps {
  feedbacks: CustomerFeedback[];
  periods: Period[];
  selectedPeriod: string | null;
}

export function AccuracyTrendsChart({ feedbacks, periods, selectedPeriod }: AccuracyTrendsChartProps) {
  const chartData = useMemo(() => {
    if (!periods.length) return [];

    // Group all feedback by period
    const periodData = periods.map(period => {
      const periodFeedbacks = feedbacks.filter(fb => {
        const feedbackDate = new Date(fb.feedback_date);
        return feedbackDate >= new Date(period.start_date) &&
               feedbackDate <= new Date(period.end_date);
      });

      const missingItems = periodFeedbacks.filter(
        fb => fb.complaint_category === "Missing item"
      ).length;

      const sandwichWrong = periodFeedbacks.filter(
        fb => fb.complaint_category === "Sandwich Made Wrong"
      ).length;

      return {
        periodName: period.name,
        missingItems: missingItems,
        sandwichWrong: sandwichWrong,
      };
    });

    const result = periodData.reverse(); // Show oldest to newest
    console.log("Chart data:", result);
    return result;
  }, [feedbacks, periods]);

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
              dataKey="periodName" 
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
              dataKey="missingItems" 
              name="Missing Items"
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--destructive))", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="sandwichWrong" 
              name="Sandwich Made Wrong"
              stroke="hsl(var(--chart-2))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
