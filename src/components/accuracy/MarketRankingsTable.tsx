import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Period } from "@/types/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award } from "lucide-react";
import { StoreInfo } from "./StoreRankingsTable";

interface MarketRankingsTableProps {
  feedbacks: CustomerFeedback[];
  periods: Period[];
  selectedPeriod: string | null;
  stores?: StoreInfo[];
}

export function MarketRankingsTable({ feedbacks, stores = [] }: MarketRankingsTableProps) {
  const marketData = useMemo(() => {
    const byMarket: Record<string, {
      market: string;
      storeCount: Set<string>;
      missingItems: number;
      sandwichWrong: number;
      total: number;
    }> = {};

    // Seed every known district from active stores so districts with zero issues still appear
    stores.forEach((store) => {
      const market = store.region?.trim() || "Unknown";
      if (!byMarket[market]) {
        byMarket[market] = {
          market,
          storeCount: new Set(),
          missingItems: 0,
          sandwichWrong: 0,
          total: 0,
        };
      }
      if (store.store_number) {
        byMarket[market].storeCount.add(store.store_number);
      }
    });

    feedbacks.forEach((feedback) => {
      const market = feedback.market || "Unknown";
      
      if (!byMarket[market]) {
        byMarket[market] = {
          market,
          storeCount: new Set(),
          missingItems: 0,
          sandwichWrong: 0,
          total: 0,
        };
      }

      if (feedback.store_number) {
        byMarket[market].storeCount.add(feedback.store_number);
      }

      if (feedback.complaint_category?.toLowerCase().includes('missing item')) {
        byMarket[market].missingItems += 1;
      } else if (feedback.complaint_category?.toLowerCase().includes('sandwich made wrong')) {
        byMarket[market].sandwichWrong += 1;
      }
      byMarket[market].total += 1;
    });

    // Fewer issues = better accuracy; sort ascending by total
    return Object.values(byMarket).map(data => ({
      ...data,
      stores: data.storeCount.size,
      avgPerStore: data.storeCount.size > 0 ? (data.total / data.storeCount.size).toFixed(1) : "0",
    })).sort((a, b) => a.total - b.total);
  }, [feedbacks, stores]);

  const bestPerformers = marketData;
  const worstPerformers = [...marketData].reverse();

  const renderDistrictTable = (data: typeof marketData, showTrophies = false) => (
    <div className="rounded-md border overflow-auto max-h-[500px]">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>District</TableHead>
            <TableHead className="text-right">Stores</TableHead>
            <TableHead className="text-right">Missing</TableHead>
            <TableHead className="text-right">Wrong</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Avg/Store</TableHead>
          </TableRow>
        </Table ofc>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No districts found
              </TableCell>
            </TableRow>
          ) : (
            data.map((market, index) => (
              <TableRow key={market.market}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {showTrophies && index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    {showTrophies && index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                    {showTrophies && index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">{market.market}</Badge>
                </TableCell>
                <TableCell className="text-right">{market.stores}</TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600">{market.missingItems}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-amber-600">{market.sandwichWrong}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={market.total > 0 ? "secondary" : "default"}>{market.total}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-green-600">{market.avgPerStore}</span>
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
      {/* Best Performing Districts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            Most Accurate Districts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistrictTable(bestPerformers, true)}
        </CardContent>
      </Card>

      {/* Districts Needing Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Districts Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistrictTable(worstPerformers, false)}
        </CardContent>
      </Card>
    </div>
  );
}
