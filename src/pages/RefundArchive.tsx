import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, DollarSign, CheckCircle2, XCircle, Archive, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RefundDetailDialog } from '@/components/refund/RefundDetailDialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
  catering_approved_by: string | null;
  catering_approved_at: string | null;
  catering_notes: string | null;
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
  customer_email: string | null;
  customer_phone: string | null;
  case_number: string | null;
  requires_director_approval: boolean;
  requires_catering_approval: boolean;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2 },
};

export default function RefundArchive() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    document.title = 'Refund Archive - Atlas';
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .in('status', ['denied', 'completed'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setRequests((data as RefundRequest[]) || []);
    } catch (error) {
      console.error('Error loading refund archive:', error);
      toast({ title: 'Error', description: 'Failed to load refund archive.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!term) return true;
      return (
        r.case_number?.toLowerCase().includes(term) ||
        r.customer_name?.toLowerCase().includes(term) ||
        r.customer_email?.toLowerCase().includes(term) ||
        r.store_number?.toLowerCase().includes(term) ||
        r.market?.toLowerCase().includes(term) ||
        r.refund_reason?.toLowerCase().includes(term)
      );
    });
  }, [requests, statusFilter, search]);

  const stats = {
    completed: requests.filter(r => r.status === 'completed').length,
    denied: requests.filter(r => r.status === 'denied').length,
    completedAmount: requests.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.refund_amount), 0),
    deniedAmount: requests.filter(r => r.status === 'denied').reduce((s, r) => s + Number(r.refund_amount), 0),
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
      <div className="flex items-center gap-3">
        <Archive className="h-7 w-7 text-muted-foreground" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Refund Archive</h1>
          <p className="text-muted-foreground mt-1">Historical record of completed and denied refund requests</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
            <p className="text-xs text-muted-foreground">Denied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">${stats.completedAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Completed Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">${stats.deniedAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Denied Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Archived</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search case #, customer, store, market..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">{filtered.length} records</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No archived refund requests found.</p>
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
                    <TableHead>Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((request) => {
                    const config = statusConfig[request.status] || statusConfig.completed;
                    const StatusIcon = config.icon;
                    const resolvedAt = request.status === 'denied'
                      ? request.denied_at
                      : request.completed_at;
                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => { setSelectedRequest(request); setDetailDialogOpen(true); }}
                      >
                        <TableCell className="font-mono text-xs">{request.case_number || '—'}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">#{request.store_number}</span>
                            {request.market && (
                              <span className="text-xs text-muted-foreground ml-1">({request.market})</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span>{request.customer_name || '—'}</span>
                            {request.customer_email && (
                              <p className="text-xs text-muted-foreground">{request.customer_email}</p>
                            )}
                          </div>
                        </TableCell>
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
                          {resolvedAt ? format(new Date(resolvedAt), 'MMM d, yyyy') : '—'}
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

      <RefundDetailDialog
        request={selectedRequest}
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onUpdate={() => { load(); }}
      />
    </div>
  );
}
