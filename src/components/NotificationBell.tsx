import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Notification {
  id: string;
  work_order_id: string | null;
  sent_at: string;
  notification_type: string;
  status: string;
}

export function NotificationBell() {
  const { count, loading } = useNotificationCount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const fetchRecentNotifications = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('recipient_email', user.email)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error in fetchRecentNotifications:', error);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchRecentNotifications();
    }
  }, [isOpen, user]);

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'tagged':
        return 'You were tagged in a work order';
      case 'completion':
        return 'Work order completed';
      case 'assignment':
        return 'Work order assigned to you';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tagged':
        return '🏷️';
      case 'completion':
        return '✅';
      case 'assignment':
        return '📋';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-atlas-dark-foreground hover:text-atlas-red">
          <Bell className="h-5 w-5" />
          {count.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {count.total > 99 ? '99+' : count.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              Recent activity and mentions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No recent notifications
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">
                        {getNotificationIcon(notification.notification_type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {getNotificationTitle(notification.notification_type)}
                        </p>
                        {notification.work_order_id && (
                          <p className="text-xs text-muted-foreground">
                            Work Order ID: {notification.work_order_id.slice(0, 8)}...
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  Showing recent notifications from the last 7 days
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}