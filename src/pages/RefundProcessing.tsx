import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RefundDetailDialog } from '@/components/refund/RefundDetailDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RefundRequest {
  id: string;
  feedback_id: string;
  requested_by: string;
  requested_at: string;
  refund_amount: number;
  refund_reason: string;
  refund_method: string;
  notes: string | null;
  status: string;
  manager_approved_by: string | null;
  manager_approved_at: string | null;
  manager_notes: string | null;
  director_approved_by: string | null;
  director_approved_at: string | null;
  director_notes: string | null;
  final_approved_by: string | null;
  final_approved_at: string | null;
  final_notes: string | null;
  denied_by: string | null;
  denied_at: string | null;
  denial_reason: string | null;
  completed_at: string | null;
  completed_by: string | null;
  store_number: string | null;
  market: string | null;
  customer_name: string | null;
  case_number: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400', icon: Clock },
  manager_approved: { label: 'Manager Approved', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400', icon: ChevronRight },
  director_approved: { label: 'Director Approved', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400', icon: ChevronRight },
  approved: { label: 'Fully Approved', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2 },
};

export default function RefundProcessing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deny' | 'complete'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.title = 'Refund Processing - Atlas';
    loadRefundRequests();
  }, []);

  const loadRefundRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as RefundRequest[]) || []);
    } catch (error) {
      console.error('Error loading refund requests:', error);
      toast({ title: 'Error', description: 'Failed to load refund requests.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => ['manager_approved', 'director_approved'].includes(r.status)).length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    denied: requests.filter(r => r.status === 'denied').length,
    totalAmount: requests.filter(r => r.status !== 'denied').reduce((sum, r) => sum + Number(r.refund_amount), 0),
  };

  const openAction = (request: RefundRequest, type: 'approve' | 'deny' | 'complete') => {
    setSelectedRequest(request);
    setActionType(type);
    setActionNotes('');
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest || !user) return;
    setProcessing(true);

    try {
      let updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (actionType === 'deny') {
        updateFields = {
          ...updateFields,
          status: 'denied',
          denied_by: user.id,
          denied_at: new Date().toISOString(),
          denial_reason: actionNotes || null,
        };
      } else if (actionType === 'complete') {
        updateFields = {
          ...updateFields,
          status: 'completed',
          completed_by: user.id,
          completed_at: new Date().toISOString(),
        };
      } else {
        // Approval chain
        const currentStatus = selectedRequest.status;
        if (currentStatus === 'pending') {
          updateFields = {
            ...updateFields,
            status: 'manager_approved',
            manager_approved_by: user.id,
            manager_approved_at: new Date().toISOString(),
            manager_notes: actionNotes || null,
          };
        } else if (currentStatus === 'manager_approved') {
          updateFields = {
            ...updateFields,
            status: 'director_approved',
            director_approved_by: user.id,
            director_approved_at: new Date().toISOString(),
            director_notes: actionNotes || null,
          };
        } else if (currentStatus === 'director_approved') {
          updateFields = {
            ...updateFields,
            status: 'approved',
            final_approved_by: user.id,
            final_approved_at: new Date().toISOString(),
            final_notes: actionNotes || null,
          };
        }
      }

      const { error } = await supabase
        .from('refund_requests')
        .update(updateFields)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({ title: 'Success', description: `Refund request ${actionType === 'deny' ? 'denied' : actionType === 'complete' ? 'completed' : 'approved'} successfully.` });
      setActionDialogOpen(false);
      await loadRefundRequests();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({ title: 'Error', description: 'Failed to process refund request.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const getNextApprovalLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Manager Approve';
      case 'manager_approved': return 'Director Approve';
      case 'director_approved': return 'Final Approve';
      default: return 'Approve';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Refund Processing</h1>
        <p className="text-muted-foreground mt-1">Review and process guest refund requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('approved')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('completed')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('denied')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
            <p className="text-xs text-muted-foreground">Denied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">${stats.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="manager_approved">Manager Approved</SelectItem>
            <SelectItem value="director_approved">Director Approved</SelectItem>
            <SelectItem value="approved">Fully Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filteredRequests.length} requests</Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No refund requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const config = statusConfig[request.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.case_number || '—'}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">#{request.store_number}</span>
                            {request.market && (
                              <span className="text-xs text-muted-foreground ml-1">({request.market})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.customer_name || '—'}</TableCell>
                        <TableCell className="font-semibold">${Number(request.refund_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{request.refund_reason}</TableCell>
                        <TableCell className="text-sm">{request.refund_method}</TableCell>
                        <TableCell>
                          <Badge className={cn('flex items-center gap-1 w-fit', config.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(request.requested_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {['pending', 'manager_approved', 'director_approved'].includes(request.status) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => openAction(request, 'approve')}
                                >
                                  {getNextApprovalLabel(request.status)}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                  onClick={() => openAction(request, 'deny')}
                                >
                                  Deny
                                </Button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => openAction(request, 'complete')}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={(open) => !open && setActionDialogOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Refund' : actionType === 'deny' ? 'Deny Refund' : 'Complete Refund'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>Case #{selectedRequest.case_number} — ${Number(selectedRequest.refund_amount).toFixed(2)}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder={actionType === 'deny' ? 'Reason for denial...' : 'Add notes (optional)...'}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={actionType === 'deny' ? 'destructive' : 'default'}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionType === 'approve' ? 'Approve' : actionType === 'deny' ? 'Deny' : 'Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
