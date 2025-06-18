'use client';

import { useState } from 'react';
import { Notification } from '@/types/gpu';
import { Bell, BellRing } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 임시 데이터
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Resource Request Approved',
    message: 'Your GPU resource request has been approved.',
    type: 'success',
    read: false,
    createdAt: new Date('2024-03-19'),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Resource Expiring Soon',
    message: 'Your GPU resources will expire in 24 hours.',
    type: 'warning',
    read: false,
    createdAt: new Date('2024-03-18'),
  },
  // 추가 알림 데이터...
];

export interface NotificationCenterProps {
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
}

export function NotificationCenter({ notifications, setNotifications }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    notification.read ? 'bg-background' : getNotificationColor(notification.type),
                    'hover:bg-accent'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    <time className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 