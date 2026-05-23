import { AlertTriangle } from 'lucide-react';
import receiptExample from '@/assets/receipt-example.jpeg';

export function ReceiptExampleHint() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-3 space-y-2">
      <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p className="text-xs font-semibold">
          The image must be of the whole receipt and clear!!!
        </p>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={receiptExample}
          alt="Example of a clear, full receipt"
          className="rounded border border-amber-200 dark:border-amber-800 max-h-40 object-contain bg-background"
        />
        <p className="text-xs text-muted-foreground">
          Example of an acceptable receipt photo — entire receipt visible, all text legible (store #, items, total, payment).
        </p>
      </div>
    </div>
  );
}
