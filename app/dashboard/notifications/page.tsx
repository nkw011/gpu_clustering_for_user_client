"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Notification } from '@/types/gpu';
import { Card } from '@/components/ui/card';

interface NotificationsPageProps {
  fetchUnreadCount: () => void;
}

export default function NotificationsPage({ fetchUnreadCount }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      setNotifications(data);
    };
    fetchNotifications();
  }, [supabase]);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      if (error) {
        console.error('Error updating notification:', error);
        return;
      }
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getStatusBadge = (notif: Notification) => {
    if (notif.status === 'expire_soon') {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">Expire Soon</span>;
    }
    if (notif.status === 'approved') {
      return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">Approved</span>;
    }
    if (notif.status === 'denied') {
      return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">Denied</span>;
    }
    if (notif.status === 'expired') {
      return <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">Expired</span>;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-400">No notifications.</div>
        ) : (
          notifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`p-4 flex flex-col gap-2 cursor-pointer transition-colors hover:bg-gray-100 ${
                notif.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
              onClick={() => handleNotificationClick(notif.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base">{notif.title}</span>
                {getStatusBadge(notif)}
                <span className={`text-xs rounded-full px-2 py-0.5 ml-2 ${
                  notif.read ? 'bg-gray-200 text-gray-500' : 'bg-blue-200 text-blue-700'
                }`}>
                  {notif.read ? 'Read' : 'Unread'}
                </span>
              </div>
              <div className="text-sm text-gray-700">{notif.message}</div>
              <div className="text-xs text-gray-400">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 