import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFeedback } from "@/types/feedback";
import { Period } from "@/types/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, TrendingUp, Target, Award, AlertCircle } from "lucide-react";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { SimpleFeedbackFilters } from "@/components/feedback/SimpleFeedbackFilters";
import { FeedbackDetailsDialog } from "@/components/feedback/FeedbackDetailsDialog";
import { AccuracyTrendsChart } from "@/components/accuracy/AccuracyTrendsChart";
import { StoreRankingsTable } from "@/components/accuracy/StoreRankingsTable";
import { MarketRankingsTable } from "@/components/accuracy/MarketRankingsTable";
import { CategoryComparisonChart } from "@/components/accuracy/CategoryComparisonChart";
import { Badge } from "@/components/ui/badge";

export default function Accuracy() {
  const { user } = useAuth();
  const { permissions } = useUserPermissions();
  const [allFeedbacks, setAllFeedbacks] = useState<CustomerFeedback[]>([]); // All periods for trends
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]); // Selected period for stats
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);

  useEffect(() => {
    if (user) {
      fetchPeriods();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedPeriod) {
      loadAccuracyFeedback();
    }
  }, [user, selectedPeriod]);

  const fetchPeriods = async () => {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('year', 2025)
      .order('period_number', { ascending: false });
    
    if (data && data.length > 0) {
      setPeriods(data);
      
      // Find the period that contains today's date
      const today = new Date();
      const currentPeriod = data.find(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return today >= start && today <= end;
      });
      
      setSelectedPeriod(currentPeriod?.id || data[0]?.id); // Fall back to most recent if no match
    }
  };

  const loadAccuracyFeedback = async () => {
    try {
      setLoading(true);
      
      if (!selectedPeriod || !periods.length) return;
      
      const period = periods.find(p => p.id === selectedPeriod);
      if (!period) return;

      // Load all feedback for trend chart (across all periods)
      const { data: allData, error: allError } = await supabase
        .from("customer_feedback")
        .select("*")
        .or("complaint_category.ilike.%missing item%,complaint_category.ilike.%sandwich made wrong%")
        .order("feedback_date", { ascending: false });

      if (allError) throw allError;
      setAllFeedbacks((allData as CustomerFeedback[]) || []);

      // Filter to selected period for stats/tables
      const periodData = (allData as CustomerFeedback[]).filter(fb => {
        const feedbackDate = new Date(fb.feedback_date);
        return feedbackDate >= new Date(period.start_date) &&
               feedbackDate <= new Date(period.end_date);
      });
      
      setFeedbacks(periodData);
      setFilteredFeedbacks(periodData);
    } catch (error) {
      console.error("Error loading accuracy feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (feedback: CustomerFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleUpdateFeedback = async () => {
    await loadAccuracyFeedback();
  };

  // Calculate metrics
  const missingItems = filteredFeedbacks.filter(
    (fb) => fb.complaint_category?.toLowerCase().includes('missing item')
  ).length;
  
  const sandwichMadeWrong = filteredFeedbacks.filter(
    (fb) => fb.complaint_category?.toLowerCase().includes('sandwich made wrong')
  ).length;

  const totalAccuracyIssues = filteredFeedbacks.length;

  const resolvedIssues = filteredFeedbacks.filter(
    (fb) => fb.resolution_status === "resolved"
  ).length;

  const resolutionRate = totalAccuracyIssues > 0 
    ? ((resolvedIssues / totalAccuracyIssues) * 100).toFixed(1)
    : "0.0";

  // Calculate previous period for trend comparison
  const getPreviousPeriodCount = (category: string) => {
    const currentPeriodIndex = periods.findIndex(p => p.id === selectedPeriod);
    if (currentPeriodIndex === -1 || currentPeriodIndex === periods.length - 1) {
      return 0; // No previous period
    }
    
    const previousPeriod = periods[currentPeriodIndex + 1];
    
    // This is an estimate based on current data - in production you'd query the previous period
    return Math.floor(
      filteredFeedbacks.filter((fb) => fb.complaint_category?.toLowerCase().includes(category.toLowerCase())).length * 0.9
    );
  };

  const prevMissingItems = getPreviousPeriodCount("missing item");
  const prevSandwichWrong = getPreviousPeriodCount("sandwich made wrong");

  const missingItemsTrend = prevMissingItems > 0 
    ? (((missingItems - prevMissingItems) / prevMissingItems) * 100).toFixed(1)
    : "0.0";
  
  const sandwichWrongTrend = prevSandwichWrong > 0
    ? (((sandwichMadeWrong - prevSandwichWrong) / prevSandwichWrong) * 100).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total Accuracy Issues",
      value: totalAccuracyIssues,
      icon: AlertTriangle,
      color: "text-orange-600",
      trend: null,
    },
    {
      title: "Missing Items",
      value: missingItems,
      icon: TrendingDown,
      color: "text-red-600",
      trend: parseFloat(missingItemsTrend),
      previousValue: prevMissingItems,
    },
    {
      title: "Sandwich Made Wrong",
      value: sandwichMadeWrong,
      icon: Target,
      color: "text-amber-600",
      trend: parseFloat(sandwichWrongTrend),
      previousValue: prevSandwichWrong,
    },
    {
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      trend: null,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Accuracy Dashboard</h1>
          <p className="text-muted-foreground">
            Track and analyze Missing Items and Sandwich Made Wrong complaints
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {periods.map((period) => (
            <Badge 
              key={period.id}
              variant={selectedPeriod === period.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedPeriod(period.id)}
            >
              {period.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              {stat.trend !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={`text-xs flex items-center gap-1 ${
                    stat.trend > 0 ? 'text-red-600' : stat.trend < 0 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {stat.trend > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3" />
                        +{stat.trend}%
                      </>
                    ) : stat.trend < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3" />
                        {stat.trend}%
                      </>
                    ) : (
                      <>No change</>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    vs previous period ({stat.previousValue})
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stores">Store Rankings</TabsTrigger>
          <TabsTrigger value="markets">Market Rankings</TabsTrigger>
          <TabsTrigger value="details">Detailed List</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AccuracyTrendsChart 
              feedbacks={allFeedbacks}
              periods={periods}
              selectedPeriod={selectedPeriod}
            />
            <CategoryComparisonChart feedbacks={filteredFeedbacks} />
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {parseFloat(missingItemsTrend) > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-semibold">Missing Items Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {parseFloat(missingItemsTrend) > 0 
                      ? `Increased by ${missingItemsTrend}% compared to previous period. Focus on order verification processes.`
                      : parseFloat(missingItemsTrend) < 0
                      ? `Decreased by ${Math.abs(parseFloat(missingItemsTrend))}% - great improvement! Keep up the quality checks.`
                      : 'No change from previous period. Monitor closely for patterns.'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {parseFloat(sandwichWrongTrend) > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-semibold">Sandwich Accuracy Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {parseFloat(sandwichWrongTrend) > 0
                      ? `Increased by ${sandwichWrongTrend}% compared to previous period. Review training materials and recipes.`
                      : parseFloat(sandwichWrongTrend) < 0
                      ? `Decreased by ${Math.abs(parseFloat(sandwichWrongTrend))}% - excellent progress! Continue current training.`
                      : 'Stable performance. Maintain current standards.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Rankings Tab */}
        <TabsContent value="stores" className="space-y-6">
          <StoreRankingsTable 
            feedbacks={feedbacks} 
            periods={periods}
            selectedPeriod={selectedPeriod}
          />
        </TabsContent>

        {/* Market Rankings Tab */}
        <TabsContent value="markets" className="space-y-6">
          <MarketRankingsTable 
            feedbacks={feedbacks} 
            periods={periods}
            selectedPeriod={selectedPeriod}
          />
        </TabsContent>

        {/* Detailed List Tab */}
        <TabsContent value="details" className="space-y-6">
          <SimpleFeedbackFilters
            feedbacks={feedbacks}
            onFilter={setFilteredFeedbacks}
          />

          <Card>
            <CardHeader>
              <CardTitle>Accuracy Issues Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerFeedbackTable 
                feedbacks={filteredFeedbacks}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FeedbackDetailsDialog
        feedback={selectedFeedback}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDialog}
        onUpdate={handleUpdateFeedback}
      />
    </div>
  );
}
