import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { CustomerFeedback } from "@/types/feedback";

interface CategoryBreakdownChartProps {
  className?: string;
  feedbacks: CustomerFeedback[];
  onCategoryClick?: (category: string) => void;
}

// Dynamic color palette for categories
const getCategoryColor = (index: number) => {
  const colors = [
    "hsl(var(--destructive))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
  ];
  return colors[index % colors.length];
};

export function CategoryBreakdownChart({ className, feedbacks, onCategoryClick }: CategoryBreakdownChartProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const { districtData, categories, chartConfig } = useMemo(() => {
    // Get all unique categories
    const categorySet = new Set<string>();
    feedbacks.forEach(feedback => {
      if (feedback.complaint_category) {
        categorySet.add(feedback.complaint_category);
      }
    });
    const uniqueCategories = Array.from(categorySet).sort();

    // Create dynamic chart config
    const config: Record<string, { label: string; color: string }> = {};
    uniqueCategories.forEach((category, index) => {
      config[category] = {
        label: category,
        color: getCategoryColor(index),
      };
    });

    // Process the data to count by market and category
    const marketCategoryCount: { [key: string]: { [category: string]: number; total: number } } = {};

    feedbacks.forEach(feedback => {
      const market = feedback.market;
      const category = feedback.complaint_category || 'Unknown';
      
      if (!marketCategoryCount[market]) {
        marketCategoryCount[market] = { total: 0 };
        uniqueCategories.forEach(cat => {
          marketCategoryCount[market][cat] = 0;
        });
      }

      if (marketCategoryCount[market][category] !== undefined) {
        marketCategoryCount[market][category] += 1;
      } else {
        marketCategoryCount[market][category] = 1;
      }
      marketCategoryCount[market].total += 1;
    });

    // Convert to array for chart display
    const processedData = Object.entries(marketCategoryCount)
      .map(([market, counts]) => {
        const data: any = { market };
        uniqueCategories.forEach(category => {
          data[category] = counts[category] || 0;
        });
        return data;
      })
      .sort((a, b) => {
        const aTotal = uniqueCategories.reduce((sum, cat) => sum + (a[cat] || 0), 0);
        const bTotal = uniqueCategories.reduce((sum, cat) => sum + (b[cat] || 0), 0);
        return bTotal - aTotal;
      });

    return { districtData: processedData, categories: uniqueCategories, chartConfig: config };
  }, [feedbacks]);

  const handleBarClick = (data: any) => {
    const clickedMarket = data.market;
    setSelectedMarket(clickedMarket === selectedMarket ? null : clickedMarket);
    if (onCategoryClick) {
      onCategoryClick(clickedMarket);
    }
  };

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
            <BarChart data={districtData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="market"
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
                    const total = categories.reduce((sum, cat) => sum + (data[cat] || 0), 0);
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <div className="text-sm font-semibold text-foreground mb-2">{label}</div>
                        {categories.map((category, index) => {
                          const value = data[category] || 0;
                          if (value === 0) return null;
                          return (
                            <div key={category} className="text-xs text-muted-foreground">
                              {category}: <span className="font-medium" style={{ color: getCategoryColor(index) }}>{value}</span>
                            </div>
                          );
                        })}
                        <div className="text-xs text-muted-foreground mt-2 pt-1 border-t border-border">
                          Total: <span className="font-medium text-foreground">{total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {categories.map((category, index) => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  fill={getCategoryColor(index)}
                  radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  stackId="a"
                  cursor="pointer"
                >
                  {districtData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`}
                      opacity={selectedMarket === null || selectedMarket === entry.market ? 1 : 0.3}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}