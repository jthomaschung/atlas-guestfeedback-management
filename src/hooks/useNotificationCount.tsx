import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NotificationCount {
  tagged: number;
  completed: number;
  total: number;
}

export function useNotificationCount() {
  const [count, setCount] = useState<NotificationCount>({ tagged: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotificationCount = async () => {
    if (!user?.email) {
      console.log('📬 No user email, skipping notification count');
      return;
    }

    try {
      setLoading(true);
      
      console.log('📬 Fetching notifications for:', user.email);
      
      // Get all unread notifications for this user
      const { data: notifications, error } = await supabase
        .from('notification_log')
        .select('notification_type')
        .eq('recipient_email', user.email)
        .eq('status', 'sent')
        .is('read_at', null)
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('📬 Error fetching notification count:', error);
        return;
      }

      console.log('📬 Raw notifications:', notifications);

      // Count all notification types
      const total = notifications?.length || 0;
      
      console.log('📬 Total unread notifications:', total);
      
      setCount({
        tagged: total,
        completed: 0,
        total: total
      });
    } catch (error) {
      console.error('📬 Error in fetchNotificationCount:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('notification-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notification_log',
            filter: `recipient_email=eq.${user.email}`
          },
          () => {
            fetchNotificationCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { count, loading, refresh: fetchNotificationCount };
}