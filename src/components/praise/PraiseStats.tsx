import { Card, CardContent } from "@/components/ui/card";
import { CustomerFeedback } from "@/types/feedback";
import { Star, Store, MessageCircle, TrendingUp } from "lucide-react";

type PraiseComment = {
  id: string;
  feedback_id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

interface PraiseStatsProps {
  praises: CustomerFeedback[];
  comments: Record<string, PraiseComment[]>;
}

export function PraiseStats({ praises, comments }: PraiseStatsProps) {
  // Total praises
  const totalPraises = praises.length;

  // Total comments
  const totalComments = Object.values(comments).reduce((acc, arr) => acc + arr.length, 0);

  // Top stores by praise count
  const storeCount: Record<string, number> = {};
  praises.forEach(praise => {
    const store = praise.store_number;
    if (store) {
      storeCount[store] = (storeCount[store] || 0) + 1;
    }
  });
  
  const topStores = Object.entries(storeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Unique markets
  const uniqueMarkets = new Set(praises.map(p => p.market).filter(Boolean)).size;

  const stats = [
    {
      label: "Total Praises",
      value: totalPraises,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      label: "Comments",
      value: totalComments,
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Markets",
      value: uniqueMarkets,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Stat Cards */}
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Top Stores Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Top Stores</span>
          </div>
          {topStores.length > 0 ? (
            <div className="space-y-1.5">
              {topStores.map(([store, count], i) => (
                <div key={store} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    #{store}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {count} praise{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
