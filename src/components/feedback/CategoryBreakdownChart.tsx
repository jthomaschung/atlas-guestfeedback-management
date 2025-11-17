import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CustomerFeedback } from "@/types/feedback";

interface CategoryBreakdownChartProps {
  className?: string;
  feedbacks: CustomerFeedback[];
  onCategoryClick?: (category: string) => void;
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

const chartConfig = {
  "Missing Items": {
    label: "Missing Items",
    color: "hsl(var(--destructive))",
  },
  "Sandwich Made Wrong": {
    label: "Sandwich Made Wrong",
    color: "hsl(var(--foreground))",
  },
};

export function CategoryBreakdownChart({ className, feedbacks, onCategoryClick }: CategoryBreakdownChartProps) {
  const districtData = useMemo(() => {
    // Process the data to count by district and category
    const districtCategoryCount: { [key: string]: { missingItems: number; sandwichWrong: number; total: number } } = {};

    feedbacks.forEach(feedback => {
      const district = getDistrict(feedback.market);
      
      if (!districtCategoryCount[district]) {
        districtCategoryCount[district] = {
          missingItems: 0,
          sandwichWrong: 0,
          total: 0
        };
      }

      if (feedback.complaint_category === "Missing item") {
        districtCategoryCount[district].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        districtCategoryCount[district].sandwichWrong += 1;
      }
      districtCategoryCount[district].total += 1;
    });

    // Convert to array for chart display
    const processedData = Object.entries(districtCategoryCount)
      .map(([district, counts]) => ({
        district,
        "Missing Items": counts.missingItems,
        "Sandwich Made Wrong": counts.sandwichWrong,
      }))
      .sort((a, b) => b["Missing Items"] + b["Sandwich Made Wrong"] - (a["Missing Items"] + a["Sandwich Made Wrong"]));

    return processedData;
  }, [feedbacks]);

  if (feedbacks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Category Breakdown by District</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accuracy issues by district
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
        <CardTitle>Category Breakdown by District</CardTitle>
        <p className="text-sm text-muted-foreground">
          Accuracy issues by district ({feedbacks.length} total items)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="district" 
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
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <div className="text-sm font-semibold text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Missing Items: <span className="font-medium text-red-600">{data["Missing Items"]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sandwich Made Wrong: <span className="font-medium text-foreground">{data["Sandwich Made Wrong"]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Total: <span className="font-medium text-foreground">{data["Missing Items"] + data["Sandwich Made Wrong"]}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="Missing Items" 
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
              <Bar 
                dataKey="Sandwich Made Wrong" 
                fill="hsl(var(--foreground))"
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}