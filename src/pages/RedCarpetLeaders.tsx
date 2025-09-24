import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Star, Crown, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
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
  totalScore: number;
}

interface StoreLeader {
  store_number: string;
  market: string;
  praiseCount: number;
  totalFeedback: number;
  totalScore: number;
}

interface StoreDetails {
  store_number: string;
  market: string;
  total_score: number;
  praise_count: number;
  low_count: number;
  medium_count: number;
  high_count: number;
  critical_count: number;
  quick_response_bonus: number;
  positive_response_bonus: number;
  total_feedback: number;
}

export default function RedCarpetLeaders() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [marketLeaders, setMarketLeaders] = useState<MarketLeader[]>([]);
  const [storeLeaders, setStoreLeaders] = useState<StoreLeader[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<{ store_number: string; market: string } | null>(null);
  const [marketStoreDetails, setMarketStoreDetails] = useState<StoreDetails[]>([]);
  const [singleStoreDetails, setSingleStoreDetails] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedPeriod, periods]);

  useEffect(() => {
    if (selectedMarket) {
      fetchMarketStoreDetails();
    }
  }, [selectedMarket, selectedPeriod, periods]);

  useEffect(() => {
    if (selectedStore) {
      fetchSingleStoreDetails();
    }
  }, [selectedStore, selectedPeriod, periods]);

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
        .select('market, store_number, complaint_category, feedback_date, calculated_score');

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
      const marketStats: { [market: string]: { praise: number; total: number; score: number } } = {};
      const storeStats: { [key: string]: { market: string; praise: number; total: number; score: number } } = {};

      feedbacks?.forEach(feedback => {
        const market = feedback.market;
        const storeKey = `${feedback.store_number}-${market}`;
        const category = feedback.complaint_category;
        const score = feedback.calculated_score || 0;

        // Market stats
        if (!marketStats[market]) {
          marketStats[market] = { praise: 0, total: 0, score: 0 };
        }
        marketStats[market].total++;
        marketStats[market].score += score;
        if (category === 'Praise') {
          marketStats[market].praise++;
        }

        // Store stats
        if (!storeStats[storeKey]) {
          storeStats[storeKey] = { market, praise: 0, total: 0, score: 0 };
        }
        storeStats[storeKey].total++;
        storeStats[storeKey].score += score;
        if (category === 'Praise') {
          storeStats[storeKey].praise++;
        }
      });

      // Convert to arrays and sort by total score
      const marketLeaderData: MarketLeader[] = Object.entries(marketStats)
        .map(([market, stats]) => ({
          market,
          praiseCount: stats.praise,
          totalFeedback: stats.total,
          totalScore: stats.score
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      const storeLeaderData: StoreLeader[] = Object.entries(storeStats)
        .map(([storeKey, stats]) => {
          const [store_number] = storeKey.split('-');
          return {
            store_number,
            market: stats.market,
            praiseCount: stats.praise,
            totalFeedback: stats.total,
            totalScore: stats.score
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore);

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

  const fetchMarketStoreDetails = async () => {
    if (!selectedMarket || periods.length === 0) return;

    try {
      setLoading(true);

      let query = supabase
        .from('customer_feedback')
        .select('store_number, complaint_category, calculated_score, outreach_sent_at, customer_response_sentiment, feedback_date')
        .eq('market', selectedMarket);

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
        console.error('Error fetching market store details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load store details"
        });
        return;
      }

      // Process store details with scoring breakdown
      const storeStats: { [store_number: string]: StoreDetails } = {};

      feedbacks?.forEach(feedback => {
        const storeNumber = feedback.store_number;
        
        if (!storeStats[storeNumber]) {
          storeStats[storeNumber] = {
            store_number: storeNumber,
            market: selectedMarket,
            total_score: 0,
            praise_count: 0,
            low_count: 0,
            medium_count: 0,
            high_count: 0,
            critical_count: 0,
            quick_response_bonus: 0,
            positive_response_bonus: 0,
            total_feedback: 0
          };
        }

        const store = storeStats[storeNumber];
        store.total_feedback++;
        
        const score = feedback.calculated_score || 0;
        store.total_score += score;

        // Categorize feedback based on calculated score
        if (score === 5) {
          store.praise_count++;
        } else if (score === -1) {
          store.low_count++;
        } else if (score === -2) {
          store.medium_count++;
        } else if (score === -3) {
          store.high_count++;
        } else if (score === -5) {
          store.critical_count++;
        }

        // Check for quick response bonus (simplified - would need more complex logic for exact calculation)
        if (feedback.outreach_sent_at && feedback.feedback_date) {
          const responseTime = new Date(feedback.outreach_sent_at).getTime() - new Date(feedback.feedback_date).getTime();
          const responseTimeDays = responseTime / (1000 * 60 * 60 * 24);
          if (responseTimeDays <= 2) {
            store.quick_response_bonus++;
          }
        }

        // Check for positive response bonus
        if (feedback.customer_response_sentiment === 'positive') {
          store.positive_response_bonus++;
        }
      });

      const storeDetailsArray = Object.values(storeStats)
        .sort((a, b) => b.total_score - a.total_score);

      setMarketStoreDetails(storeDetailsArray);
    } catch (error) {
      console.error('Error fetching market store details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load store details"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleStoreDetails = async () => {
    if (!selectedStore || periods.length === 0) return;

    try {
      setLoading(true);

      let query = supabase
        .from('customer_feedback')
        .select('store_number, complaint_category, calculated_score, outreach_sent_at, customer_response_sentiment, feedback_date')
        .eq('market', selectedStore.market)
        .eq('store_number', selectedStore.store_number);

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
        console.error('Error fetching single store details:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load store details"
        });
        return;
      }

      // Process single store details
      const storeDetails: StoreDetails = {
        store_number: selectedStore.store_number,
        market: selectedStore.market,
        total_score: 0,
        praise_count: 0,
        low_count: 0,
        medium_count: 0,
        high_count: 0,
        critical_count: 0,
        quick_response_bonus: 0,
        positive_response_bonus: 0,
        total_feedback: 0
      };

      feedbacks?.forEach(feedback => {
        storeDetails.total_feedback++;
        
        const score = feedback.calculated_score || 0;
        storeDetails.total_score += score;

        // Categorize feedback based on calculated score
        if (score === 5) {
          storeDetails.praise_count++;
        } else if (score === -1) {
          storeDetails.low_count++;
        } else if (score === -2) {
          storeDetails.medium_count++;
        } else if (score === -3) {
          storeDetails.high_count++;
        } else if (score === -5) {
          storeDetails.critical_count++;
        }

        // Check for quick response bonus
        if (feedback.outreach_sent_at && feedback.feedback_date) {
          const responseTime = new Date(feedback.outreach_sent_at).getTime() - new Date(feedback.feedback_date).getTime();
          const responseTimeDays = responseTime / (1000 * 60 * 60 * 24);
          if (responseTimeDays <= 2) {
            storeDetails.quick_response_bonus++;
          }
        }

        // Check for positive response bonus
        if (feedback.customer_response_sentiment === 'positive') {
          storeDetails.positive_response_bonus++;
        }
      });

      setSingleStoreDetails(storeDetails);
    } catch (error) {
      console.error('Error fetching single store details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load store details"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (store_number: string, market: string) => {
    setSelectedStore({ store_number, market });
  };

  const handleMarketClick = (market: string) => {
    setSelectedMarket(market);
  };

  const handleBackToMarkets = () => {
    setSelectedMarket(null);
    setMarketStoreDetails([]);
  };

  const handleBackToMain = () => {
    setSelectedStore(null);
    setSingleStoreDetails(null);
    setSelectedMarket(null);
    setMarketStoreDetails([]);
  };

  const topStoresByMarket = useMemo(() => {
    const groupedByMarket: { [market: string]: StoreLeader[] } = {};
    
    storeLeaders.forEach(store => {
      if (!groupedByMarket[store.market]) {
        groupedByMarket[store.market] = [];
      }
      groupedByMarket[store.market].push(store);
    });

    return groupedByMarket;
  }, [storeLeaders]);

  // Helper functions for UI display
  const getPositionIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const getPositionColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-amber-600";
    return "text-muted-foreground";
  };

  // Show single store drill-down view
  if (selectedStore && singleStoreDetails) {
    return (
      <div className="space-y-6 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToMain}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leaders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Store {singleStoreDetails.store_number}</h1>
            <p className="text-muted-foreground">
              {singleStoreDetails.market} Market • Point breakdown and performance details
            </p>
          </div>
        </div>

        {/* Store Details Card */}
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${
              singleStoreDetails.total_score > 0 ? 'text-green-600' : 
              singleStoreDetails.total_score < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {singleStoreDetails.total_score > 0 ? '+' : ''}{singleStoreDetails.total_score.toFixed(1)}
            </div>
            <div className="text-xl text-muted-foreground mb-4">Total Points</div>
            <div className="text-lg">
              <span className="font-medium">{singleStoreDetails.total_feedback}</span> total feedback items
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feedback Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Feedback Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Praise</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{singleStoreDetails.praise_count}</div>
                    <div className="text-sm text-green-600">+{singleStoreDetails.praise_count * 5} pts</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Minor Issues</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">{singleStoreDetails.low_count}</div>
                    <div className="text-sm text-yellow-600">{singleStoreDetails.low_count * -1} pts</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Medium Issues</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{singleStoreDetails.medium_count}</div>
                    <div className="text-sm text-orange-600">{singleStoreDetails.medium_count * -2} pts</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="font-medium">High Priority</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{singleStoreDetails.high_count}</div>
                    <div className="text-sm text-red-600">{singleStoreDetails.high_count * -3} pts</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-700" />
                    <span className="font-medium">Critical Issues</span>
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-red-700">{singleStoreDetails.critical_count}</div>
                    <div className="text-sm text-red-700">{singleStoreDetails.critical_count * -5} pts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus Points */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Bonus Points</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Quick Response Bonus</span>
                    <span className="font-bold text-blue-600">{singleStoreDetails.quick_response_bonus}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Responses within 2 days (halves negative points)
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Positive Response Bonus</span>
                    <span className="font-bold text-green-600">+{singleStoreDetails.positive_response_bonus * 3}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Customers responded positively to outreach
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {singleStoreDetails.total_feedback > 0 ? 
                        Math.round((singleStoreDetails.praise_count / singleStoreDetails.total_feedback) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Praise Rate</div>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {(singleStoreDetails.total_score / Math.max(singleStoreDetails.total_feedback, 1)).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Points Per Feedback</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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

  // Show market drill-down view
  if (selectedMarket) {
    return (
      <div className="space-y-6 p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToMarkets}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedMarket} Market Stores</h1>
            <p className="text-muted-foreground">
              Detailed scoring breakdown for stores in {selectedMarket}
            </p>
          </div>
        </div>

        {/* Store Details */}
        <div className="grid grid-cols-1 gap-4">
          {marketStoreDetails.map((store, index) => (
            <Card key={store.store_number} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getPositionIcon(index + 1)}
                  <div>
                    <h3 className="text-xl font-bold">Store {store.store_number}</h3>
                    <p className="text-muted-foreground">
                      Total Score: {store.total_score.toFixed(1)} points
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">#{index + 1}</Badge>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Feedback Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Feedback Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Praise (+5)
                      </span>
                      <span className="font-medium text-green-600">
                        {store.praise_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-yellow-500" />
                        Minor (-1)
                      </span>
                      <span className="font-medium text-yellow-600">
                        {store.low_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-orange-500" />
                        Medium (-2)
                      </span>
                      <span className="font-medium text-orange-600">
                        {store.medium_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        High (-3)
                      </span>
                      <span className="font-medium text-red-600">
                        {store.high_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-700" />
                        Critical (-5)
                      </span>
                      <span className="font-medium text-red-700">
                        {store.critical_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bonus Points */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Bonus Points</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Quick Response</span>
                      <span className="font-medium text-green-600">
                        {store.quick_response_bonus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Positive Response</span>
                      <span className="font-medium text-green-600">
                        +{store.positive_response_bonus * 3}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Feedback</span>
                      <span className="font-medium">{store.total_feedback}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Praise Rate</span>
                      <span className="font-medium text-green-600">
                        {store.total_feedback > 0 ? 
                          Math.round((store.praise_count / store.total_feedback) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Visual */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Total Score</h4>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      store.total_score > 0 ? 'text-green-600' : 
                      store.total_score < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {store.total_score > 0 ? '+' : ''}{store.total_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              </div>
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
              Markets with the highest total scores
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketLeaders.slice(0, 8).map((market, index) => (
                <div
                  key={market.market}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                    index < 3 ? getPositionColor(index + 1) : 'bg-muted/50'
                  }`}
                  onClick={() => handleMarketClick(market.market)}
                >
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index + 1)}
                    <div>
                      <div className="font-medium">{market.market}</div>
                      <div className="text-sm opacity-80">
                        {market.totalScore > 0 ? '+' : ''}{market.totalScore.toFixed(1)} total points
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
              Stores with the highest total scores
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {storeLeaders.slice(0, 8).map((store, index) => (
                <div
                  key={`${store.store_number}-${store.market}`}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                    index < 3 ? getPositionColor(index + 1) : 'bg-muted/50'
                  }`}
                  onClick={() => handleStoreClick(store.store_number, store.market)}
                >
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index + 1)}
                    <div>
                      <div className="font-medium">Store {store.store_number}</div>
                      <div className="text-sm opacity-80">
                        {store.market} • {store.totalScore > 0 ? '+' : ''}{store.totalScore.toFixed(1)} total points
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