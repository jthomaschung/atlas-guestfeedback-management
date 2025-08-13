import { Bell, X, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderDetails } from '@/components/work-orders/WorkOrderDetails';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { WorkOrder } from '@/types/work-order';
import { useToast } from '@/hooks/use-toast';

interface NotificationWithWorkOrder {
  id: string;
  work_order_id: string | null;
  sent_at: string;
  notification_type: string;
  status: string;
  work_order?: {
    id: string;
    store_number: string;
    description: string;
    status: string;
    priority: string;
    repair_type: string;
    market: string;
    ecosure: string;
    assignee: string | null;
    image_url: string | null;
    notes: string[] | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    user_id: string;
  };
}

export function NotificationBell() {
  const { count, loading, refresh } = useNotificationCount();
  const [notifications, setNotifications] = useState<NotificationWithWorkOrder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecentNotifications = async () => {
    if (!user?.email) return;

    try {
      // First get the notifications
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

      // Then get work order details for each notification that has a work_order_id
      const notificationsWithWorkOrders = await Promise.all(
        (notificationData || []).map(async (notification) => {
          if (notification.work_order_id) {
            const { data: workOrderData, error: workOrderError } = await supabase
              .from('work_orders')
              .select('*')
              .eq('id', notification.work_order_id)
              .single();

            if (!workOrderError && workOrderData) {
              return {
                ...notification,
                work_order: workOrderData
              };
            }
          }
          return notification;
        })
      );

      setNotifications(notificationsWithWorkOrders);
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

  const handleNotificationClick = async (notification: NotificationWithWorkOrder) => {
    // Mark notification as read
    await markNotificationAsRead(notification.id);
    
    if (notification.work_order) {
      const workOrder: WorkOrder = {
        id: notification.work_order.id,
        user_id: notification.work_order.user_id,
        description: notification.work_order.description,
        repair_type: notification.work_order.repair_type as any,
        store_number: notification.work_order.store_number,
        market: notification.work_order.market as any,
        priority: notification.work_order.priority as any,
        ecosure: notification.work_order.ecosure as any,
        status: notification.work_order.status as any,
        assignee: notification.work_order.assignee,
        image_url: notification.work_order.image_url,
        notes: notification.work_order.notes,
        created_at: notification.work_order.created_at,
        updated_at: notification.work_order.updated_at,
        completed_at: notification.work_order.completed_at,
      };
      setSelectedWorkOrder(workOrder);
      setIsOpen(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notification_log')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully marked notification as read');
      // Refresh notifications and count
      await fetchRecentNotifications();
      refresh();
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      toast({
        title: "Error", 
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const clearAllNotifications = async () => {
    if (!user?.email) return;

    try {
      console.log('Clearing all notifications for:', user.email);
      const { error } = await supabase
        .from('notification_log')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_email', user.email)
        .is('read_at', null);

      if (error) {
        console.error('Error clearing all notifications:', error);
        toast({
          title: "Error",
          description: "Failed to clear notifications",
          variant: "destructive"
        });
        return;
      }

      console.log('Successfully cleared all notifications');
      // Refresh notifications and count
      await fetchRecentNotifications();
      refresh();
      
      toast({
        title: "Notifications Cleared",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Error in clearAllNotifications:', error);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive"
      });
    }
  };

  const getNotificationDescription = (notification: NotificationWithWorkOrder) => {
    if (notification.work_order) {
      const storeNumber = notification.work_order.store_number;
      const description = notification.work_order.description;
      const maxLength = 50;
      const combined = `${storeNumber} - ${description}`;
      return combined.length > maxLength ? `${combined.substring(0, maxLength)}...` : combined;
    }
    return 'Work order not found';
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
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative text-atlas-dark-foreground hover:bg-atlas-red/10 hover:text-atlas-red transition-colors">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>
                    Recent activity and mentions
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
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
                      className="group relative p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">
                            {getNotificationIcon(notification.notification_type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {getNotificationTitle(notification.notification_type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getNotificationDescription(notification)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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

      {selectedWorkOrder && (
        <WorkOrderDetails
          workOrder={selectedWorkOrder}
          onUpdate={(updates) => {
            setSelectedWorkOrder(prev => prev ? { ...prev, ...updates } : null);
          }}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </>
  );
}