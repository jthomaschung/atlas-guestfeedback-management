import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DollarSign, Loader2, Camera, X, Send, CheckCircle2, Clock, XCircle, ChevronRight, ImageIcon, Upload,
} from 'lucide-react';

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
  receipt_image_url?: string | null;
  receipt_bypassed?: boolean;
  receipt_bypass_reason?: string | null;
  refund_receipt_url?: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending DM', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  dm_approved: { label: 'DM Approved', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ChevronRight },
  awaiting_director: { label: 'Awaiting Director', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: Clock },
  awaiting_catering: { label: 'Awaiting Catering', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  approved: { label: 'Fully Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
};

interface RefundDetailDialogProps {
  request: RefundRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function RefundDetailDialog({ request, isOpen, onClose, onUpdate }: RefundDetailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [requesterEmail, setRequesterEmail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (request) {
      setActionNotes('');
      setReceiptFile(null);
      setReceiptPreview(null);
      loadEmails(request);
    }
  }, [request?.id]);

  const loadEmails = async (req: RefundRequest) => {
    // Use customer email from refund request directly, fallback to feedback record
    if (req.customer_email) {
      setCustomerEmail(req.customer_email);
    } else {
      const { data: fb } = await supabase
        .from('customer_feedback')
        .select('customer_email')
        .eq('id', req.feedback_id)
        .single();
      setCustomerEmail(fb?.customer_email || null);
    }

    // Get requester email from profiles (user_id references auth.users)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', req.requested_by)
      .single();
    setRequesterEmail(profile?.email || null);
  };

  if (!request) return null;

  const config = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File must be under 10MB', variant: 'destructive' });
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) return;
    setUploading(true);
    try {
      const ext = receiptFile.name.split('.').pop();
      const path = `refund-receipts/${request.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('refund-receipts')
        .upload(path, receiptFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('refund-receipts').getPublicUrl(path);

      const { error } = await supabase
        .from('refund_requests')
        .update({ refund_receipt_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', request.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Refund receipt uploaded successfully' });
      setReceiptFile(null);
      setReceiptPreview(null);
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Error', description: 'Failed to upload receipt', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const getNextApproval = (req: RefundRequest): { label: string; role: 'dm' | 'director' | 'catering' } | null => {
    if (!req.manager_approved_at) return { label: 'DM Approve', role: 'dm' };
    if (req.requires_director_approval && !req.director_approved_at) return { label: 'Director Approve', role: 'director' };
    if (req.requires_catering_approval && !req.catering_approved_at) return { label: 'Catering Approve', role: 'catering' };
    return null;
  };

  const allApprovalsMet = (req: RefundRequest, overrideRole?: string): boolean => {
    const dmDone = !!req.manager_approved_at || overrideRole === 'dm';
    const directorDone = !req.requires_director_approval || !!req.director_approved_at || overrideRole === 'director';
    const cateringDone = !req.requires_catering_approval || !!req.catering_approved_at || overrideRole === 'catering';
    return dmDone && directorDone && cateringDone;
  };

  const handleAction = async (type: 'approve' | 'deny' | 'complete') => {
    if (!user) return;
    setProcessing(true);
    try {
      let updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (type === 'deny') {
        updateFields = { ...updateFields, status: 'denied', denied_by: user.id, denied_at: new Date().toISOString(), denial_reason: actionNotes || null };
      } else if (type === 'complete') {
        updateFields = { ...updateFields, status: 'completed', completed_by: user.id, completed_at: new Date().toISOString() };
      } else {
        const next = getNextApproval(request);
        if (!next) return;

        if (next.role === 'dm') {
          updateFields.manager_approved_by = user.id;
          updateFields.manager_approved_at = new Date().toISOString();
          updateFields.manager_notes = actionNotes || null;
        } else if (next.role === 'director') {
          updateFields.director_approved_by = user.id;
          updateFields.director_approved_at = new Date().toISOString();
          updateFields.director_notes = actionNotes || null;
        } else if (next.role === 'catering') {
          updateFields.catering_approved_by = user.id;
          updateFields.catering_approved_at = new Date().toISOString();
          updateFields.catering_notes = actionNotes || null;
        }

        if (allApprovalsMet(request, next.role)) {
          updateFields.status = 'approved';
        } else {
          if (next.role === 'dm') {
            if (request.requires_director_approval && !request.director_approved_at) updateFields.status = 'awaiting_director';
            else if (request.requires_catering_approval && !request.catering_approved_at) updateFields.status = 'awaiting_catering';
            else updateFields.status = 'approved';
          } else if (next.role === 'director') {
            if (request.requires_catering_approval && !request.catering_approved_at) updateFields.status = 'awaiting_catering';
            else updateFields.status = 'approved';
          } else {
            updateFields.status = 'approved';
          }
        }
      }

      const { error } = await supabase.from('refund_requests').update(updateFields).eq('id', request.id);
      if (error) throw error;

      // Send notifications for next required approval
      if (type === 'approve') {
        try {
          const nextStatus = updateFields.status as string;
          if (nextStatus === 'awaiting_director') {
            await supabase.functions.invoke('send-refund-approval-notification', {
              body: { refundRequestId: request.id, notificationType: 'director_needed' },
            });
          } else if (nextStatus === 'awaiting_catering') {
            await supabase.functions.invoke('send-refund-approval-notification', {
              body: { refundRequestId: request.id, notificationType: 'catering_needed' },
            });
          }
        } catch (notifErr) {
          console.error('Notification send failed:', notifErr);
        }
      }

      toast({ title: 'Success', description: `Refund request ${type === 'deny' ? 'denied' : type === 'complete' ? 'completed' : 'approved'}` });
      setActionNotes('');
      onUpdate();
    } catch (error) {
      console.error('Action error:', error);
      toast({ title: 'Error', description: 'Failed to process action', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const nextApproval = getNextApproval(request);
  const canApprove = nextApproval !== null && !['approved', 'denied', 'completed'].includes(request.status);
  const canComplete = request.status === 'approved';

  const handleSendReceipt = async () => {
    const receiptUrl = request.refund_receipt_url || request.receipt_image_url;
    const recipients: string[] = [];
    if (customerEmail) recipients.push(customerEmail);
    if (requesterEmail) recipients.push(requesterEmail);

    if (recipients.length === 0) {
      toast({ title: 'Error', description: 'No email addresses found for customer or requester', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-refund-receipt', {
        body: {
          refundRequestId: request.id,
          recipientEmails: recipients,
          receiptUrl: receiptUrl || null,
        },
      });
      if (error) throw error;
      toast({ title: 'Sent!', description: `Receipt emailed to ${recipients.join(', ')}` });
    } catch (error) {
      console.error('Send error:', error);
      toast({ title: 'Error', description: 'Failed to send receipt email', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Refund Request Details
          </DialogTitle>
          <DialogDescription>
            Case #{request.case_number || '—'} — ${Number(request.refund_amount).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge className={cn('flex items-center gap-1', config.color)}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{format(new Date(request.requested_at), 'MMM d, yyyy h:mm a')}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Customer</p>
              <p className="font-medium">{request.customer_name || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Store</p>
              <p className="font-medium">#{request.store_number} {request.market && `(${request.market})`}</p>
            </div>
            {request.customer_email && (
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium text-xs break-all">{request.customer_email}</p>
              </div>
            )}
            {request.customer_phone && (
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium">{request.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Amount</p>
              <p className="font-bold text-lg">${Number(request.refund_amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Method</p>
              <p className="font-medium">{request.refund_method}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Reason</p>
              <p className="font-medium">{request.refund_reason}</p>
            </div>
            {request.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Notes</p>
                <p className="text-sm">{request.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Original Receipt */}
          <div>
            <Label className="text-xs text-muted-foreground">Original Receipt</Label>
            {request.receipt_image_url ? (
              <a href={request.receipt_image_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                <img src={request.receipt_image_url} alt="Receipt" className="rounded-md border max-h-40 object-contain w-full bg-muted" />
              </a>
            ) : request.receipt_bypassed ? (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>Bypassed: {request.receipt_bypass_reason || 'No reason provided'}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">No receipt attached</p>
            )}
          </div>

          <Separator />

          {/* Refund Receipt Upload */}
          <div>
            <Label className="text-xs text-muted-foreground">Refund Receipt (proof of refund)</Label>
            {request.refund_receipt_url ? (
              <a href={request.refund_receipt_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                <img src={request.refund_receipt_url} alt="Refund receipt" className="rounded-md border max-h-40 object-contain w-full bg-muted" />
              </a>
            ) : (
              <div className="mt-1">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                {receiptPreview ? (
                  <div className="relative rounded-md border overflow-hidden">
                    <img src={receiptPreview} alt="Preview" className="w-full max-h-40 object-contain bg-muted" />
                    <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload refund receipt</p>
                  </div>
                )}
                {receiptFile && (
                  <Button size="sm" className="mt-2 w-full" onClick={handleUploadReceipt} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                    Save Receipt
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Send Receipt Email */}
          {(request.refund_receipt_url || request.receipt_image_url) && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Send Receipt via Email</Label>
              <div className="text-xs space-y-1">
                {customerEmail && <p>Guest: <span className="font-medium">{customerEmail}</span></p>}
                {requesterEmail && <p>Requester: <span className="font-medium">{requesterEmail}</span></p>}
                {!customerEmail && !requesterEmail && <p className="text-muted-foreground">No email addresses available</p>}
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={handleSendReceipt} disabled={sending || (!customerEmail && !requesterEmail)}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Receipt to {[customerEmail && 'Guest', requesterEmail && 'Requester'].filter(Boolean).join(' & ')}
              </Button>
            </div>
          )}

          {/* Approval Timeline */}
          {(request.manager_approved_at || request.director_approved_at || request.catering_approved_at || request.denied_at || request.completed_at) && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Approval Timeline</Label>
                <div className="space-y-1 mt-1 text-xs">
                  {request.manager_approved_at && <p>✅ DM approved — {format(new Date(request.manager_approved_at), 'MMM d h:mm a')}</p>}
                  {request.requires_director_approval && !request.director_approved_at && request.manager_approved_at && <p>⏳ Awaiting Director approval</p>}
                  {request.director_approved_at && <p>✅ Director approved — {format(new Date(request.director_approved_at), 'MMM d h:mm a')}</p>}
                  {request.requires_catering_approval && !request.catering_approved_at && request.manager_approved_at && <p>⏳ Awaiting Catering approval</p>}
                  {request.catering_approved_at && <p>✅ Catering approved — {format(new Date(request.catering_approved_at), 'MMM d h:mm a')}</p>}
                  {request.completed_at && <p>✅ Completed — {format(new Date(request.completed_at), 'MMM d h:mm a')}</p>}
                  {request.denied_at && <p>❌ Denied — {format(new Date(request.denied_at), 'MMM d h:mm a')}{request.denial_reason && `: ${request.denial_reason}`}</p>}
                </div>
              </div>
            </>
          )}


          {/* Action section */}
          {(canApprove || canComplete) && (
            <>
              <Separator />
              <div className="space-y-2">
                <Textarea
                  placeholder="Add notes (optional)..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                  maxLength={1000}
                />
                <div className="flex gap-2">
                  {canApprove && (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => handleAction('approve')} disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                        {nextApproval?.label || 'Approve'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction('deny')} disabled={processing}>
                        Deny
                      </Button>
                    </>
                  )}
                  {canComplete && (
                    <Button size="sm" className="flex-1" onClick={() => handleAction('complete')} disabled={processing}>
                      {processing && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
