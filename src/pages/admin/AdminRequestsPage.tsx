import { useEffect, useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, XCircle, X, Phone, MessageCircle, MapPin, Calendar, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { DealRequest } from '@/types';
import { StatusBadge, EmptyState } from '@/components/ui';
import { formatDateTime, formatDate, getWhatsAppUrl, getWhatsAppMaterialMessage } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'declined', 'completed'];

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const { contact } = useSettings();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<DealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<DealRequest | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    const { data } = await supabase.from('deal_requests').select('*').order('created_at', { ascending: false });
    setRequests((data as DealRequest[]) || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let result = [...requests];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.request_id.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        r.material_name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [requests, search, statusFilter]);

  function openView(req: DealRequest) { setViewing(req); }
  function openAccept(req: DealRequest) {
    setViewing(req);
    setAdminMessage(`Your ${req.material_name} request has been accepted. Our team will contact you shortly.`);
    setShowAcceptModal(true);
  }
  function openDecline(req: DealRequest) {
    setViewing(req);
    setDeclineReason('');
    setShowDeclineModal(true);
  }

  async function confirmAccept() {
    if (!viewing || !user) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('deal_requests')
      .update({ status: 'accepted', admin_message: adminMessage, updated_at: new Date().toISOString() })
      .eq('id', viewing.id);

    if (error) {
      showToast('Failed to accept request.', 'error');
      setActionLoading(false);
      return;
    }

    // Audit log
    await supabase.from('admin_audit').insert({
      admin_id: user.id,
      action: 'accept_request',
      entity_type: 'deal_request',
      entity_id: viewing.id,
      details: `Accepted request ${viewing.request_id}`,
    });

    showToast('Request accepted successfully.', 'success');
    setShowAcceptModal(false);
    setViewing(null);
    setActionLoading(false);
    loadRequests();
  }

  async function confirmDecline() {
    if (!viewing || !user) return;
    if (!declineReason.trim()) {
      showToast('Please enter a decline reason.', 'error');
      return;
    }
    setActionLoading(true);
    const { error } = await supabase
      .from('deal_requests')
      .update({ status: 'declined', decline_reason: declineReason, updated_at: new Date().toISOString() })
      .eq('id', viewing.id);

    if (error) {
      showToast('Failed to decline request.', 'error');
      setActionLoading(false);
      return;
    }

    await supabase.from('admin_audit').insert({
      admin_id: user.id,
      action: 'decline_request',
      entity_type: 'deal_request',
      entity_id: viewing.id,
      details: `Declined request ${viewing.request_id}: ${declineReason}`,
    });

    showToast('Request declined.', 'success');
    setShowDeclineModal(false);
    setViewing(null);
    setActionLoading(false);
    loadRequests();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gradient-gold mb-2">Customer Requests</h1>
        <p className="text-slate-400 text-sm">Manage and respond to customer material requests</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search customer, mobile, request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                statusFilter === f ? 'bg-gradient-gold text-black' : 'border border-gold/20 text-slate-300 hover:border-gold/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No Requests" message="No customer requests found. New requests will appear here." />
      ) : (
        <div className="rounded-2xl bg-gradient-charcoal border border-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3">Request ID</th>
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3">Customer</th>
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Material</th>
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3 hidden md:table-cell">Mobile</th>
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-gold text-xs font-semibold uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-gold font-medium text-sm">{req.request_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 text-sm font-medium">{req.customer_name}</p>
                      <p className="text-slate-500 text-xs">{req.material_name} - {req.quantity} {req.unit}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-slate-300 text-sm">{req.material_name}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-slate-300 text-sm">{req.mobile}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-slate-400 text-xs">{formatDate(req.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openView(req)} className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors flex items-center justify-center" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => openAccept(req)} className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center" title="Accept">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDecline(req)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center" title="Decline">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewing && !showAcceptModal && !showDeclineModal && (
        <Modal onClose={() => setViewing(null)} title={`Request ${viewing.request_id}`}>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <DetailItem label="Customer Name" value={viewing.customer_name} />
            <DetailItem label="Mobile" value={viewing.mobile} />
            <DetailItem label="Material" value={viewing.material_name} />
            <DetailItem label="Quantity" value={`${viewing.quantity} ${viewing.unit}`} />
            <DetailItem label="Village / City" value={viewing.village || 'Not specified'} />
            <DetailItem label="Mandal" value={viewing.mandal || 'Not specified'} />
            <DetailItem label="District" value={viewing.district || 'Not specified'} />
            <DetailItem label="Delivery Address" value={viewing.delivery_address} />
            <DetailItem label="Required Date" value={formatDate(viewing.required_date)} />
            <DetailItem label="Preferred Time" value={viewing.preferred_time || 'Not specified'} />
            <DetailItem label="Additional Requirements" value={viewing.additional_requirements || 'None'} />
            <DetailItem label="Customer Message" value={viewing.message || 'None'} />
            <DetailItem label="Created" value={formatDateTime(viewing.created_at)} />
            <div className="flex justify-between items-center py-3 border-b border-gold/10">
              <span className="text-slate-500 text-sm">Status</span>
              <StatusBadge status={viewing.status} />
            </div>
            {viewing.reference_image_url && (
              <div>
                <p className="text-slate-500 text-sm mb-2">Reference Image</p>
                <img src={viewing.reference_image_url} alt="Reference" className="w-32 h-32 rounded-lg object-cover border border-gold/20" />
              </div>
            )}
            {viewing.admin_message && <DetailItem label="Admin Message" value={viewing.admin_message} />}
            {viewing.decline_reason && <DetailItem label="Decline Reason" value={viewing.decline_reason} />}

            {viewing.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <button onClick={() => openAccept(viewing)} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> ACCEPT
                </button>
                <button onClick={() => openDecline(viewing)} className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" /> DECLINE
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Accept modal */}
      {showAcceptModal && viewing && (
        <Modal onClose={() => setShowAcceptModal(false)} title="Accept Material Request?">
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">You are accepting <span className="text-gold font-medium">{viewing.material_name} - {viewing.quantity} {viewing.unit}</span> from {viewing.customer_name}.</p>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Admin Message</label>
              <textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAcceptModal(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors">
                CANCEL
              </button>
              <button onClick={confirmAccept} disabled={actionLoading} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                CONFIRM ACCEPT
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decline modal */}
      {showDeclineModal && viewing && (
        <Modal onClose={() => setShowDeclineModal(false)} title="Decline Material Request">
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">You are declining <span className="text-gold font-medium">{viewing.material_name} - {viewing.quantity} {viewing.unit}</span> from {viewing.customer_name}.</p>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Reason</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                placeholder="e.g. Material unavailable, Quantity unavailable, Delivery unavailable..."
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors">
                CANCEL
              </button>
              <button onClick={confirmDecline} disabled={actionLoading} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                CONFIRM DECLINE
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-gradient-charcoal border border-gold/20 shadow-dark-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gold font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-gold"><X className="w-6 h-6" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gold/5">
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <span className="text-slate-200 text-sm font-medium text-right">{value}</span>
    </div>
  );
}
