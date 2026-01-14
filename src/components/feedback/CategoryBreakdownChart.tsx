import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { CustomerFeedback } from "@/types/feedback";

interface CategoryBreakdownChartProps {
  className?: string;
  feedbacks: CustomerFeedback[];
  onCategoryClick?: (category: string) => void;
}

// Colors for active vs archived
const ACTIVE_COLOR = "#ef4444"; // Red for active
const ARCHIVED_COLOR = "#94a3b8"; // Slate gray for archived

export function CategoryBreakdownChart({ className, feedbacks, onCategoryClick }: CategoryBreakdownChartProps) {
  const [sortByMarket, setSortByMarket] = useState<string | null>(null);

  const { districtData, chartConfig, totalActive, totalArchived } = useMemo(() => {
    // Process the data to count by market, splitting active vs archived
    const marketCounts: { [key: string]: { active: number; archived: number } } = {};

    feedbacks.forEach(feedback => {
      const market = feedback.market;
      const isArchived = feedback.resolution_status === 'resolved';
      
      if (!marketCounts[market]) {
        marketCounts[market] = { active: 0, archived: 0 };
      }

      if (isArchived) {
        marketCounts[market].archived += 1;
      } else {
        marketCounts[market].active += 1;
      }
    });

    // Convert to array for chart display
    let processedData = Object.entries(marketCounts)
      .map(([market, counts]) => ({
        market,
        active: counts.active,
        archived: counts.archived,
        total: counts.active + counts.archived,
      }));

    // Sort data - if a market is selected, sort alphabetically, otherwise by total count
    if (sortByMarket) {
      processedData.sort((a, b) => a.market.localeCompare(b.market));
    } else {
      processedData.sort((a, b) => b.total - a.total);
    }

    const config = {
      active: {
        label: "Active",
        color: ACTIVE_COLOR,
      },
      archived: {
        label: "Archived",
        color: ARCHIVED_COLOR,
      },
    };

    const totalActiveCount = feedbacks.filter(f => f.resolution_status !== 'resolved').length;
    const totalArchivedCount = feedbacks.filter(f => f.resolution_status === 'resolved').length;

    return { 
      districtData: processedData, 
      chartConfig: config,
      totalActive: totalActiveCount,
      totalArchived: totalArchivedCount,
    };
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
          Accuracy issues by district ({feedbacks.length} total: {totalActive} active, {totalArchived} archived)
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[600px]">
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
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <div className="text-sm font-semibold text-foreground mb-2">{label}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: ACTIVE_COLOR }}></span>
                          Active: <span className="font-medium text-foreground">{data.active}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: ARCHIVED_COLOR }}></span>
                          Archived: <span className="font-medium text-foreground">{data.archived}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 pt-1 border-t border-border">
                          Total: <span className="font-medium text-foreground">{data.total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value === 'active' ? 'Active' : 'Archived'}</span>}
              />
              <Bar 
                dataKey="archived" 
                name="Archived"
                fill={ARCHIVED_COLOR}
                stackId="a"
                cursor="pointer"
              />
              <Bar 
                dataKey="active" 
                name="Active"
                fill={ACTIVE_COLOR}
                radius={[4, 4, 0, 0]}
                stackId="a"
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}