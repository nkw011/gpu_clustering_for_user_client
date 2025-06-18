'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { FiServer } from 'react-icons/fi'

interface DashboardRequest {
  id: string;
  project_name: string;
  gpu_model?: { name: string; memory_gb: number };
  server?: { name: string };
  quantity: number;
  duration: number;
  end_date: string;
  created_at: string;
  status: string;
  updated_at?: string;
}

interface DashboardPageProps {
  addNotification: (notif: any) => void;
}

export default function DashboardPage({ addNotification }: DashboardPageProps) {
  const [user, setUser] = useState<any>(null)
  const [activeResources, setActiveResources] = useState<DashboardRequest[]>([])
  const [recentRequests, setRecentRequests] = useState<DashboardRequest[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(userData)
        // fetch request history
        const { data: requests } = await supabase
          .from('resource_requests')
          .select('*, gpu_model:gpu_models(id, name, memory_gb), server:racks(id, name)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
        if (requests) {
          // Active: approved && not expired
          const now = new Date()
          setActiveResources(requests.filter(r => r.status === 'approved' && new Date(r.end_date) > now))
          setRecentRequests(requests.slice(0, 3))
        }
      }
    }
    fetchUserAndRequests()
  }, [supabase])

  // 만료 임박 알림 useEffect
  useEffect(() => {
    activeResources.forEach(resource => {
      const now = new Date();
      const end = new Date(resource.end_date);
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const notifId = resource.id + '-expire';
      // @ts-ignore
      if (diff > 0 && diff <= 2) {
        // 중복 알림 방지
        // @ts-ignore
        if (!window.__notified) window.__notified = {};
        // @ts-ignore
        if (!window.__notified[notifId]) {
          addNotification && addNotification({
            id: notifId,
            userId: user?.id,
            title: 'Resource Expiring Soon',
            message: `Your resource "${resource.project_name}" will expire in ${diff} days.`,
            type: 'warning',
            read: false,
            createdAt: new Date(),
          });
          // @ts-ignore
          window.__notified[notifId] = true;
        }
      }
    });
  }, [activeResources, addNotification, user]);

  // 최근 1일 이내 status 변경 알림 useEffect
  useEffect(() => {
    const now = new Date();
    recentRequests.forEach(request => {
      if (["approved", "denied", "expired"].includes(request.status)) {
        const updated = new Date(request.updated_at || request.created_at);
        const diffHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);
        const notifId = request.id + '-status-' + request.status;
        // @ts-ignore
        if (diffHours <= 24) {
          // 중복 알림 방지
          // @ts-ignore
          if (!window.__notified) window.__notified = {};
          // @ts-ignore
          if (!window.__notified[notifId]) {
            addNotification && addNotification({
              id: notifId,
              userId: user?.id,
              title: `Request ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`,
              message: `Your request "${request.project_name}" is now ${request.status}.`,
              type: request.status === 'approved' ? 'success' : (request.status === 'denied' ? 'error' : 'warning'),
              read: false,
              createdAt: updated,
            });
            // @ts-ignore
            window.__notified[notifId] = true;
          }
        }
      }
    });
  }, [recentRequests, addNotification, user]);

  return (
    <div className="p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your resources.</p>
      </div>
      {/* Your Active Resources */}
      <Card className="mb-8 bg-white border-0 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeResources.length === 0 ? (
            <div className="text-gray-400">No active resources.</div>
          ) : (
            activeResources.map((resource) => (
              <Card key={resource.id} className="bg-white border-0 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FiServer className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-900">{resource.gpu_model?.name || 'Unknown GPU'}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    Active
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Memory:</span>
                    <span className="font-medium text-gray-900">{resource.gpu_model?.memory_gb}GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className="font-medium text-gray-900">{new Date(resource.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Server:</span>
                    <span className="font-medium text-gray-900">{resource.server?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium text-gray-900">{resource.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-900">{resource.duration} days</span>
                  </div>
                  <div className="mt-2 px-4 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 w-fit">
                    {(() => {
                      const now = new Date();
                      const end = new Date(resource.end_date);
                      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return diff > 0 ? `${diff} days remaining` : 'Expired';
                    })()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
      {/* Recent Requests */}
      <Card className="mb-8 bg-white border-0 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pl-1">Project</th>
                <th className="pb-3">GPU MODEL</th>
                <th className="pb-3">REQUESTED</th>
                <th className="pb-3">DURATION</th>
                <th className="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-gray-400">No recent requests.</td>
                </tr>
              ) : (
                recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="py-3 pl-1 text-sm font-medium text-gray-900">{request.project_name}</td>
                    <td className="py-3 text-sm text-gray-500">{request.gpu_model?.name || 'Unknown GPU'}</td>
                    <td className="py-3 text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-sm text-gray-500">{request.duration} days</td>
                    <td className="py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' 
                          ? 'bg-green-50 text-green-700' 
                          : request.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : request.status === 'denied'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
