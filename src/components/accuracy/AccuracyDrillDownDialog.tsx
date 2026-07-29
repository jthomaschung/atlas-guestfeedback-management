import { useMemo, useState, useEffect } from "react";
import { CustomerFeedback } from "@/types/feedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { getRegion, getDistrict, classifyAccuracy } from "@/lib/accuracyRegions";

interface AccuracyDrillDownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  feedbacks: CustomerFeedback[];
}

type Level = "region" | "district" | "store" | "feedback";

interface Row {
  key: string;
  total: number;
  missing: number;
  sandwich: number;
  accuracy: number;
}

const aggregate = (items: CustomerFeedback[], keyFn: (fb: CustomerFeedback) => string): Row[] => {
  const map: Record<string, Row> = {};
  items.forEach((fb) => {
    const key = keyFn(fb);
    if (!map[key]) map[key] = { key, total: 0, missing: 0, sandwich: 0, accuracy: 0 };
    map[key].total += 1;
    const cat = classifyAccuracy(fb);
    if (cat === "missing") map[key].missing += 1;
    else if (cat === "sandwich") map[key].sandwich += 1;
    else if (cat === "accuracy") map[key].accuracy += 1;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
};

export function AccuracyDrillDownDialog({
  isOpen,
  onClose,
  title,
  feedbacks,
}: AccuracyDrillDownDialogProps) {
  const [region, setRegion] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [store, setStore] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRegion(null);
      setDistrict(null);
      setStore(null);
    }
  }, [isOpen]);

  const level: Level = store ? "feedback" : district ? "store" : region ? "district" : "region";

  const scoped = useMemo(() => {
    let items = feedbacks;
    if (region) items = items.filter((fb) => getRegion(fb.market) === region);
    if (district) items = items.filter((fb) => getDistrict(fb.market) === district);
    if (store) items = items.filter((fb) => (fb.store_number || "Unknown") === store);
    return items;
  }, [feedbacks, region, district, store]);

  const rows = useMemo(() => {
    if (level === "region") return aggregate(scoped, (fb) => getRegion(fb.market));
    if (level === "district") return aggregate(scoped, (fb) => getDistrict(fb.market));
    if (level === "store") return aggregate(scoped, (fb) => fb.store_number || "Unknown");
    return [];
  }, [scoped, level]);

  const feedbackItems = useMemo(
    () =>
      level === "feedback"
        ? [...scoped].sort(
            (a, b) =>
              new Date(b.feedback_date).getTime() - new Date(a.feedback_date).getTime()
          )
        : [],
    [scoped, level]
  );

  const labelForLevel = level === "region" ? "Region" : level === "district" ? "District" : "Store";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Drill down by region, district and store, then view the actual guest feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 flex-wrap">
          {(region || district || store) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                store ? setStore(null) : district ? setDistrict(null) : setRegion(null)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setRegion(null);
              setDistrict(null);
              setStore(null);
            }}
          >
            All Regions
          </button>
          {region && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDistrict(null);
                  setStore(null);
                }}
              >
                {region}
              </button>
            </>
          )}
          {district && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setStore(null)}
              >
                {district}
              </button>
            </>
          )}
          {store && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">Store #{store}</span>
            </>
          )}
          <Badge variant="outline" className="ml-auto">
            {scoped.length} issues
          </Badge>
        </div>

        {level === "feedback" ? (
          <div className="space-y-3">
            {feedbackItems.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No records</p>
            )}
            {feedbackItems.map((fb) => (
              <div key={fb.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{fb.complaint_category}</Badge>
                  {fb.type_of_feedback && (
                    <Badge variant="outline">{fb.type_of_feedback}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(fb.feedback_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">#{fb.case_number}</span>
                  <Badge variant="outline" className="ml-auto capitalize">
                    {fb.resolution_status}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {fb.feedback_text?.trim() || "No comment provided."}
                </p>
                <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                  {fb.customer_name && <span>{fb.customer_name}</span>}
                  {fb.channel && <span>{fb.channel}</span>}
                  {fb.order_number && <span>Order {fb.order_number}</span>}
                  {fb.period && <span>{fb.period}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labelForLevel}</TableHead>
                <TableHead className="text-right">Missing Items</TableHead>
                <TableHead className="text-right">Sandwich Wrong</TableHead>
                <TableHead className="text-right">Order Accuracy</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No records
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    if (level === "region") setRegion(row.key);
                    else if (level === "district") setDistrict(row.key);
                    else setStore(row.key);
                  }}
                >
                  <TableCell className="font-medium flex items-center gap-1">
                    {level === "store" ? `Store #${row.key}` : row.key}
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="text-right">{row.missing}</TableCell>
                  <TableCell className="text-right">{row.sandwich}</TableCell>
                  <TableCell className="text-right">{row.accuracy}</TableCell>
                  <TableCell className="text-right font-semibold">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      </DialogContent>
    </Dialog>
  );
}
