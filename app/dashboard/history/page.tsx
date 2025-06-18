"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";

// 타입 정의
interface RequestHistoryItem {
  id: string;
  project_name: string;
  server: { name: string; ip?: string; ip_address?: string; port?: number; username?: string } | null;
  gpu_model: { name: string; memory_gb: number } | null;
  quantity: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  duration: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Active</span>;
    case "pending":
      return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>;
    case "denied":
      return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Denied</span>;
    case "expired":
      return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">Expired</span>;
    default:
      return null;
  }
}

function getDaysRemaining(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days remaining` : "Expired";
}

export default function RequestHistoryPage() {
  const [requests, setRequests] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("resource_requests")
        .select(`*, server:racks(*), gpu_model:gpu_models(id, name, memory_gb)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Request History</h1>
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-400">No requests found.</div>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="p-6 rounded-2xl shadow flex flex-col md:flex-row items-center justify-between gap-4 bg-white relative">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 mr-2">
                    <svg width="20" height="20" fill="none"><rect width="20" height="20" rx="4" fill="#6366F1"/></svg>
                  </span>
                  <span className="font-bold text-lg">{req.project_name}</span>
                  <span className="ml-2">{getStatusBadge(req.status)}</span>
                </div>
                <div className="text-sm text-gray-500">GPU: <span className="font-medium text-gray-900">{req.gpu_model?.name || "Unknown GPU"}</span></div>
                <div className="text-sm text-gray-500">Memory: <span className="font-medium text-gray-900">{req.gpu_model?.memory_gb}GB</span></div>
                <div className="text-sm text-gray-500">Server: <span className="font-medium text-gray-900">{req.server?.name || "Unknown"}</span></div>
                <div className="text-sm text-gray-500">Quantity: <span className="font-semibold">{req.quantity}</span></div>
                <div className="text-sm text-gray-500">Duration: <span className="font-semibold">{req.duration} days</span></div>
                <div className="text-sm text-gray-500">Expires: <span className="font-medium text-gray-900">{new Date(req.end_date).toLocaleDateString()}</span></div>
                <div className="text-xs bg-blue-50 text-blue-600 rounded px-2 py-1 w-fit">{getDaysRemaining(req.end_date)}</div>
                {req.status === 'approved' && (req.server?.ip || req.server?.ip_address) && req.server?.port && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      SSH 접속: <code>ssh {(req.server?.username || 'user')}@{req.server?.ip || req.server?.ip_address} -p {req.server?.port}</code>
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(`ssh ${(req.server?.username || 'user')}@${req.server?.ip || req.server?.ip_address} -p ${req.server?.port}`)}
                      className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      복사
                    </button>
                  </div>
                )}
              </div>
              {req.status === 'pending' && (
                <button
                  className="absolute top-4 right-4 bg-red-50 text-red-600 px-4 py-1 rounded-full text-sm font-semibold shadow hover:bg-red-100 transition"
                  onClick={async () => {
                    await supabase
                      .from('resource_requests')
                      .delete()
                      .eq('id', req.id);
                    setRequests((prev) => prev.filter(r => r.id !== req.id));
                  }}
                >
                  Cancel
                </button>
              )}
              {req.status === 'approved' && (
                <button
                  className="absolute top-4 right-4 bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold shadow hover:bg-blue-100 transition"
                  onClick={async () => {
                    await supabase
                      .from('resource_requests')
                      .delete()
                      .eq('id', req.id);
                    setRequests((prev) => prev.filter(r => r.id !== req.id));
                  }}
                >
                  Return
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 