import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, TrendingUp, FileText, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MentionsTextarea } from '@/components/ui/mentions-textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CustomerFeedback } from '@/types/feedback';
import { FeedbackDetailsDialog } from '@/components/feedback/FeedbackDetailsDialog';

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

interface ApprovalStatus {
  ceo_approved_at?: string;
  vp_approved_at?: string;
  director_approved_at?: string;
  approval_status: string;
  ready_for_dm_resolution: boolean;
}

interface RequiredApprover {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  approval_order: number;
}

export function ExecutiveDashboard({ userRole }: ExecutiveDashboardProps) {
  const [criticalFeedbacks, setCriticalFeedbacks] = useState<CustomerFeedback[]>([]);
  const [escalationLogs, setEscalationLogs] = useState<EscalationLog[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);
  const [executiveNotes, setExecutiveNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [pendingArchiveFeedbackId, setPendingArchiveFeedbackId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState<CustomerFeedback | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Regional groupings
  const regionalGroups = {
    'west-coast': ['AZ 1', 'AZ 2', 'AZ 3', 'AZ 4', 'AZ 5', 'IE/LA', 'OC'],
    'mid-west': ['NE 1', 'NE 2', 'NE 3', 'NE 4'],
    'south-east': ['FL 1', 'FL 2'],
    'north-east': ['MN 1', 'MN 2', 'PA 1']
  };

  useEffect(() => {
    loadExecutiveData();
  }, [user]);

  const loadExecutiveData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load critical/escalated feedback with approval status
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('customer_feedback')
        .select(`
          *,
          critical_feedback_approvals(*)
        `)
        .eq('priority', 'Critical')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Debug: Log the feedbacks with approvals
      console.log('Loaded feedbacks with approvals:', feedbacks);
      feedbacks?.forEach(f => {
        console.log(`Case ${f.case_number}:`, (f as any).critical_feedback_approvals);
      });

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
      // Check for @mentions in the notes
      const mentions = [];
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      let match;
      
      while ((match = mentionRegex.exec(executiveNotes)) !== null) {
        const mentionedName = match[1];
        
        // Look up user by display name in profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, email, display_name')
          .ilike('display_name', `%${mentionedName}%`)
          .limit(1);
        
        if (profileData && profileData.length > 0) {
          mentions.push({
            user_id: profileData[0].user_id,
            email: profileData[0].email,
            display_name: profileData[0].display_name
          });
        }
      }

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

      // Send notifications to mentioned users
      if (mentions.length > 0) {
        for (const mention of mentions) {
          try {
            await supabase.functions.invoke('send-notifications', {
              body: {
                type: 'mention',
                recipient_email: mention.email,
                data: {
                  message: `You were mentioned in executive notes for case ${selectedFeedback.case_number}`,
                  feedback_id: selectedFeedback.id,
                  case_number: selectedFeedback.case_number,
                  mentioned_by: user?.email
                }
              }
            });
          } catch (notificationError) {
            console.error('Error sending mention notification:', notificationError);
          }
        }
      }

      toast({
        title: "Success",
        description: `Executive notes added successfully${mentions.length > 0 ? ` and ${mentions.length} user(s) notified` : ''}`,
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

  const approveCriticalFeedback = async (feedbackId: string) => {
    try {
      // Get user's role and profile from hierarchy
      const { data: userHierarchy } = await supabase
        .from('user_hierarchy')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (!userHierarchy) {
        throw new Error('User role not found');
      }

      // Get user's profile for display name
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user?.id)
        .single();

      // Insert approval record
      const { error: approvalError } = await supabase
        .from('critical_feedback_approvals')
        .insert({
          feedback_id: feedbackId,
          approver_user_id: user?.id,
          approver_role: userHierarchy.role.toLowerCase(),
          executive_notes: executiveNotes || null
        });

      if (approvalError) throw approvalError;

      // Send notification to executives about this approval
      try {
        await supabase.functions.invoke('send-executive-approval-notification', {
          body: {
            feedbackId: feedbackId,
            approverRole: userHierarchy.role,
            approverName: userProfile?.display_name || user?.email || 'Executive'
          }
        });
        console.log('Executive approval notifications sent');
      } catch (notifError) {
        console.error('Failed to send approval notifications:', notifError);
        // Don't fail the approval if notification fails
      }

      // Check if all 4 roles have now approved (CEO, VP, Director, DM)
      const { data: allApprovals, error: checkError } = await supabase
        .from('critical_feedback_approvals')
        .select('approver_role')
        .eq('feedback_id', feedbackId);

      if (checkError) throw checkError;

      const approvedRoles = new Set(allApprovals?.map(a => a.approver_role.toLowerCase()) || []);
      const allFourApproved = approvedRoles.has('ceo') && approvedRoles.has('vp') && approvedRoles.has('director') && approvedRoles.has('dm');

      console.log('Approval check:', {
        feedbackId,
        approvedRoles: Array.from(approvedRoles),
        allFourApproved,
        totalApprovals: allApprovals?.length
      });

      // If all 4 roles approved, show confirmation dialog before archiving
      if (allFourApproved) {
        setPendingArchiveFeedbackId(feedbackId);
        setIsArchiveConfirmOpen(true);
      } else {
        const pending = ['ceo', 'vp', 'director', 'dm'].filter(role => !approvedRoles.has(role));
        toast({
          title: "Success",
          description: `Critical feedback approved by ${userHierarchy.role.toUpperCase()}. Pending: ${pending.map(r => r.toUpperCase()).join(', ')}`,
        });
      }

      setExecutiveNotes('');
      loadExecutiveData();
    } catch (error: any) {
      console.error('Error approving critical feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve critical feedback",
      });
    }
  };

  const confirmArchiveFeedback = async () => {
    if (!pendingArchiveFeedbackId) return;

    try {
      const { error: updateError } = await supabase
        .from('customer_feedback')
        .update({
          resolution_status: 'resolved',
          ready_for_dm_resolution: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingArchiveFeedbackId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "All 4 approvals complete - Feedback archived!",
      });

      setIsArchiveConfirmOpen(false);
      setPendingArchiveFeedbackId(null);
      loadExecutiveData();
    } catch (error: any) {
      console.error('Error archiving feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to archive feedback",
      });
    }
  };

  const getApprovalStatus = (feedback: CustomerFeedback) => {
    const approvals = (feedback as any).critical_feedback_approvals || [];
    
    // Check both new approval records AND legacy timestamp columns for each role
    const ceoApproved = approvals.some((a: any) => a.approver_role?.toLowerCase() === 'ceo') || !!feedback.ceo_approved_at;
    const vpApproved = approvals.some((a: any) => a.approver_role?.toLowerCase() === 'vp') || !!feedback.vp_approved_at;
    const directorApproved = approvals.some((a: any) => a.approver_role?.toLowerCase() === 'director') || !!feedback.director_approved_at;
    const dmApproved = approvals.some((a: any) => a.approver_role?.toLowerCase() === 'dm') || !!feedback.dm_approved_at;
    
    return { ceoApproved, vpApproved, directorApproved, dmApproved };
  };

  const canUserApprove = (feedback: CustomerFeedback, userRole: string) => {
    const approvals = (feedback as any).critical_feedback_approvals || [];
    const hasUserApproved = approvals.some((a: any) => a.approver_user_id === user?.id);
    
    // Normalize the role to lowercase for comparison
    const normalizedRole = userRole.toLowerCase().trim();
    
    // Check if user already approved
    if (hasUserApproved) {
      return false;
    }
    
    // Allow any executive role (CEO, VP, Director, DM, Admin) to approve at any time
    const isExecutive = ['ceo', 'vp', 'director', 'dm', 'admin'].includes(normalizedRole);
    
    return isExecutive;
  };

  const getSlaStatus = (feedback: CustomerFeedback) => {
    if (!feedback.sla_deadline) return { status: 'none', color: 'bg-gray-100' };
    
    const deadline = new Date(feedback.sla_deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursLeft = timeDiff / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      return { status: 'violated', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (hoursLeft < 4) {
      return { status: 'critical', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    } else if (hoursLeft < 12) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { status: 'normal', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getSlaTimeRemaining = (slaDeadline: string | null | undefined): string => {
    if (!slaDeadline) return 'No deadline';
    
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const totalMinutes = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));
    
    if (totalMinutes < 0) {
      const hoursOverdue = Math.abs(Math.floor(totalMinutes / 60));
      const minutesOverdue = Math.abs(totalMinutes % 60);
      return `${hoursOverdue}h ${minutesOverdue}m OVERDUE`;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m remaining`;
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

  // Filter feedbacks based on selected region
  const filteredFeedbacks = selectedRegion === 'all' 
    ? criticalFeedbacks 
    : criticalFeedbacks.filter(f => {
        const markets = regionalGroups[selectedRegion as keyof typeof regionalGroups] || [];
        return markets.includes(f.market);
      });

  return (
    <div className="p-6 space-y-6">
      {/* Executive Header */}
      <div className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Critical customer feedback requiring {userRole.toUpperCase()} oversight
            </p>
          </div>
          
          {/* Regional Filter */}
          <div className="w-64">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="west-coast">West Coast (Tanner)</SelectItem>
                <SelectItem value="mid-west">Mid West (Michelle)</SelectItem>
                <SelectItem value="south-east">South East (Don)</SelectItem>
                <SelectItem value="north-east">North East</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
          <CardDescription className="space-y-1">
            <p>Issues that have been escalated to executive level due to severity or SLA violations</p>
            <p className="text-sm font-medium text-orange-600">⏰ All critical feedback must be resolved within 48 hours of escalation</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {selectedRegion === 'all' 
                  ? 'No critical issues currently require executive attention'
                  : 'No critical issues in this region'}
              </p>
            ) : (
              filteredFeedbacks.map((feedback) => {
                const slaStatus = getSlaStatus(feedback);
                const timeSinceEscalation = feedback.escalated_at 
                  ? Math.floor((new Date().getTime() - new Date(feedback.escalated_at).getTime()) / (1000 * 60 * 60))
                  : 0;

                return (
                  <div 
                    key={feedback.id} 
                    className="border rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setDetailsFeedback(feedback);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">Case {feedback.case_number}</h3>
                          <Badge variant="destructive">{feedback.priority}</Badge>
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
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-600">SLA Status:</span>
                            {slaStatus.status === 'violated' && (
                              <Badge variant="destructive" className="whitespace-nowrap">
                                🚨 {getSlaTimeRemaining(feedback.sla_deadline)}
                              </Badge>
                            )}
                            {slaStatus.status === 'critical' && (
                              <Badge variant="destructive" className="whitespace-nowrap bg-orange-500 hover:bg-orange-600">
                                🔥 {getSlaTimeRemaining(feedback.sla_deadline)}
                              </Badge>
                            )}
                            {slaStatus.status === 'warning' && (
                              <Badge variant="outline" className="whitespace-nowrap border-yellow-500 text-yellow-600">
                                ⚠️ {getSlaTimeRemaining(feedback.sla_deadline)}
                              </Badge>
                            )}
                            {slaStatus.status === 'normal' && (
                              <span className="text-green-600 font-medium">
                                ✓ {getSlaTimeRemaining(feedback.sla_deadline)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              (Due: {new Date(feedback.sla_deadline).toLocaleString()})
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-orange-600">
                          <strong>Escalated:</strong> {timeSinceEscalation}h ago
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeedback(feedback);
                              setExecutiveNotes(feedback.executive_notes || '');
                              setIsNotesDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Add Notes
                          </Button>
                          {canUserApprove(feedback, userRole) && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                approveCriticalFeedback(feedback.id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Approve ({userRole.toUpperCase()})
                            </Button>
                          )}
                        </div>
                        
                        {/* Approval Status Display */}
                        <div className="flex space-x-2 text-xs">
                          {(() => {
                            const { ceoApproved, vpApproved, directorApproved, dmApproved } = getApprovalStatus(feedback);
                            return (
                              <>
                                <Badge variant={ceoApproved ? "default" : "outline"}>
                                  CEO {ceoApproved ? "✓" : "⏳"}
                                </Badge>
                                <Badge variant={vpApproved ? "default" : "outline"}>
                                  VP {vpApproved ? "✓" : "⏳"}
                                </Badge>
                                <Badge variant={directorApproved ? "default" : "outline"}>
                                  DIR {directorApproved ? "✓" : "⏳"}
                                </Badge>
                                <Badge variant={dmApproved ? "default" : "outline"}>
                                  DM {dmApproved ? "✓" : "⏳"}
                                </Badge>
                              </>
                            );
                          })()}
                        </div>
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
              <MentionsTextarea
                value={executiveNotes}
                onChange={setExecutiveNotes}
                placeholder={`As ${userRole.toUpperCase()}, provide your assessment, directives, or oversight notes... (Use @ to mention users)`}
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

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Archive Escalated Feedback?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>All 4 required approvals have been received:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✓ CEO Approval</li>
                <li>✓ VP Approval</li>
                <li>✓ Director Approval</li>
                <li>✓ DM Approval</li>
              </ul>
              <p className="font-medium text-gray-900 mt-3">
                This will move the feedback to "Resolved" status and archive it from the executive dashboard.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsArchiveConfirmOpen(false);
              setPendingArchiveFeedbackId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchiveFeedback} className="bg-green-600 hover:bg-green-700">
              Archive Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback Details Dialog */}
      <FeedbackDetailsDialog
        feedback={detailsFeedback}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onUpdate={loadExecutiveData}
      />
    </div>
  );
}