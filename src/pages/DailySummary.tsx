import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Download, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type WorkOrderRow = Database['public']['Tables']['work_orders']['Row'];

interface DailySummaryData {
  newTickets: WorkOrderRow[];
  completedTickets: WorkOrderRow[];
  statusChanges: WorkOrderRow[];
  notesComments: WorkOrderRow[];
}

export default function DailySummary() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summaryData, setSummaryData] = useState<DailySummaryData>({
    newTickets: [],
    completedTickets: [],
    statusChanges: [],
    notesComments: []
  });
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    newTickets: true,
    completedTickets: false,
    statusChanges: false,
    notesComments: false
  });
  const { user } = useAuth();

  const fetchDailySummary = async (date: Date) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch work orders created on the selected date
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching new tickets:', error);
        throw error;
      }

      // Fetch completed orders for the selected date (by completed_at)
      const { data: completedOrders, error: completedError } = await supabase
        .from('work_orders')
        .select('*')
        .not('completed_at', 'is', null)
        .gte('completed_at', startOfDay.toISOString())
        .lte('completed_at', endOfDay.toISOString())
        .order('completed_at', { ascending: false });

      if (completedError) {
        console.error('Error fetching completed tickets:', completedError);
        throw completedError;
      }

      // Fetch all work orders updated on the selected date (excluding those created on the same date)
      const { data: allUpdated, error: statusError } = await supabase
        .from('work_orders')
        .select('*')
        .gte('updated_at', startOfDay.toISOString())
        .lte('updated_at', endOfDay.toISOString())
        .order('updated_at', { ascending: false });

      if (statusError) {
        console.error('Error fetching status changes:', statusError);
        throw statusError;
      }

      // Filter out work orders that were created on the same date (true status changes only)
      const statusChanges = allUpdated?.filter(order => {
        const createdDate = new Date(order.created_at).toDateString();
        const updatedDate = new Date(order.updated_at).toDateString();
        return createdDate !== updatedDate;
      }) || [];

      // Fetch work orders with notes updated on the selected date
      const { data: notesComments, error: notesError } = await supabase
        .from('work_orders')
        .select('*')
        .not('notes', 'is', null)
        .gte('updated_at', startOfDay.toISOString())
        .lte('updated_at', endOfDay.toISOString())
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes/comments:', notesError);
        throw notesError;
      }

      console.log('Daily Summary Data:', {
        newTickets: workOrders?.length || 0,
        completedTickets: completedOrders?.length || 0,
        statusChanges: statusChanges?.length || 0,
        notesComments: notesComments?.length || 0
      });

      setSummaryData({
        newTickets: workOrders || [],
        completedTickets: completedOrders || [],
        statusChanges: statusChanges || [],
        notesComments: notesComments || []
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySummary(selectedDate);
  }, [selectedDate, user]);

  const stats = useMemo(() => [
    {
      title: "New Tickets",
      value: summaryData.newTickets.length,
      color: "bg-blue-500",
      textColor: "text-white"
    },
    {
      title: "Completed Tickets", 
      value: summaryData.completedTickets.length,
      color: "bg-green-500",
      textColor: "text-white"
    },
    {
      title: "Status Changes",
      value: summaryData.statusChanges.length,
      color: "bg-yellow-500", 
      textColor: "text-white"
    },
    {
      title: "Notes & Comments",
      value: summaryData.notesComments.length,
      color: "bg-red-500",
      textColor: "text-white"
    }
  ], [summaryData]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'Important': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Summary</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarDays className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.color} ${stat.textColor} border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Tickets Section */}
      <Collapsible open={openSections.newTickets} onOpenChange={() => toggleSection('newTickets')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>New Tickets</CardTitle>
                {openSections.newTickets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.newTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id.slice(-4)}</TableCell>
                      <TableCell>{ticket.store_number}</TableCell>
                      <TableCell>{ticket.market}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.created_at), "h:mm a")}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                    </TableRow>
                  ))}
                  {summaryData.newTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No new tickets for {format(selectedDate, "MMMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Completed Tickets Section */}
      <Collapsible open={openSections.completedTickets} onOpenChange={() => toggleSection('completedTickets')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Completed Tickets</CardTitle>
                {openSections.completedTickets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.completedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id.slice(-4)}</TableCell>
                      <TableCell>{ticket.store_number}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.completed_at ? format(new Date(ticket.completed_at), "h:mm a") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Completed</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                    </TableRow>
                  ))}
                  {summaryData.completedTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No completed tickets for {format(selectedDate, "MMMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Status Changes Section */}
      <Collapsible open={openSections.statusChanges} onOpenChange={() => toggleSection('statusChanges')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Status Changes</CardTitle>
                {openSections.statusChanges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.statusChanges.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id.slice(-4)}</TableCell>
                      <TableCell>{ticket.store_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.updated_at), "h:mm a")}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                    </TableRow>
                  ))}
                  {summaryData.statusChanges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No status changes for {format(selectedDate, "MMMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notes & Comments Section */}
      <Collapsible open={openSections.notesComments} onOpenChange={() => toggleSection('notesComments')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle>Notes & Comments</CardTitle>
                {openSections.notesComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Notes Count</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.notesComments.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id.slice(-4)}</TableCell>
                      <TableCell>{ticket.store_number}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.notes?.length || 0} notes</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(ticket.updated_at), "h:mm a")}</TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                    </TableRow>
                  ))}
                  {summaryData.notesComments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No notes or comments for {format(selectedDate, "MMMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}