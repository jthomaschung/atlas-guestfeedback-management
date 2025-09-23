import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Period {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface MarketLeader {
  market: string;
  praiseCount: number;
  totalFeedback: number;
  praisePercentage: number;
}

interface StoreLeader {
  store_number: string;
  market: string;
  praiseCount: number;
  totalFeedback: number;
  praisePercentage: number;
}

export default function RedCarpetLeaders() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [marketLeaders, setMarketLeaders] = useState<MarketLeader[]>([]);
  const [storeLeaders, setStoreLeaders] = useState<StoreLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedPeriod, periods]);

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('year', 2025)
        .order('period_number');

      if (error) {
        console.error('Error fetching periods:', error);
        return;
      }

      setPeriods(data || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchLeaderboardData = async () => {
    if (periods.length === 0) return;

    try {
      setLoading(true);

      let query = supabase
        .from('customer_feedback')
        .select('market, store_number, complaint_category, feedback_date');

      // Apply period filtering
      if (selectedPeriod !== "all") {
        const period = periods.find(p => p.id === selectedPeriod);
        if (period) {
          query = query
            .gte('feedback_date', period.start_date)
            .lte('feedback_date', period.end_date);
        }
      }

      const { data: feedbacks, error } = await query;

      if (error) {
        console.error('Error fetching feedback data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load leaderboard data"
        });
        return;
      }

      // Process market leaders
      const marketStats: { [market: string]: { praise: number; total: number } } = {};
      const storeStats: { [key: string]: { market: string; praise: number; total: number } } = {};

      feedbacks?.forEach(feedback => {
        const market = feedback.market;
        const storeKey = `${feedback.store_number}-${market}`;
        const isPraise = feedback.complaint_category?.toLowerCase().includes('praise');

        // Market stats
        if (!marketStats[market]) {
          marketStats[market] = { praise: 0, total: 0 };
        }
        marketStats[market].total++;
        if (isPraise) {
          marketStats[market].praise++;
        }

        // Store stats
        if (!storeStats[storeKey]) {
          storeStats[storeKey] = { market, praise: 0, total: 0 };
        }
        storeStats[storeKey].total++;
        if (isPraise) {
          storeStats[storeKey].praise++;
        }
      });

      // Convert to arrays and calculate percentages
      const marketLeaderData: MarketLeader[] = Object.entries(marketStats)
        .map(([market, stats]) => ({
          market,
          praiseCount: stats.praise,
          totalFeedback: stats.total,
          praisePercentage: stats.total > 0 ? Math.round((stats.praise / stats.total) * 100) : 0
        }))
        .sort((a, b) => b.praiseCount - a.praiseCount);

      const storeLeaderData: StoreLeader[] = Object.entries(storeStats)
        .map(([storeKey, stats]) => {
          const [store_number] = storeKey.split('-');
          return {
            store_number,
            market: stats.market,
            praiseCount: stats.praise,
            totalFeedback: stats.total,
            praisePercentage: stats.total > 0 ? Math.round((stats.praise / stats.total) * 100) : 0
          };
        })
        .sort((a, b) => b.praiseCount - a.praiseCount);

      setMarketLeaders(marketLeaderData);
      setStoreLeaders(storeLeaderData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leaderboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const topStoresByMarket = useMemo(() => {
    const groupedByMarket: { [market: string]: StoreLeader[] } = {};
    
    storeLeaders.forEach(store => {
      if (!groupedByMarket[store.market]) {
        groupedByMarket[store.market] = [];
      }
      groupedByMarket[store.market].push(store);
    });

    // Get top store from each market
    const topStores: StoreLeader[] = Object.values(groupedByMarket)
      .map(stores => stores[0]) // First store is already the top due to sorting
      .filter(store => store) // Remove undefined
      .sort((a, b) => b.praiseCount - a.praiseCount);

    return topStores;
  }, [storeLeaders]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Red Carpet Leaders</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Red Carpet Leaders</h1>
          <p className="text-muted-foreground">
            Celebrating excellence in customer service and positive feedback
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Markets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Markets
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Markets with the most praise feedback
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketLeaders.slice(0, 8).map((market, index) => (
                <div
                  key={market.market}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index < 3 ? getPositionColor(index + 1) : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index + 1)}
                    <div>
                      <div className="font-medium">{market.market}</div>
                      <div className="text-sm opacity-80">
                        {market.praiseCount} praise • {market.praisePercentage}% positive
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Stores Overall */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Top Stores
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Top performing stores company-wide
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {storeLeaders.slice(0, 8).map((store, index) => (
                <div
                  key={`${store.store_number}-${store.market}`}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index < 3 ? getPositionColor(index + 1) : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index + 1)}
                    <div>
                      <div className="font-medium">Store {store.store_number}</div>
                      <div className="text-sm opacity-80">
                        {store.market} • {store.praiseCount} praise • {store.praisePercentage}%
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How Points Are Calculated */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-500" />
            How Points Are Calculated
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Understanding our customer feedback scoring system
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">+5</div>
              <div className="text-sm font-medium">Praise</div>
              <div className="text-xs text-muted-foreground mt-1">Positive feedback</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">-1</div>
              <div className="text-sm font-medium">Low</div>
              <div className="text-xs text-muted-foreground mt-1">Minor issues</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">-2</div>
              <div className="text-sm font-medium">Medium</div>
              <div className="text-xs text-muted-foreground mt-1">Moderate concerns</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">-3</div>
              <div className="text-sm font-medium">High</div>
              <div className="text-xs text-muted-foreground mt-1">Serious complaints</div>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">-5</div>
              <div className="text-sm font-medium">Critical</div>
              <div className="text-xs text-muted-foreground mt-1">Urgent issues</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Bonus Points</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Quick response (within 2 days)</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Halves negative points</span>
                </div>
                <div className="flex justify-between">
                  <span>Positive customer response</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">+3 bonus points</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Leadership Rankings</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Rankings are based on total praise count, not calculated scores</div>
                <div>Markets and stores with the most praise feedback earn top positions</div>
                <div>Percentage shows positive feedback ratio out of total feedback</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {marketLeaders[0]?.market || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                #1 Market Overall
              </div>
              <div className="text-lg font-medium mt-2">
                {marketLeaders[0]?.praiseCount || 0} Total Praise
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {storeLeaders[0]?.store_number || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                #1 Store Overall
              </div>
              <div className="text-lg font-medium mt-2">
                {storeLeaders[0]?.praiseCount || 0} Total Praise
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {storeLeaders.reduce((sum, store) => sum + store.praiseCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Company Praise
              </div>
              <div className="text-lg font-medium mt-2">
                Across All Locations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}