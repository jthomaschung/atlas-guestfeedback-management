import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Loader2, Camera, X, ImageIcon } from 'lucide-react';

interface StandaloneRefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const refundReasons = [
  'Wrong Order',
  'Quality Issue',
  'Missing Items',
  'Food Safety Concern',
  'Service Issue',
  'Overcharged',
  'Duplicate Charge',
  'Catering Refund',
  'Other',
];

const refundMethods = [
  'Original Payment Method',
  'Gift Card',
  'Store Credit',
  'Cash',
];

export function StandaloneRefundDialog({ isOpen, onClose }: StandaloneRefundDialogProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [method] = useState('Original Payment Method');
  const [notes, setNotes] = useState('');
  const [storeNumber, setStoreNumber] = useState('');
  const [market, setMarket] = useState('');
  const [stores, setStores] = useState<{ store_number: string; region: string }[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase
        .from('stores')
        .select('store_number, region')
        .neq('store_number', 'Corp')
        .order('store_number');
      if (data) {
        setStores(data.filter((s) => !s.store_number.includes('PLACEHOLDER')) as { store_number: string; region: string }[]);
      }
    };
    fetchStores();
  }, []);

  const handleStoreChange = (value: string) => {
    setStoreNumber(value);
    const found = stores.find((s) => s.store_number === value);
    setMarket(found?.region || '');
  };
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [bypassReceipt, setBypassReceipt] = useState(false);
  const [bypassReason, setBypassReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setBypassReceipt(false);
    setBypassReason('');
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setAmount('');
    setReason('');
    
    setNotes('');
    setStoreNumber('');
    setMarket('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    clearReceipt();
    setBypassReceipt(false);
    setBypassReason('');
  };

  const handleSubmit = async () => {
    if (!amount || !reason || !method || !storeNumber || !market) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!receiptFile && !bypassReceipt) {
      toast.error('Please upload a receipt photo or provide a bypass reason');
      return;
    }

    if (bypassReceipt && !bypassReason.trim()) {
      toast.error('Please provide a reason for bypassing the receipt');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (!user?.id) {
      toast.error('You must be signed in to submit a refund request');
      return;
    }

    setSubmitting(true);
    console.log('[StandaloneRefund] Submit start', { user_id: user.id, amount: parsedAmount, storeNumber, market, hasReceipt: !!receiptFile, fileSize: receiptFile?.size });

    // Hard 45s safety net so UI never hangs forever — set BEFORE any await
    const timeoutId = setTimeout(() => {
      console.error('[StandaloneRefund] Submission timed out after 45s (safety net)');
      toast.error('Submission timed out. Please try again.');
      setSubmitting(false);
    }, 45000);

    // Helper: race a thenable/promise against a timeout
    const withTimeout = <T,>(p: PromiseLike<T>, ms: number, label: string): Promise<T> =>
      Promise.race([
        Promise.resolve(p),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
        ),
      ]);

    try {
      // Verify auth session is actually live — with timeout so it never hangs
      console.log('[StandaloneRefund] Checking session...');
      const sessionResult = await withTimeout(supabase.auth.getSession(), 8000, 'Session check');
      console.log('[StandaloneRefund] Session check done', { hasSession: !!sessionResult?.data?.session });
      if (!sessionResult?.data?.session) {
        clearTimeout(timeoutId);
        toast.error('Your session has expired. Please sign in again.');
        setSubmitting(false);
        return;
      }

      let receiptUrl: string | null = null;

      if (receiptFile) {
        console.log('[StandaloneRefund] Uploading receipt...', { size: receiptFile.size, type: receiptFile.type });
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `standalone/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await withTimeout(
          supabase.storage.from('refund-receipts').upload(filePath, receiptFile, {
            contentType: receiptFile.type,
            upsert: false,
          }),
          30000,
          'Receipt upload'
        );
        if (uploadError) {
          console.error('[StandaloneRefund] Upload error', uploadError);
          throw uploadError;
        }
        const { data: urlData } = supabase.storage
          .from('refund-receipts')
          .getPublicUrl(filePath);
        receiptUrl = urlData.publicUrl;
        console.log('[StandaloneRefund] Receipt uploaded', { receiptUrl });
      }

      const isCatering = reason === 'Catering Refund';
      const needsApproval = parsedAmount > 25 || isCatering;

      console.log('[StandaloneRefund] Inserting refund_requests row...');
      const { data, error } = await withTimeout(
        supabase
          .from('refund_requests')
          .insert({
            feedback_id: null,
            requested_by: user.id,
            refund_amount: parsedAmount,
            refund_reason: reason,
            refund_method: method,
            notes: notes || null,
            store_number: storeNumber,
            market: market,
            customer_name: customerName || null,
            customer_email: customerEmail || null,
            customer_phone: customerPhone || null,
            case_number: null,
            receipt_image_url: receiptUrl,
            receipt_bypassed: bypassReceipt,
            receipt_bypass_reason: bypassReceipt ? bypassReason : null,
            requires_director_approval: parsedAmount > 25,
            requires_catering_approval: isCatering,
            status: needsApproval ? 'pending' : 'approved',
          })
          .select('id')
          .single(),
        15000,
        'Database insert'
      );

      console.log('[StandaloneRefund] Insert response', { data, error });
      if (error) throw error;

      // Fire-and-forget: don't block UI on notification
      if (needsApproval) {
        supabase.functions.invoke('send-refund-approval-notification', {
          body: {
            refundRequestId: data?.id,
            notificationType: 'new_refund',
          },
        }).catch((notifErr) => {
          console.error('Failed to send refund notification:', notifErr);
        });
      }

      toast.success(needsApproval ? 'Refund request submitted for approval' : 'Refund approved automatically (under $25)');
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error submitting refund request:', error);
      toast.error(`Failed to submit refund request: ${error?.message || 'Unknown error'}`);
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Request Refund
          </DialogTitle>
          <DialogDescription>
            Submit a standalone refund request not associated with a feedback case
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="standalone-store">Store # *</Label>
              <Select value={storeNumber} onValueChange={handleStoreChange}>
                <SelectTrigger id="standalone-store">
                  <SelectValue placeholder="Select store..." />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.store_number} value={s.store_number}>
                      {s.store_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="standalone-market">Market *</Label>
              <Input
                id="standalone-market"
                placeholder="Auto-filled from store"
                value={market}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="standalone-amount">Refund Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="standalone-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Refund Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {refundReasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label htmlFor="standalone-customer-name">Customer Name</Label>
            <Input
              id="standalone-customer-name"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="standalone-customer-email">Customer Email</Label>
              <Input
                id="standalone-customer-email"
                type="email"
                placeholder="email@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standalone-customer-phone">Customer Phone</Label>
              <Input
                id="standalone-customer-phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div className="space-y-2">
            <Label>Receipt Photo *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {receiptPreview ? (
              <div className="relative rounded-md border border-border overflow-hidden">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full max-h-48 object-contain bg-muted"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearReceipt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : !bypassReceipt ? (
              <div
                className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Tap to take a photo or upload receipt
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 p-4 text-muted-foreground">
                <ImageIcon className="h-5 w-5 shrink-0" />
                <p className="text-sm">Receipt bypassed</p>
              </div>
            )}

            {!receiptFile && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="standalone-bypass-receipt"
                    checked={bypassReceipt}
                    onCheckedChange={(checked) => {
                      setBypassReceipt(!!checked);
                      if (!checked) setBypassReason('');
                    }}
                  />
                  <Label htmlFor="standalone-bypass-receipt" className="text-sm font-normal cursor-pointer">
                    No receipt available
                  </Label>
                </div>
                {bypassReceipt && (
                  <Textarea
                    placeholder="Why is the receipt not available? (required)"
                    value={bypassReason}
                    onChange={(e) => setBypassReason(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    maxLength={500}
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="standalone-notes">Additional Notes</Label>
            <Textarea
              id="standalone-notes"
              placeholder="Any additional context for the refund request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
