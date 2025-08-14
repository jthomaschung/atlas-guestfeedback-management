import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type WorkOrderRow = Database['public']['Tables']['work_orders']['Row'];

interface MobileWorkOrderTableProps {
  tickets: WorkOrderRow[];
  onRowClick: (ticketId: string) => void;
  title: string;
}

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'destructive';
    case 'Important':
      return 'default';
    case 'Low':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'in-progress':
      return 'default';
    case 'pending':
      return 'outline';
    case 'pending-approval':
      return 'outline';
    default:
      return 'outline';
  }
};

export function MobileWorkOrderTable({ tickets, onRowClick, title }: MobileWorkOrderTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No {title.toLowerCase()} for today
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onRowClick(ticket.id)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Store {ticket.store_number}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="text-xs">
                    {ticket.priority}
                  </Badge>
                </div>
                <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                  {ticket.status === 'completed' ? 'Completed' : 
                   ticket.status === 'in-progress' ? 'In Progress' : 
                   ticket.status === 'pending' ? 'Pending' :
                   ticket.status === 'pending-approval' ? 'Pending Approval' : ticket.status}
                </Badge>
              </div>

              {/* Content */}
              <div className="text-sm">
                <p className="font-medium text-foreground line-clamp-2">
                  {ticket.description}
                </p>
              </div>

              {/* Footer with time info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Market: {ticket.market}</span>
                {title === "Completed Tickets" && ticket.completed_at && (
                  <span>
                    Completed: {format(new Date(ticket.completed_at), "h:mm a")}
                  </span>
                )}
                {title === "New Tickets" && (
                  <span>
                    Created: {format(new Date(ticket.created_at), "h:mm a")}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}