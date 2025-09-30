import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, CheckCircle, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { CustomerFeedback } from "@/types/feedback";
import { FeedbackReportingFilters } from "@/components/feedback/FeedbackReportingFilters";
import { ComplaintTrendsChart } from "@/components/feedback/ComplaintTrendsChart";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface FeedbackReportingStats {
  averageResponseTime: number;
  pendingFeedback: number;
  criticalIssues: number;
  totalFeedback: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  channelDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  marketDistribution: Record<string, number>;
}

const FeedbackReporting = () => {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [periods, setPeriods] = useState<Array<{ id: string; name: string; start_date: string; end_date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { permissions } = useUserPermissions();

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      const matchesSearch = fb.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           fb.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           fb.case_number.includes(searchTerm) ||
                           fb.store_number.includes(searchTerm);
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(fb.resolution_status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(fb.priority);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(fb.complaint_category);
      const matchesChannel = channelFilter.length === 0 || channelFilter.includes(fb.channel);
      const matchesStore = storeFilter.length === 0 || storeFilter.includes(fb.store_number);
      const matchesMarket = marketFilter.length === 0 || marketFilter.includes(fb.market);
      const matchesAssignee = assigneeFilter.length === 0 || 
                             (assigneeFilter.includes('unassigned') && (!fb.assignee || fb.assignee === 'Unassigned')) ||
                             (fb.assignee && assigneeFilter.includes(fb.assignee));

      // Period filter
      let matchesPeriod = true;
      if (periodFilter.length > 0) {
        const selectedPeriods = periods.filter(p => periodFilter.includes(p.id));
        if (selectedPeriods.length > 0) {
          const feedbackDate = new Date(fb.feedback_date);
          matchesPeriod = selectedPeriods.some(period => {
            const periodStart = new Date(period.start_date);
            const periodEnd = new Date(period.end_date);
            return feedbackDate >= periodStart && feedbackDate <= periodEnd;
          });
        }
      }

      // Date filters
      const feedbackDate = new Date(fb.feedback_date);
      const matchesDateFrom = !dateFrom || feedbackDate >= dateFrom;
      const matchesDateTo = !dateTo || feedbackDate <= dateTo;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && 
             matchesChannel && matchesStore && matchesMarket && matchesAssignee && 
             matchesPeriod && matchesDateFrom && matchesDateTo;
    });
  }, [feedbacks, searchTerm, statusFilter, priorityFilter, categoryFilter, channelFilter, 
      storeFilter, marketFilter, assigneeFilter, periodFilter, periods, dateFrom, dateTo]);

  const availableStores = useMemo(() => {
    const stores = [...new Set(feedbacks.map(fb => fb.store_number))];
    return stores.sort();
  }, [feedbacks]);

  const availableMarkets = useMemo(() => {
    const markets = [...new Set(feedbacks.map(fb => fb.market))];
    return markets.sort();
  }, [feedbacks]);

  const availableAssignees = useMemo(() => {
    const assignees = [...new Set(feedbacks.map(fb => fb.assignee).filter(Boolean))];
    return assignees.sort();
  }, [feedbacks]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setCategoryFilter([]);
    setChannelFilter([]);
    setStoreFilter([]);
    setMarketFilter([]);
    setAssigneeFilter([]);
    setPeriodFilter([]);
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const calculateStats = (feedbacksToCalculate: CustomerFeedback[]): FeedbackReportingStats => {
    const total = feedbacksToCalculate.length;
    const pending = feedbacksToCalculate.filter(fb => fb.resolution_status === 'unopened');
    const critical = feedbacksToCalculate.filter(fb => fb.priority === 'Critical');
    
    // Calculate average response time for responded/resolved feedback
    const respondedFeedbacks = feedbacksToCalculate.filter(fb => 
      fb.resolution_status === 'responded' || fb.resolution_status === 'resolved'
    );
    
    const responseTimes = respondedFeedbacks.map(fb => {
      const created = new Date(fb.created_at);
      const updated = new Date(fb.updated_at);
      return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    feedbacksToCalculate.forEach(fb => {
      statusDistribution[fb.resolution_status] = (statusDistribution[fb.resolution_status] || 0) + 1;
    });

    // Priority distribution
    const priorityDistribution: Record<string, number> = {};
    feedbacksToCalculate.forEach(fb => {
      priorityDistribution[fb.priority] = (priorityDistribution[fb.priority] || 0) + 1;
    });

    // Channel distribution
    const channelDistribution: Record<string, number> = {};
    feedbacksToCalculate.forEach(fb => {
      channelDistribution[fb.channel] = (channelDistribution[fb.channel] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    feedbacksToCalculate.forEach(fb => {
      categoryDistribution[fb.complaint_category] = (categoryDistribution[fb.complaint_category] || 0) + 1;
    });

    // Market distribution
    const marketDistribution: Record<string, number> = {};
    feedbacksToCalculate.forEach(fb => {
      marketDistribution[fb.market] = (marketDistribution[fb.market] || 0) + 1;
    });

    return {
      averageResponseTime,
      pendingFeedback: pending.length,
      criticalIssues: critical.length,
      totalFeedback: total,
      statusDistribution,
      priorityDistribution,
      channelDistribution,
      categoryDistribution,
      marketDistribution
    };
  };

  const stats = useMemo(() => {
    return calculateStats(filteredFeedbacks);
  }, [filteredFeedbacks]);

  const fetchReportingData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback data
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('customer_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback for reporting:', feedbackError);
        toast({
          title: "Error",
          description: "Failed to load feedback data. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }

      // Fetch periods data
      const { data: periodsData, error: periodsError } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (periodsError) {
        console.error('Error fetching periods:', periodsError);
        toast({
          title: "Error",
          description: "Failed to load periods data.",
          variant: "destructive"
        });
      }

      // Map feedback data
      const mappedFeedbacks: CustomerFeedback[] = (feedbackData || []).map(item => ({
        id: item.id,
        feedback_date: item.feedback_date,
        complaint_category: item.complaint_category,
        channel: item.channel,
        rating: item.rating,
        resolution_status: (item.resolution_status || 'unopened') as CustomerFeedback['resolution_status'],
        resolution_notes: item.resolution_notes,
        store_number: item.store_number,
        market: item.market,
        case_number: item.case_number,
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        feedback_text: item.feedback_text,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        priority: (item.priority || 'Low') as CustomerFeedback['priority'],
        assignee: item.assignee || 'Unassigned',
        viewed: item.viewed || false
      }));

      setFeedbacks(mappedFeedbacks);
      setPeriods(periodsData || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Guest Feedback Reporting - Atlas';
  }, []);

  useEffect(() => {
    if (user) {
      fetchReportingData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reporting data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Guest Feedback Reporting & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View insights and analytics for guest feedback performance across all channels
        </p>
      </div>

      <FeedbackReportingFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter} 
        onStatusFilterChange={setStatusFilter} 
        priorityFilter={priorityFilter} 
        onPriorityFilterChange={setPriorityFilter} 
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        storeFilter={storeFilter} 
        onStoreFilterChange={setStoreFilter} 
        marketFilter={marketFilter} 
        onMarketFilterChange={setMarketFilter} 
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        periodFilter={periodFilter}
        onPeriodFilterChange={setPeriodFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onClearFilters={clearFilters} 
        availableStores={availableStores} 
        availableMarkets={availableMarkets} 
        availableAssignees={availableAssignees}
        availablePeriods={periods}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageResponseTime > 0 ? `${stats.averageResponseTime.toFixed(1)} days` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on responded feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Unopened feedback items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              High priority feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              All feedback items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complaint Trends Chart */}
      <ComplaintTrendsChart />

      {/* Charts - Stacked Vertically */}
      <div className="space-y-8">
        {/* Side by side charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Channel</CardTitle>
              <CardDescription>
                Distribution of feedback across different channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Feedback Count",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.channelDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([channel, count], index) => {
                          const colors = [
                            'hsl(var(--primary))',
                            'hsl(var(--info))', 
                            'hsl(var(--warning))',
                            'hsl(var(--success))',
                            'hsl(var(--destructive))',
                          ];
                          
                          return {
                            name: channel,
                            value: count,
                            fill: colors[index % colors.length]
                          };
                        })}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {Object.entries(stats.channelDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Feedback by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Priority</CardTitle>
              <CardDescription>
                Distribution of feedback by priority level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(stats.priorityDistribution).map(([priority, count]) => ({
                    priority,
                    count
                  }))}>
                    <XAxis 
                      dataKey="priority" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Market Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Market</CardTitle>
            <CardDescription>
              Distribution of feedback across different markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Feedback Count",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(stats.marketDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([market, count]) => ({
                    market,
                    count
                  }))}>
                  <XAxis 
                    dataKey="market" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackReporting;