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
  'FL 1': 'South East',
  'FL 2': 'South East',
  'MN 1': 'North East',
  'MN 2': 'North East',
  'PA 1': 'North East',
};

const getDistrict = (market: string): string => {
  return marketToDistrict[market] || 'Other';
};

export function CategoryComparisonChart({ feedbacks }: CategoryComparisonChartProps) {
  const chartData = useMemo(() => {
    const byDistrict: Record<string, { missingItems: number; sandwichWrong: number }> = {};

    feedbacks.forEach((feedback) => {
      const district = getDistrict(feedback.market);
      
      if (!byDistrict[district]) {
        byDistrict[district] = { missingItems: 0, sandwichWrong: 0 };
      }

      if (feedback.complaint_category === "Missing item") {
        byDistrict[district].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        byDistrict[district].sandwichWrong += 1;
      }
    });

    return Object.entries(byDistrict)
      .map(([district, counts]) => ({
        district,
        "Missing Items": counts.missingItems,
        "Sandwich Made Wrong": counts.sandwichWrong,
        total: counts.missingItems + counts.sandwichWrong,
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
              dataKey="district" 
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
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
