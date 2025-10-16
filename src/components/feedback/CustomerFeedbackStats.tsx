import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, Star, Loader2 } from "lucide-react";

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
  const praise = feedbacks.filter(fb => fb.complaint_category === 'Praise').length;

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
      title: 'Resolved',
      value: resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      onClick: () => onFilterChange?.('status', 'resolved'),
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={stat.onClick}
        >
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
  );
}