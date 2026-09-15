import { useEffect, useState, useMemo } from 'react';
import { Search, Phone, MessageCircle, Users, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DealRequest } from '@/types';
import { StatusBadge, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface Customer {
  mobile: string;
  name: string;
  totalRequests: number;
  pending: number;
  accepted: number;
  declined: number;
  lastRequest: string;
}

export default function AdminCustomersPage() {
  const [requests, setRequests] = useState<DealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [customerRequests, setCustomerRequests] = useState<DealRequest[]>([]);

  useEffect(() => {
    supabase.from('deal_requests').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setRequests((data as DealRequest[]) || []);
      setLoading(false);
    });
  }, []);

  const customers = useMemo(() => {
    const map: Record<string, Customer> = {};
    requests.forEach((r) => {
      if (!map[r.mobile]) {
        map[r.mobile] = { mobile: r.mobile, name: r.customer_name, totalRequests: 0, pending: 0, accepted: 0, declined: 0, lastRequest: r.created_at };
      }
      map[r.mobile].totalRequests++;
      if (r.status === 'pending') map[r.mobile].pending++;
      if (r.status === 'accepted') map[r.mobile].accepted++;
      if (r.status === 'declined') map[r.mobile].declined++;
      if (new Date(r.created_at) > new Date(map[r.mobile].lastRequest)) {
        map[r.mobile].lastRequest = r.created_at;
        map[r.mobile].name = r.customer_name;
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.lastRequest).getTime() - new Date(a.lastRequest).getTime());
  }, [requests]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q));
  }, [customers, search]);

  function viewCustomer(cust: Customer) {
    setViewing(cust);
    setCustomerRequests(requests.filter((r) => r.mobile === cust.mobile));
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient-gold mb-2">Customers</h1><p className="text-slate-400 text-sm">View customer details and request history</p></div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input type="text" placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No Customers" message="Customers who submit requests will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cust) => (
            <div key={cust.mobile} className="rounded-xl bg-gradient-charcoal border border-gold/10 p-5 hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gold font-bold text-base">{cust.name}</h3>
                  <p className="text-slate-400 text-sm">{cust.mobile}</p>
                </div>
                <button onClick={() => viewCustomer(cust)} className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 flex items-center justify-center"><Eye className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><p className="text-gold font-bold text-sm">{cust.totalRequests}</p><p className="text-slate-500 text-xs">Total</p></div>
                <div><p className="text-amber-400 font-bold text-sm">{cust.pending}</p><p className="text-slate-500 text-xs">Pending</p></div>
                <div><p className="text-emerald-400 font-bold text-sm">{cust.accepted}</p><p className="text-slate-500 text-xs">Accepted</p></div>
                <div><p className="text-red-400 font-bold text-sm">{cust.declined}</p><p className="text-slate-500 text-xs">Declined</p></div>
              </div>
              <p className="text-slate-500 text-xs mt-3">Last: {formatDate(cust.lastRequest)}</p>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-gold font-bold text-lg">{viewing.name}</h2><p className="text-slate-400 text-sm">{viewing.mobile}</p></div>
              <div className="flex items-center gap-2">
                <a href={`tel:${viewing.mobile}`} className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center"><Phone className="w-4 h-4" /></a>
                <button onClick={() => setViewing(null)} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="space-y-3">
              {customerRequests.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-[#0f0f0f] border border-gold/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gold text-sm font-medium">{r.request_id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-slate-400 text-sm">{r.material_name} - {r.quantity} {r.unit}</p>
                  <p className="text-slate-600 text-xs">{formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
