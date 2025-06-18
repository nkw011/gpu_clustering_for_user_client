'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiServer, FiFileText, FiClock, FiBell, FiUser } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { User } from '@/types/supabase';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { Notification } from '@/types/gpu';
import { Menu } from 'lucide-react';
import DashboardPage from './page';
import NotificationsPage from './notifications/page';
// import { v4 as uuidv4 } from 'uuid';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: FiGrid },
  { name: 'GPU Resources', href: '/dashboard/resources', icon: FiServer },
  { name: 'Request Resources', href: '/dashboard/request', icon: FiFileText },
  { name: 'Request History', href: '/dashboard/history', icon: FiClock },
  { name: 'Notifications', href: '/dashboard/notifications', icon: FiBell, badge: 2 },
  { name: 'Profile', href: '/dashboard/profile', icon: FiUser },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        setUser(userData);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // useEffect 바깥에 선언
  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (!error) setUnreadCount(count || 0);
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [supabase]);

  // 알림 추가 함수
  const addNotification = (notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // 로그아웃 함수
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <FiServer className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">GPU Cluster</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-600" : "text-gray-400"
                )} />
                <span>{item.name}</span>
                {/* 알림 메뉴에만 안 읽은 알림 뱃지 표시 */}
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
                {item.badge && item.name !== 'Notifications' && (
                  <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            {/* Search input 제거 */}
          </div>
          <div className="flex items-center space-x-4 relative">
            {/* 알림 벨 */}
            <button
              className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => router.push('/dashboard/notifications')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* 사용자 아이콘 및 드롭다운 */}
            <div className="relative">
              <button
                className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center focus:outline-none border-2 border-transparent hover:border-indigo-400 transition"
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <span className="text-sm font-medium text-indigo-600">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    onClick={() => { setUserMenuOpen(false); router.push('/dashboard/profile'); }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    onClick={handleSignOut}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {pathname === '/dashboard/notifications' ? (
            <NotificationsPage
              fetchUnreadCount={fetchUnreadCount}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
} 