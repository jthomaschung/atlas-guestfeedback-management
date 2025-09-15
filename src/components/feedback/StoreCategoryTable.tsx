import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerFeedback } from "@/types/feedback";
import { cn } from "@/lib/utils";

interface StoreCategoryTableProps {
  feedbacks: CustomerFeedback[];
}

interface StoreData {
  storeNumber: string;
  market: string;
  categories: Record<string, number>;
  total: number;
}

export function StoreCategoryTable({ feedbacks }: StoreCategoryTableProps) {
  const { storeData, categories, categoryTotals, grandTotal } = useMemo(() => {
    // Normalize categories to handle case differences
    const categoryMap = new Map<string, string>();
    const allCategoriesRaw = feedbacks.map(fb => fb.complaint_category);
    
    // Create a mapping of lowercase to properly formatted category names
    allCategoriesRaw.forEach(category => {
      const lowerKey = category.toLowerCase();
      if (!categoryMap.has(lowerKey)) {
        categoryMap.set(lowerKey, category);
      }
    });
    
    // Get unique normalized categories
    const allCategories = Array.from(categoryMap.values()).sort();
    
    // Group by store and count categories
    const storeMap = new Map<string, StoreData>();
    
    feedbacks.forEach(fb => {
      if (!storeMap.has(fb.store_number)) {
        storeMap.set(fb.store_number, {
          storeNumber: fb.store_number,
          market: fb.market,
          categories: {},
          total: 0
        });
      }
      
      const store = storeMap.get(fb.store_number)!;
      // Use the normalized category name
      const normalizedCategory = categoryMap.get(fb.complaint_category.toLowerCase())!;
      store.categories[normalizedCategory] = (store.categories[normalizedCategory] || 0) + 1;
      store.total += 1;
    });
    
    // Convert to array and sort by store number
    const storeDataArray = Array.from(storeMap.values()).sort((a, b) => 
      a.storeNumber.localeCompare(b.storeNumber, undefined, { numeric: true })
    );
    
    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    allCategories.forEach(category => {
      categoryTotals[category] = storeDataArray.reduce((sum, store) => 
        sum + (store.categories[category] || 0), 0
      );
    });
    
    // Calculate grand total
    const grandTotal = storeDataArray.reduce((sum, store) => sum + store.total, 0);
    
    return {
      storeData: storeDataArray,
      categories: allCategories,
      categoryTotals,
      grandTotal
    };
  }, [feedbacks]);

  const getCellColor = (count: number, total: number) => {
    if (count === 0) return "";
    const percentage = (count / total) * 100;
    if (percentage >= 20) return "bg-destructive/20 text-destructive-foreground";
    if (percentage >= 10) return "bg-warning/20 text-warning-foreground";
    if (percentage >= 5) return "bg-info/20 text-info-foreground";
    return "bg-muted/50";
  };

  if (storeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Store Performance by Category</CardTitle>
          <CardDescription>
            Breakdown of feedback categories by store location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No feedback data available for the selected filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Performance by Category</CardTitle>
        <CardDescription>
          Breakdown of feedback categories by store location. Colors indicate concentration levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Store #</TableHead>
                <TableHead className="font-semibold">Market</TableHead>
                {categories.map(category => (
                  <TableHead key={category} className="text-center font-semibold min-w-[100px]">
                    {category}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeData.map(store => (
                <TableRow key={store.storeNumber} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{store.storeNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{store.market}</TableCell>
                  {categories.map(category => {
                    const count = store.categories[category] || 0;
                    return (
                      <TableCell 
                        key={category} 
                        className={cn(
                          "text-center",
                          getCellColor(count, store.total)
                        )}
                      >
                        {count > 0 ? count : '—'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-medium bg-muted/30">
                    {store.total}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="border-t-2 bg-muted/20 font-medium">
                <TableCell className="font-bold">TOTAL</TableCell>
                <TableCell className="text-muted-foreground">All Markets</TableCell>
                {categories.map(category => (
                  <TableCell key={category} className="text-center font-bold">
                    {categoryTotals[category] || 0}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-muted/50">
                  {grandTotal}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive/20 border border-border rounded"></div>
            <span className="text-muted-foreground">≥20% of store feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning/20 border border-border rounded"></div>
            <span className="text-muted-foreground">10-19% of store feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-info/20 border border-border rounded"></div>
            <span className="text-muted-foreground">5-9% of store feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted/50 border border-border rounded"></div>
            <span className="text-muted-foreground">1-4% of store feedback</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}