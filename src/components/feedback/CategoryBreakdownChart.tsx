import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CustomerFeedback } from "@/types/feedback";

interface CategoryBreakdownChartProps {
  className?: string;
  feedbacks: CustomerFeedback[];
  onCategoryClick?: (category: string) => void;
}

// Dynamic color palette for categories - matching line chart colors
const getCategoryColor = (index: number) => {
  const colors = [
    "#ef4444", // red - matches Rude Service
    "#f59e0b", // amber - matches Sandwich Made Wrong
    "#3b82f6", // blue - matches Missing Item
    "#10b981", // green - matches Praise
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ];
  return colors[index % colors.length];
};

export function CategoryBreakdownChart({ className, feedbacks, onCategoryClick }: CategoryBreakdownChartProps) {
  const [sortByMarket, setSortByMarket] = useState<string | null>(null);

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
    let processedData = Object.entries(marketCategoryCount)
      .map(([market, counts]) => {
        const data: any = { market };
        uniqueCategories.forEach(category => {
          data[category] = counts[category] || 0;
        });
        return data;
      });

    // Sort data - if a market is selected, sort alphabetically, otherwise by total count
    if (sortByMarket) {
      processedData.sort((a, b) => a.market.localeCompare(b.market));
    } else {
      processedData.sort((a, b) => {
        const aTotal = uniqueCategories.reduce((sum, cat) => sum + (a[cat] || 0), 0);
        const bTotal = uniqueCategories.reduce((sum, cat) => sum + (b[cat] || 0), 0);
        return bTotal - aTotal;
      });
    }

    return { districtData: processedData, categories: uniqueCategories, chartConfig: config };
  }, [feedbacks, sortByMarket]);

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedMarket = data.activePayload[0].payload.market;
      setSortByMarket(clickedMarket === sortByMarket ? null : clickedMarket);
      if (onCategoryClick) {
        onCategoryClick(clickedMarket);
      }
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
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}