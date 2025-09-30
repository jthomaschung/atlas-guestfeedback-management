import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface MarketOverviewProps {
  markets: { market: string; count: number }[];
  onManageMarkets: () => void;
}

export const MarketOverview = ({ markets, onManageMarkets }: MarketOverviewProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Markets Overview</CardTitle>
          <CardDescription>Store distribution across markets</CardDescription>
        </div>
        <Button onClick={onManageMarkets} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Markets
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {markets.map((market) => (
            <Badge key={market.market} variant="secondary" className="text-sm py-1.5 px-3">
              {market.market} ({market.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
