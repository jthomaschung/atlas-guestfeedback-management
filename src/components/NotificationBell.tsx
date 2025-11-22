import { Bell, X, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  sent_at: string;
  notification_type: string;
  status: string;
}

export function NotificationBell() {
  const { count, loading, refresh } = useNotificationCount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecentNotifications = async () => {
    if (!user?.email) return;

    try {
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification_log')
        .select('*')
        .eq('recipient_email', user.email)
        .eq('status', 'sent')
        .is('read_at', null)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        return;
      }

      setNotifications(notificationData || []);
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
      case 'feedback_mention':
        return 'You were mentioned in feedback';
      case 'feedback_assignment':
        return 'Feedback assigned to you';
      case 'feedback_escalation':
        return 'Feedback escalated';
      default:
        return 'Notification';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
    setIsOpen(false);
    refresh();
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      fetchRecentNotifications();
      refresh();
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_email', user.email)
        .is('read_at', null);

      if (error) {
        console.error('Error marking all as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notifications as read',
          variant: 'destructive',
        });
        return;
      }

      refresh();
      fetchRecentNotifications();
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
        >
          <Bell className="h-4 w-4" />
          {count.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {count.total > 9 ? '9+' : count.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">
                        {getNotificationTitle(notification.notification_type)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-1 -mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
