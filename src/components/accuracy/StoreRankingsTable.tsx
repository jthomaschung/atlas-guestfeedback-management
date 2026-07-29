import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Period } from "@/types/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award } from "lucide-react";

export interface StoreInfo {
  store_number: string;
  store_name?: string;
  region?: string;
  is_active?: boolean;
}

const EXCLUDED_DISTRICTS = ["catering", "corporate", "facilities"];
const isExcludedDistrict = (market?: string | null) =>
  EXCLUDED_DISTRICTS.includes((market || "").trim().toLowerCase());

interface StoreRankingsTableProps {
  feedbacks: CustomerFeedback[];
  periods: Period[];
  selectedPeriod: string | null;
  stores?: StoreInfo[];
}

export function StoreRankingsTable({ feedbacks, stores = [] }: StoreRankingsTableProps) {
  const storeData = useMemo(() => {
    const byStore: Record<string, {
      storeNumber: string;
      storeName: string;
      market: string;
      missingItems: number;
      sandwichWrong: number;
      total: number;
    }> = {};

    // Seed every known store with zeros so stores with no issues still appear
    stores.forEach((store) => {
      if (isExcludedDistrict(store.region)) return;
      const key = store.store_number;
      byStore[key] = {
        storeNumber: store.store_number,
        storeName: store.store_name?.trim() || `Store #${store.store_number}`,
        market: store.region || "Unknown",
        missingItems: 0,
        sandwichWrong: 0,
        total: 0,
      };
    });

    feedbacks.forEach((feedback) => {
      if (isExcludedDistrict(feedback.market)) return;
      const key = feedback.store_number;
      
      if (!byStore[key]) {
        byStore[key] = {
          storeNumber: feedback.store_number,
          storeName: `Store #${feedback.store_number}`,
          market: feedback.market || "Unknown",
          missingItems: 0,
          sandwichWrong: 0,
          total: 0,
        };
      }

      if (feedback.complaint_category?.toLowerCase().includes('missing item')) {
        byStore[key].missingItems += 1;
      } else if (feedback.complaint_category?.toLowerCase().includes('sandwich made wrong')) {
        byStore[key].sandwichWrong += 1;
      }
      byStore[key].total += 1;
    });

    // Fewer issues = better accuracy; sort ascending by total
    return Object.values(byStore).sort((a, b) => a.total - b.total);
  }, [feedbacks, stores]);

  const bestPerformers = storeData;
  const worstPerformers = [...storeData].reverse();

  const renderStoreTable = (data: typeof storeData, showTrophies = false) => (
    <div className="rounded-md border overflow-auto max-h-[500px]">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Market</TableHead>
            <TableHead className="text-right">Missing</TableHead>
            <TableHead className="text-right">Wrong</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No stores found
              </TableCell>
            </TableRow>
          ) : (
            data.map((store, index) => (
              <TableRow key={store.storeNumber}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {showTrophies && index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    {showTrophies && index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                    {showTrophies && index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{store.storeName}</div>
                    <div className="text-xs text-muted-foreground">#{store.storeNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{store.market}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600">{store.missingItems}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-amber-600">{store.sandwichWrong}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={store.total > 0 ? "secondary" : "default"}>{store.total}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Best Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            Most Accurate Stores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStoreTable(bestPerformers, true)}
        </CardContent>
      </Card>

      {/* Worst Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Stores Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStoreTable(worstPerformers, false)}
        </CardContent>
      </Card>
    </div>
  );
}
