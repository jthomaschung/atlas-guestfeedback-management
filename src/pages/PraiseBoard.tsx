import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CustomerFeedback } from "@/types/feedback";
import { PraiseCard } from "@/components/praise/PraiseCard";
import { PraiseStats } from "@/components/praise/PraiseStats";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Search, Sparkles } from "lucide-react";
import { format, subDays } from "date-fns";

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

export default function PraiseBoard() {
  const { user, profile } = useAuth();
  const [praises, setPraises] = useState<CustomerFeedback[]>([]);
  const [comments, setComments] = useState<Record<string, PraiseComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [markets, setMarkets] = useState<string[]>([]);

  // Fetch praises (feedback with "Praise" category)
  useEffect(() => {
    const fetchPraises = async () => {
      setLoading(true);
      
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .ilike('complaint_category', '%praise%')
        .gte('feedback_date', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching praises:', error);
      } else if (data) {
        setPraises(data as CustomerFeedback[]);
        
        // Extract unique markets
        const uniqueMarkets = [...new Set(data.map(p => p.market).filter(Boolean))];
        setMarkets(uniqueMarkets);
        
        // Fetch comments for all praises
        const feedbackIds = data.map(p => p.id);
        if (feedbackIds.length > 0) {
          const { data: commentsData, error: commentsError } = await supabase
            .from('praise_comments')
            .select('*')
            .in('feedback_id', feedbackIds)
            .order('created_at', { ascending: true });

          if (!commentsError && commentsData) {
            // Group comments by feedback_id
            const groupedComments: Record<string, PraiseComment[]> = {};
            commentsData.forEach((comment) => {
              const typedComment = comment as PraiseComment;
              if (!groupedComments[typedComment.feedback_id]) {
                groupedComments[typedComment.feedback_id] = [];
              }
              groupedComments[typedComment.feedback_id].push(typedComment);
            });
            setComments(groupedComments);
          }
        }
      }
      
      setLoading(false);
    };

    fetchPraises();
  }, []);

  // Filter praises
  const filteredPraises = praises.filter(praise => {
    const matchesSearch = !searchTerm || 
      praise.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      praise.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      praise.store_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMarket = marketFilter === "all" || praise.market === marketFilter;
    
    return matchesSearch && matchesMarket;
  });

  // Handle adding a comment
  const handleAddComment = async (feedbackId: string, content: string) => {
    if (!user || !profile) return;

    const userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Anonymous User';
    
    const { data, error } = await supabase
      .from('praise_comments')
      .insert({
        feedback_id: feedbackId,
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      const typedData = data as PraiseComment;
      setComments(prev => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] || []), typedData],
      }));
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string, feedbackId: string) => {
    const { error } = await supabase
      .from('praise_comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments(prev => ({
        ...prev,
        [feedbackId]: prev[feedbackId]?.filter(c => c.id !== commentId) || [],
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg">
          <Star className="h-8 w-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Praise Board
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-muted-foreground">Celebrating exceptional service and happy customers</p>
        </div>
      </div>

      {/* Stats */}
      <PraiseStats praises={praises} comments={comments} />

      {/* Filters */}
      <Card className="border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-transparent">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search praises by customer, store, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Praises Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredPraises.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="h-16 w-16 mx-auto text-amber-300 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No praises found</h3>
          <p className="text-muted-foreground">
            {searchTerm || marketFilter !== "all" 
              ? "Try adjusting your filters to see more results" 
              : "No praise feedback in the last 30 days"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPraises.map(praise => (
            <PraiseCard
              key={praise.id}
              praise={praise}
              comments={comments[praise.id] || []}
              onAddComment={(content) => handleAddComment(praise.id, content)}
              onDeleteComment={(commentId) => handleDeleteComment(commentId, praise.id)}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
