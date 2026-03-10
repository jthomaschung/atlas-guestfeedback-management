import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFeedbackLikes(feedbackIds: string[]) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchLikes = useCallback(async () => {
    if (feedbackIds.length === 0) return;
    setLoading(true);

    // Get all likes for these feedback ids
    const { data, error } = await supabase
      .from('feedback_likes')
      .select('feedback_id, user_id')
      .in('feedback_id', feedbackIds);

    if (!error && data) {
      const counts: Record<string, number> = {};
      const userLiked = new Set<string>();

      data.forEach((like: any) => {
        counts[like.feedback_id] = (counts[like.feedback_id] || 0) + 1;
        if (like.user_id === user?.id) {
          userLiked.add(like.feedback_id);
        }
      });

      setLikes(counts);
      setUserLikes(userLiked);
    }
    setLoading(false);
  }, [feedbackIds.join(','), user?.id]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = useCallback(async (feedbackId: string) => {
    if (!user) return;

    const isLiked = userLikes.has(feedbackId);

    // Optimistic update
    setUserLikes(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(feedbackId);
      else next.add(feedbackId);
      return next;
    });
    setLikes(prev => ({
      ...prev,
      [feedbackId]: (prev[feedbackId] || 0) + (isLiked ? -1 : 1),
    }));

    if (isLiked) {
      await supabase
        .from('feedback_likes')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('feedback_likes')
        .insert({ feedback_id: feedbackId, user_id: user.id });
    }
  }, [user, userLikes]);

  return { likes, userLikes, toggleLike, loading };
}
