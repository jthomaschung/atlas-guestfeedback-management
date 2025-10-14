import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, MessageSquare, Calendar, Mail, TrendingUp, Shield } from "lucide-react";

interface NotificationCardProps {
  type: string;
  role: "manager" | "director";
  title: string;
  description: string;
  example: Record<string, any>;
}

export function NotificationCard({ type, role, title, description, example }: NotificationCardProps) {
  const getIcon = () => {
    switch (type) {
      case "new-feedback":
      case "regional-feedback":
        return <Bell className="h-5 w-5" />;
      case "sla-warning":
      case "sla-exceeded":
      case "store-alert":
        return <AlertTriangle className="h-5 w-5" />;
      case "tagged":
        return <MessageSquare className="h-5 w-5" />;
      case "weekly-summary":
      case "daily-summary":
        return <Calendar className="h-5 w-5" />;
      case "customer-response":
        return <Mail className="h-5 w-5" />;
      case "critical-escalation":
        return <Shield className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = () => {
    if (type.includes("critical") || type.includes("exceeded")) return "destructive";
    if (type.includes("warning") || type.includes("alert")) return "default";
    if (type.includes("response")) return "secondary";
    return "outline";
  };

  const formatSlackMessage = () => {
    switch (type) {
      case "new-feedback":
        return `🔔 *New Feedback Alert*
        
📍 Store: ${example.storeName}
📁 Category: ${example.category}
⚠️ Priority: ${example.priority}
👤 Customer: ${example.customerName}

View details and respond in the Guest Feedback Portal →`;

      case "tagged":
        return `💬 *You've been tagged in a note*

👤 By: ${example.taggerName}
📋 Case: ${example.caseNumber}
💭 "${example.note}"

View and respond in the Portal →`;

      case "sla-warning":
        return `⏰ *SLA Deadline Approaching*

📋 Case: ${example.caseNumber}
⏳ Time Remaining: ${example.hoursRemaining} hours
⚠️ Priority: ${example.priority}

Action required to avoid SLA violation →`;

      case "sla-exceeded":
        return `🚨 *SLA DEADLINE EXCEEDED*

📋 Case: ${example.caseNumber}
⏱️ Overdue: ${example.hoursOverdue} hours

IMMEDIATE ACTION REQUIRED →`;

      case "customer-response":
        return `📧 *Customer Response Received*

👤 Customer: ${example.customerName}
📋 Case: ${example.caseNumber}
😊 Sentiment: ${example.sentiment}

View conversation thread →`;

      case "store-alert":
        return `⚠️ *Store Performance Alert*

📍 Store #${example.storeNumber}
🚨 Critical Feedback: ${example.criticalCount} items ${example.date}

Review and address immediately →`;

      case "weekly-summary":
        return `📊 *Weekly Performance Summary*

📈 Total Feedback: ${example.totalFeedback}
⏱️ Avg Response Time: ${example.avgResponseTime}
🏆 Top Category: ${example.topCategory}

View full report in Portal →`;

      case "regional-feedback":
        return `🌍 *Regional Feedback Update*

📍 Market: ${example.market}
📊 Today's Total: ${example.totalToday}
🚨 Critical Items: ${example.criticalCount}

View regional dashboard →`;

      case "critical-escalation":
        return `🚨 *CRITICAL ESCALATION*

📋 Case: ${example.caseNumber}
⚠️ Category: ${example.category}
✅ Requires: Executive Approval

IMMEDIATE REVIEW REQUIRED →`;

      case "daily-summary":
        return `📅 *Daily Regional Summary - ${example.date}*

📊 Total Feedback: ${example.totalFeedback}
✅ Resolved: ${example.resolved}
⏳ Pending: ${example.pending}

View detailed breakdown →`;

      default:
        return "Slack notification preview";
    }
  };

  return (
    <Card className="p-4 border-l-4" style={{ borderLeftColor: getUrgencyColor() === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getUrgencyColor() === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Badge variant={getUrgencyColor()}>{role === "director" ? "Director" : "Manager"}</Badge>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Slack Message Preview:</p>
            <pre className="text-xs whitespace-pre-wrap font-mono">{formatSlackMessage()}</pre>
          </div>
        </div>
      </div>
    </Card>
  );
}
