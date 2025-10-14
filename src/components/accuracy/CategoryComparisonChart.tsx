import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface CategoryComparisonChartProps {
  feedbacks: CustomerFeedback[];
}

export function CategoryComparisonChart({ feedbacks }: CategoryComparisonChartProps) {
  const chartData = useMemo(() => {
    const byMarket: Record<string, { missingItems: number; sandwichWrong: number }> = {};

    feedbacks.forEach((feedback) => {
      const market = feedback.market || "Unknown";
      
      if (!byMarket[market]) {
        byMarket[market] = { missingItems: 0, sandwichWrong: 0 };
      }

      if (feedback.complaint_category === "Missing item") {
        byMarket[market].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        byMarket[market].sandwichWrong += 1;
      }
    });

    return Object.entries(byMarket)
      .map(([market, counts]) => ({
        market,
        "Missing Items": counts.missingItems,
        "Sandwich Made Wrong": counts.sandwichWrong,
        total: counts.missingItems + counts.sandwichWrong,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 markets
  }, [feedbacks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Category Breakdown by Market
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="market" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Missing Items" fill="hsl(var(--destructive))" />
            <Bar dataKey="Sandwich Made Wrong" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
