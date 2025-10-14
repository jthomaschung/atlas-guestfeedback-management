import { useMemo } from "react";
import { CustomerFeedback } from "@/types/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Award } from "lucide-react";

interface StoreRankingsTableProps {
  feedbacks: CustomerFeedback[];
  timeRange: "7days" | "30days" | "90days";
}

export function StoreRankingsTable({ feedbacks, timeRange }: StoreRankingsTableProps) {
  const storeData = useMemo(() => {
    const byStore: Record<string, {
      storeNumber: string;
      storeName: string;
      market: string;
      missingItems: number;
      sandwichWrong: number;
      total: number;
    }> = {};

    feedbacks.forEach((feedback) => {
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

      if (feedback.complaint_category === "Missing item") {
        byStore[key].missingItems += 1;
      } else if (feedback.complaint_category === "Sandwich Made Wrong") {
        byStore[key].sandwichWrong += 1;
      }
      byStore[key].total += 1;
    });

    return Object.values(byStore).sort((a, b) => a.total - b.total);
  }, [feedbacks]);

  const bestPerformers = storeData.slice(0, 10);
  const worstPerformers = storeData.slice(-10).reverse();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Best Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Award className="h-5 w-5" />
            Top 10 Most Accurate Stores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Wrong</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestPerformers.map((store, index) => (
                <TableRow key={store.storeNumber}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
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
                    <Badge variant="secondary">{store.total}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Worst Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Top 10 Stores Needing Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Missing</TableHead>
                <TableHead className="text-right">Wrong</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {worstPerformers.map((store, index) => (
                <TableRow key={store.storeNumber} className="bg-red-50 dark:bg-red-950/20">
                  <TableCell className="font-medium">#{index + 1}</TableCell>
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
                    <span className="text-red-600 font-semibold">{store.missingItems}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-amber-600 font-semibold">{store.sandwichWrong}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">{store.total}</Badge>
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
