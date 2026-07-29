import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { getRegion, getDistrict, classifyAccuracy } from "@/lib/accuracyRegions";

interface DistrictBreakdownTableProps {
  feedbacks: CustomerFeedback[];
  onSelectDistrict?: (district: string) => void;
}

export function DistrictBreakdownTable({ feedbacks, onSelectDistrict }: DistrictBreakdownTableProps) {
  const rows = useMemo(() => {
    const map: Record<string, {
      district: string;
      region: string;
      stores: Set<string>;
      missing: number;
      sandwich: number;
      accuracy: number;
      total: number;
    }> = {};

    feedbacks.forEach((fb) => {
      const district = getDistrict(fb.market);
      if (!map[district]) {
        map[district] = {
          district,
          region: getRegion(fb.market),
          stores: new Set(),
          missing: 0,
          sandwich: 0,
          accuracy: 0,
          total: 0,
        };
      }
      map[district].stores.add(fb.store_number);
      const cat = classifyAccuracy(fb);
      if (cat === "missing") map[district].missing += 1;
      else if (cat === "sandwich") map[district].sandwich += 1;
      else if (cat === "accuracy") map[district].accuracy += 1;
      map[district].total += 1;
    });

    return Object.values(map)
      .map((d) => ({
        ...d,
        storeCount: d.stores.size,
        avgPerStore: d.stores.size > 0 ? (d.total / d.stores.size).toFixed(1) : "0",
      }))
      .sort((a, b) => b.total - a.total);
  }, [feedbacks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          District Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Stores</TableHead>
              <TableHead className="text-right">Missing Items</TableHead>
              <TableHead className="text-right">Sandwich Wrong</TableHead>
              <TableHead className="text-right">Order Accuracy</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Avg / Store</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No records for this period
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow
                key={row.district}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectDistrict?.(row.district)}
              >
                <TableCell className="font-medium">{row.district}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.region}</Badge>
                </TableCell>
                <TableCell className="text-right">{row.storeCount}</TableCell>
                <TableCell className="text-right">{row.missing}</TableCell>
                <TableCell className="text-right">{row.sandwich}</TableCell>
                <TableCell className="text-right">{row.accuracy}</TableCell>
                <TableCell className="text-right font-semibold">{row.total}</TableCell>
                <TableCell className="text-right">{row.avgPerStore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
