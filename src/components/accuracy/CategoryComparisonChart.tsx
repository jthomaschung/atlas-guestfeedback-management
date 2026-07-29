import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface CategoryComparisonChartProps {
  feedbacks: CustomerFeedback[];
}

// District mapping based on market
const marketToDistrict: Record<string, string> = {
  'AZ 1': 'West Coast',
  'AZ 2': 'West Coast',
  'AZ 3': 'West Coast',
  'AZ 4': 'West Coast',
  'AZ 5': 'West Coast',
  'IE/LA': 'West Coast',
  'OC': 'West Coast',
  'NE 1': 'Mid West',
  'NE 2': 'Mid West',
  'NE 3': 'Mid West',
  'NE 4': 'Mid West',
  'FL 1': 'East Region',
  'FL 2': 'East Region',
  'MN 1': 'East Region',
  'MN 2': 'East Region',
  'PA 1': 'East Region',
};

const getDistrict = (market: string): string => {
  return marketToDistrict[market] || 'Other';
};

export function CategoryComparisonChart({ feedbacks }: CategoryComparisonChartProps) {
  const chartData = useMemo(() => {
    const byMarket: Record<string, { missingItems: number; sandwichWrong: number; orderAccuracy: number }> = {};

    feedbacks.forEach((feedback) => {
      const market = feedback.market;
      
      if (!byMarket[market]) {
        byMarket[market] = { missingItems: 0, sandwichWrong: 0, orderAccuracy: 0 };
      }

      const category = feedback.complaint_category?.toLowerCase() ?? '';
      const type = feedback.type_of_feedback?.toLowerCase() ?? '';

      if (category.includes('missing item')) {
        byMarket[market].missingItems += 1;
      } else if (category.includes('sandwich made wrong')) {
        byMarket[market].sandwichWrong += 1;
      } else if (category.includes('order accuracy') || type.includes('order accuracy')) {
        byMarket[market].orderAccuracy += 1;
      }
    });

    return Object.entries(byMarket)
      .map(([market, counts]) => ({
        market,
        "Missing Items": counts.missingItems,
        "Sandwich Made Wrong": counts.sandwichWrong,
        "Order Accuracy": counts.orderAccuracy,
        total: counts.missingItems + counts.sandwichWrong + counts.orderAccuracy,
      }))
      .sort((a, b) => b.total - a.total);
  }, [feedbacks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Category Breakdown by District
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
            <Bar dataKey="Missing Items" fill="hsl(var(--destructive))" stackId="a" />
            <Bar dataKey="Sandwich Made Wrong" fill="hsl(var(--foreground))" stackId="a" />
            <Bar dataKey="Order Accuracy" fill="hsl(var(--primary))" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
