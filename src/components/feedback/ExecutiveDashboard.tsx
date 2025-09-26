import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, TrendingUp, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CustomerFeedback } from '@/types/feedback';

interface EscalationLog {
  id: string;
  feedback_id: string;
  escalated_from: string;
  escalated_to: string;
  escalation_reason: string;
  escalated_at: string;
  resolved_at?: string;
  executive_notes?: string;
  feedback?: CustomerFeedback;
}

interface ExecutiveDashboardProps {
  userRole: string;
}

export function ExecutiveDashboard({ userRole }: ExecutiveDashboardProps) {
  const [criticalFeedbacks, setCriticalFeedbacks] = useState<CustomerFeedback[]>([]);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [executiveNotes, setExecutiveNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadExecutiveData();
  }, [user]);

  const loadExecutiveData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load critical/escalated feedback
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('customer_feedback')
        .select('*')
        .eq('resolution_status', 'escalated')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Load escalation logs with feedback details
      const { data: logs, error: logsError } = await supabase
        .from('escalation_log')
        .select(`
          *,
          feedback:customer_feedback(*)
        `)
        .order('escalated_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setCriticalFeedbacks((feedbacks || []) as CustomerFeedback[]);
      setEscalationLogs((logs || []) as EscalationLog[]);
    } catch (error: any) {
      console.error('Error loading executive data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load executive dashboard data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExecutiveNotes = async () => {
    if (!selectedFeedback || !executiveNotes.trim()) return;

    try {
      // Update feedback with executive notes
      const { error: updateError } = await supabase
        .from('customer_feedback')
        .update({ 
          executive_notes: executiveNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (updateError) throw updateError;

      // Log the executive action
      const { error: logError } = await supabase
        .from('escalation_log')
        .insert({
          feedback_id: selectedFeedback.id,
          escalated_from: 'escalated',
          escalated_to: 'executive_review',
          escalation_reason: `Executive notes added by ${userRole}`,
          escalated_by: user?.id
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "Executive notes added successfully",
      });

      setIsNotesDialogOpen(false);
      setExecutiveNotes('');
      setSelectedFeedback(null);
      loadExecutiveData();
    } catch (error: any) {
      console.error('Error adding executive notes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add executive notes",
      });
    }
  };

  const markAsReviewed = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('escalation_log')
        .insert({
          feedback_id: feedbackId,
          escalated_from: 'escalated',
          escalated_to: 'executive_reviewed',
          escalation_reason: `Reviewed by ${userRole}: ${user?.email}`,
          escalated_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Marked as reviewed by executive leadership",
      });

      loadExecutiveData();
    } catch (error: any) {
      console.error('Error marking as reviewed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark as reviewed",
      });
    }
  };

  const getSlaStatus = (feedback: CustomerFeedback) => {
    if (!feedback.sla_deadline) return { status: 'none', color: 'bg-gray-100' };
    
    const deadline = new Date(feedback.sla_deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursLeft = timeDiff / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      return { status: 'violated', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (hoursLeft < 1) {
      return { status: 'critical', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    } else {
      return { status: 'normal', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overdueCount = criticalFeedbacks.filter(f => {
    if (!f.sla_deadline) return false;
    return new Date(f.sla_deadline) < new Date();
  }).length;

  const criticalCount = criticalFeedbacks.filter(f => 
    f.priority === 'Critical' || 
    f.complaint_category === 'Out of Product' || 
    f.complaint_category === 'Rude Service'
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Executive Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Critical customer feedback requiring {userRole.toUpperCase()} oversight
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Violations</p>
                <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Escalated</p>
                <p className="text-2xl font-bold text-blue-600">{criticalFeedbacks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Escalations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {escalationLogs.filter(log => {
                    const logDate = new Date(log.escalated_at);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return logDate > yesterday;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Critical Issues Requiring Executive Attention</span>
          </CardTitle>
          <CardDescription>
            Issues that have been escalated to executive level due to severity or SLA violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalFeedbacks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No critical issues currently require executive attention
              </p>
            ) : (
              criticalFeedbacks.map((feedback) => {
                const slaStatus = getSlaStatus(feedback);
                const timeSinceEscalation = feedback.escalated_at 
                  ? Math.floor((new Date().getTime() - new Date(feedback.escalated_at).getTime()) / (1000 * 60 * 60))
                  : 0;

                return (
                  <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">Case {feedback.case_number}</h3>
                          <Badge variant="destructive">{feedback.priority}</Badge>
                          <Badge className={slaStatus.color}>
                            {slaStatus.status === 'violated' ? 'SLA VIOLATED' : 
                             slaStatus.status === 'critical' ? 'SLA CRITICAL' : 'ON TIME'}
                          </Badge>
                          {feedback.auto_escalated && (
                            <Badge variant="outline">Auto-Escalated</Badge>
                          )}
                        </div>
                        <p className="text-gray-600">
                          <strong>Category:</strong> {feedback.complaint_category} | 
                          <strong> Location:</strong> {feedback.market} - Store {feedback.store_number} |
                          <strong> Customer:</strong> {feedback.customer_name || 'Not provided'}
                        </p>
                        {feedback.sla_deadline && (
                          <p className="text-sm text-gray-500">
                            <strong>SLA Deadline:</strong> {new Date(feedback.sla_deadline).toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm text-orange-600">
                          <strong>Escalated:</strong> {timeSinceEscalation}h ago
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setExecutiveNotes(feedback.executive_notes || '');
                            setIsNotesDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Add Notes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markAsReviewed(feedback.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Reviewed
                        </Button>
                      </div>
                    </div>
                    
                    {feedback.feedback_text && (
                      <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer Feedback:</p>
                        <p className="text-sm text-gray-600 italic">{feedback.feedback_text}</p>
                      </div>
                    )}

                    {feedback.executive_notes && (
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-300">
                        <p className="text-sm font-medium text-blue-700 mb-1">Executive Notes:</p>
                        <p className="text-sm text-blue-600">{feedback.executive_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Executive Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Executive Notes</DialogTitle>
            <DialogDescription>
              Case {selectedFeedback?.case_number} - {selectedFeedback?.complaint_category}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Executive Notes:</label>
              <Textarea
                value={executiveNotes}
                onChange={(e) => setExecutiveNotes(e.target.value)}
                placeholder={`As ${userRole.toUpperCase()}, provide your assessment, directives, or oversight notes...`}
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addExecutiveNotes} disabled={!executiveNotes.trim()}>
                Save Executive Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}