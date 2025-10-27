import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useInternalFeedbackNotifications } from "@/hooks/useInternalFeedbackNotifications";
import { MessageSquare, Bug, Lightbulb, AlertCircle, CheckCircle2, Clock, ExternalLink, Archive, ArchiveRestore } from "lucide-react";
import { format } from "date-fns";

interface InternalFeedback {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  page_context: string | null;
  page_url: string | null;
  screenshot_path: string | null;
  created_at: string;
  user_id: string;
  archived: boolean;
  archived_at: string | null;
  profiles: {
    display_name: string;
    email: string;
  } | null;
}

export default function InternalFeedback() {
  const [feedback, setFeedback] = useState<InternalFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { toast } = useToast();
  const { sendStatusChangeNotification } = useInternalFeedbackNotifications();

  useEffect(() => {
    fetchFeedback();
  }, [showArchived]);

  const fetchFeedback = async () => {
    try {
      let query = supabase
        .from("internal_feedback")
        .select("*");
      
      // Filter by archived status
      if (!showArchived) {
        query = query.eq("archived", false);
      }
      
      const { data: feedbackData, error: feedbackError } = await query.order("created_at", { ascending: false });

      if (feedbackError) throw feedbackError;

      // Fetch profiles separately
      const userIds = feedbackData?.map(f => f.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Merge the data
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const mergedData = feedbackData?.map(f => ({
        ...f,
        profiles: profilesMap.get(f.user_id) || null
      })) || [];

      setFeedback(mergedData as any);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load feedback submissions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Find current item to get old status
    const currentItem = feedback.find(item => item.id === id);
    const oldStatus = currentItem?.status;
    
    try {
      const { error } = await supabase
        .from("internal_feedback")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );

      // Send notification if status actually changed
      if (oldStatus && oldStatus !== newStatus) {
        await sendStatusChangeNotification(id, oldStatus, newStatus);
      }

      toast({
        title: "Status Updated",
        description: `Feedback marked as ${newStatus}. Notification sent to submitter.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    }
  };

  const updatePriority = async (id: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from("internal_feedback")
        .update({ priority: newPriority })
        .eq("id", id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(item => (item.id === id ? { ...item, priority: newPriority } : item))
      );

      toast({
        title: "Priority Updated",
        description: `Priority set to ${newPriority}.`,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update priority.",
      });
    }
  };

  const archiveFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from("internal_feedback")
        .update({ 
          archived: true,
          archived_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      setFeedback(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Archived",
        description: "Feedback has been archived.",
      });
    } catch (error) {
      console.error("Error archiving feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive feedback.",
      });
    }
  };

  const unarchiveFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from("internal_feedback")
        .update({ 
          archived: false,
          archived_at: null
        })
        .eq("id", id);

      if (error) throw error;

      setFeedback(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Unarchived",
        description: "Feedback has been restored.",
      });
    } catch (error) {
      console.error("Error unarchiving feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unarchive feedback.",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "feature":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "default";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Internal Feedback</h1>
        <p className="text-muted-foreground">
          View and manage platform feedback, bug reports, and feature requests
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bug">Bug Reports</SelectItem>
            <SelectItem value="feature">Feature Requests</SelectItem>
            <SelectItem value="feedback">General Feedback</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? "Showing Archived" : "Show Archived"}
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No feedback found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>
                        Submitted by {item.profiles?.display_name || item.profiles?.email || "Unknown"} on{" "}
                        {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                      {item.page_context && (
                        <div className="text-sm text-muted-foreground">
                          Page: {item.page_context}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(item.priority)} className="capitalize">
                      {item.priority}
                    </Badge>
                    <Badge variant={getStatusColor(item.status)} className="capitalize flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>

                {item.screenshot_path && (
                  <div>
                    <img
                      src={supabase.storage.from("feedback-screenshots").getPublicUrl(item.screenshot_path).data.publicUrl}
                      alt="Screenshot"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}

                {item.page_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.page_url!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Page
                  </Button>
                )}

                <div className="flex gap-2 pt-2 flex-wrap">
                  <Select
                    value={item.status}
                    onValueChange={(value) => updateStatus(item.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.priority}
                    onValueChange={(value) => updatePriority(item.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  {item.archived ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unarchiveFeedback(item.id)}
                    >
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </Button>
                  ) : item.status === "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveFeedback(item.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
