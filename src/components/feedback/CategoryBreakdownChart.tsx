import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryBreakdownChartProps {
  className?: string;
  marketFilter?: string[];
  storeFilter?: string[];
}

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
};

export function CategoryBreakdownChart({ className, marketFilter = [], storeFilter = [] }: CategoryBreakdownChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [useCustomRange, setUseCustomRange] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchCategoryData();
  }, [selectedPeriod, startDate, endDate, useCustomRange, marketFilter, storeFilter]);

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (error) {
        console.error('Error fetching periods:', error);
        return;
      }

      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('customer_feedback')
        .select('complaint_category, feedback_date, market, store_number');

      // Apply market filter
      if (marketFilter.length > 0) {
        query = query.in('market', marketFilter);
      }

      // Apply store filter
      if (storeFilter.length > 0) {
        query = query.in('store_number', storeFilter);
      }

      // Apply date filtering
      if (useCustomRange && startDate && endDate) {
        query = query
          .gte('feedback_date', format(startDate, 'yyyy-MM-dd'))
          .lte('feedback_date', format(endDate, 'yyyy-MM-dd'));
      } else if (selectedPeriod !== "all") {
        const period = periods.find(p => p.id === selectedPeriod);
        if (period) {
          query = query
            .gte('feedback_date', period.start_date)
            .lte('feedback_date', period.end_date);
        }
      }

      const { data: feedbacks, error } = await query;

      if (error) {
        console.error('Error fetching feedback data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load feedback data"
        });
        return;
      }

      // Process the data to count categories
      const categoryCount: { [key: string]: number } = {};
      let totalCount = 0;

      feedbacks?.forEach(feedback => {
        const category = feedback.complaint_category || 'Other';
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

      setCategoryData(processedData);
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load category data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setUseCustomRange(false);
  };

  const handleCustomRangeToggle = () => {
    setUseCustomRange(true);
    setSelectedPeriod("all");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Feedback Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading category data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>Feedback Category Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Count of feedback by category type
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Period Selector */}
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleCustomRangeToggle}
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleCustomRangeToggle}
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
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