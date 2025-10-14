import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award } from "lucide-react";

interface MarketRankingsTableProps {
  feedbacks: CustomerFeedback[];
  timeRange: "7days" | "30days" | "90days";
}

export function MarketRankingsTable({ feedbacks, timeRange }: MarketRankingsTableProps) {
  const marketData = useMemo(() => {
    const byMarket: Record<string, {
      market: string;
      storeCount: Set<string>;
      missingItems: number;
      sandwichWrong: number;
      total: number;
    }> = {};

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

      byMarket[market].storeCount.add(feedback.store_number);

      if (feedback.complaint_category === "Missing item") {
        byMarket[market].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        byMarket[market].sandwichWrong += 1;
      }
      byMarket[market].total += 1;
    });

    return Object.values(byMarket).map(data => ({
      ...data,
      stores: data.storeCount.size,
      avgPerStore: data.storeCount.size > 0 ? (data.total / data.storeCount.size).toFixed(1) : "0",
    })).sort((a, b) => parseFloat(a.avgPerStore) - parseFloat(b.avgPerStore));
  }, [feedbacks]);

  const bestPerformers = marketData.slice(0, 8);
  const worstPerformers = marketData.slice(-8).reverse();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Best Performing Markets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            Most Accurate Markets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Stores</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Wrong</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Avg/Store</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestPerformers.map((market, index) => (
                <TableRow key={market.market}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
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
                    <Badge variant="secondary">{market.total}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">{market.avgPerStore}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Markets Needing Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Markets Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Stores</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Wrong</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Avg/Store</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {worstPerformers.map((market, index) => (
                <TableRow key={market.market} className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">{market.market}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{market.stores}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-600 font-semibold">{market.missingItems}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-amber-600 font-semibold">{market.sandwichWrong}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">{market.total}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-red-600">{market.avgPerStore}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
