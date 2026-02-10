import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Star, Loader2, Timer } from "lucide-react";

interface CustomerFeedbackStatsProps {
  feedbacks: CustomerFeedback[];
  onFilterChange?: (type: 'status' | 'priority' | 'category' | 'critical', value: string) => void;
}

export function CustomerFeedbackStats({ feedbacks, onFilterChange }: CustomerFeedbackStatsProps) {
  const unopened = feedbacks.filter(fb => fb.resolution_status === 'unopened').length;
  const opened = feedbacks.filter(fb => fb.resolution_status === 'opened').length;
  const processing = feedbacks.filter(fb => fb.resolution_status === 'processing').length;
  const responded = feedbacks.filter(fb => fb.resolution_status === 'responded').length;
  const resolved = feedbacks.filter(fb => fb.resolution_status === 'resolved').length;
  const escalated = feedbacks.filter(fb => fb.resolution_status === 'escalated').length;
  const totalOpen = unopened + opened + processing + responded + escalated; // All non-resolved feedback
  const critical = feedbacks.filter(fb => fb.priority === 'Critical').length;
  const praise = feedbacks.filter(fb => 
    fb.complaint_category === 'Praise' || 
    fb.complaint_category?.toLowerCase() === 'rockstar service'
  ).length;

  // Calculate average response time (created_at to updated_at for non-unopened feedback)
  const respondedFeedbacks = feedbacks.filter(fb => 
    fb.resolution_status !== 'unopened' && fb.created_at && fb.updated_at && fb.updated_at !== fb.created_at
  );
  
  let avgResponseTimeLabel = 'N/A';
  if (respondedFeedbacks.length > 0) {
    const totalMs = respondedFeedbacks.reduce((sum, fb) => {
      const created = new Date(fb.created_at).getTime();
      const updated = new Date(fb.updated_at).getTime();
      return sum + Math.max(0, updated - created);
    }, 0);
    const avgMs = totalMs / respondedFeedbacks.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    if (avgHours < 1) {
      avgResponseTimeLabel = `${Math.round(avgMs / (1000 * 60))}m`;
    } else if (avgHours < 24) {
      avgResponseTimeLabel = `${avgHours.toFixed(1)}h`;
    } else {
      avgResponseTimeLabel = `${(avgHours / 24).toFixed(1)}d`;
    }
  }

  const stats = [
    {
      title: 'Total Open Feedback',
      value: totalOpen,
      icon: MessageSquare,
      color: 'text-primary',
      onClick: () => onFilterChange?.('status', 'open'),
    },
    {
      title: 'Unopened',
      value: unopened,
      icon: Clock,
      color: 'text-red-600',
      onClick: () => onFilterChange?.('status', 'unopened'),
    },
    {
      title: 'Processing',
      value: processing,
      icon: Loader2,
      color: 'text-purple-600',
      onClick: () => onFilterChange?.('status', 'processing'),
    },
    {
      title: 'Critical Issues',
      value: critical,
      icon: AlertTriangle,
      color: 'text-red-600',
      onClick: () => onFilterChange?.('critical', 'critical'),
    },
    {
      title: 'Praise Received',
      value: praise,
      icon: Star,
      color: 'text-emerald-600',
      onClick: () => onFilterChange?.('category', 'Praise'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] min-h-[100px] p-4 md:p-6"
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 mb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 md:h-4 md:w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent className="p-0">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}