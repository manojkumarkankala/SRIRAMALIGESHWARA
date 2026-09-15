import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, CheckCircle, XCircle, Package, Users,
  TrendingUp, ArrowRight, Bell,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DealRequest, Notification } from '@/types';
import { StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    completed: 0,
    materials: 0,
    customers: 0,
  });
  const [recentRequests, setRecentRequests] = useState<DealRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [topMaterials, setTopMaterials] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [reqRes, matRes, notifRes] = await Promise.all([
        supabase.from('deal_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('materials').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const requests = (reqRes.data as DealRequest[]) || [];
      const s = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        accepted: requests.filter((r) => r.status === 'accepted').length,
        declined: requests.filter((r) => r.status === 'declined').length,
        completed: requests.filter((r) => r.status === 'completed').length,
        materials: matRes.count || 0,
        customers: new Set(requests.map((r) => r.mobile)).size,
      };
      setStats(s);
      setRecentRequests(requests.slice(0, 5));
      setNotifications((notifRes.data as Notification[]) || []);

      // Top materials
      const materialCounts: Record<string, number> = {};
      requests.forEach((r) => {
        materialCounts[r.material_name] = (materialCounts[r.material_name] || 0) + 1;
      });
      const top = Object.entries(materialCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopMaterials(top);

      setLoading(false);
    }
    loadData();
  }, []);

  const statCards = [
    { label: 'Total Requests', value: stats.total, icon: ClipboardList, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { label: 'Total Materials', value: stats.materials, icon: Package, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const maxMatCount = Math.max(...topMaterials.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-xl ${stat.bg} border ${stat.border} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-400 text-xs mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent requests */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gold font-semibold text-lg">Recent Requests</h2>
            <Link to="/admin/requests" className="text-gold text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No customer requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] border border-gold/5 hover:border-gold/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-gold font-medium text-sm">{req.request_id}</p>
                    <p className="text-slate-400 text-xs truncate">{req.customer_name} - {req.material_name} ({req.quantity} {req.unit})</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gold" />
              <h2 className="text-gold font-semibold text-lg">Notifications</h2>
            </div>
            {notifications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-[#0f0f0f] border border-gold/5">
                    <p className="text-slate-200 text-sm font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                    <p className="text-slate-600 text-xs mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top materials */}
          <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gold" />
              <h2 className="text-gold font-semibold text-lg">Most Requested</h2>
            </div>
            {topMaterials.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topMaterials.map((m, idx) => (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{m.name}</span>
                      <span className="text-gold font-medium">{m.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-gold rounded-full transition-all"
                        style={{ width: `${(m.count / maxMatCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 p-6">
        <h2 className="text-gold font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/admin/requests" className="px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium text-center hover:bg-gold/20 transition-colors">
            View Requests
          </Link>
          <Link to="/admin/materials" className="px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium text-center hover:bg-gold/20 transition-colors">
            Manage Materials
          </Link>
          <Link to="/admin/gallery" className="px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium text-center hover:bg-gold/20 transition-colors">
            Upload Gallery
          </Link>
          <Link to="/admin/content" className="px-4 py-3 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium text-center hover:bg-gold/20 transition-colors">
            Edit Content
          </Link>
        </div>
      </div>
    </div>
  );
}
