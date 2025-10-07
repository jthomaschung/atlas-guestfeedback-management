import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, TrendingUp, Target } from "lucide-react";
import { CustomerFeedbackTable } from "@/components/feedback/CustomerFeedbackTable";
import { SimpleFeedbackFilters } from "@/components/feedback/SimpleFeedbackFilters";
import { CategoryBreakdownChart } from "@/components/feedback/CategoryBreakdownChart";
import { ComplaintTrendsChart } from "@/components/feedback/ComplaintTrendsChart";
import { FeedbackDetailsDialog } from "@/components/feedback/FeedbackDetailsDialog";

export default function Accuracy() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadAccuracyFeedback();
    }
  }, [user]);

  const loadAccuracyFeedback = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_feedback")
        .select("*")
        .in("complaint_category", ["Missing item", "Sandwich Made Wrong"])
        .order("feedback_date", { ascending: false });

      if (error) throw error;
      setFeedbacks((data as CustomerFeedback[]) || []);
      setFilteredFeedbacks((data as CustomerFeedback[]) || []);
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

  const missingItems = filteredFeedbacks.filter(
    (fb) => fb.complaint_category === "Missing item"
  ).length;
  
  const sandwichMadeWrong = filteredFeedbacks.filter(
    (fb) => fb.complaint_category === "Sandwich Made Wrong"
  ).length;

  const totalAccuracyIssues = filteredFeedbacks.length;

  const resolvedIssues = filteredFeedbacks.filter(
    (fb) => fb.resolution_status === "resolved"
  ).length;

  const resolutionRate = totalAccuracyIssues > 0 
    ? ((resolvedIssues / totalAccuracyIssues) * 100).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total Accuracy Issues",
      value: totalAccuracyIssues,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Missing Items",
      value: missingItems,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Sandwich Made Wrong",
      value: sandwichMadeWrong,
      icon: Target,
      color: "text-amber-600",
    },
    {
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Accuracy Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze Missing Items and Sandwich Made Wrong complaints
        </p>
      </div>

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
            </CardContent>
          </Card>
        ))}
      </div>

      <SimpleFeedbackFilters
        feedbacks={feedbacks}
        onFilter={setFilteredFeedbacks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart feedbacks={filteredFeedbacks} />
        <ComplaintTrendsChart />
      </div>

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

      <FeedbackDetailsDialog
        feedback={selectedFeedback}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDialog}
        onUpdate={handleUpdateFeedback}
      />
    </div>
  );
}
