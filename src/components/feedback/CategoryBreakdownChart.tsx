import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CustomerFeedback } from "@/types/feedback";

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryBreakdownChartProps {
  className?: string;
  feedbacks: CustomerFeedback[];
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
};

// Helper function to normalize category names (title case)
const normalizeCategory = (category: string): string => {
  if (!category) return 'Other';
  return category
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function CategoryBreakdownChart({ className, feedbacks }: CategoryBreakdownChartProps) {
  const categoryData = useMemo(() => {
    // Process the data to count categories
    const categoryCount: { [key: string]: number } = {};
    let totalCount = 0;

    feedbacks.forEach(feedback => {
      const category = normalizeCategory(feedback.complaint_category || 'Other');
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      totalCount++;
    });

    // Convert to array and calculate percentages
    const processedData: CategoryData[] = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 categories

    return processedData;
  }, [feedbacks]);

  if (feedbacks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Feedback Category Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Count of feedback by category type
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">No feedback data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Feedback Category Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Count of feedback by category type ({feedbacks.length} total items)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryData;
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          Count: <span className="font-medium text-foreground">{data.count}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentage: <span className="font-medium text-foreground">{data.percentage}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}