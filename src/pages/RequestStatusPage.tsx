import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, MessageCircle, CheckCircle, XCircle, Clock, Package, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { validateMobile, getWhatsAppUrl, getWhatsAppMaterialMessage, formatDate, formatDateTime } from '@/lib/utils';
import type { DealRequest } from '@/types';
import { StatusBadge } from '@/components/ui';

export default function RequestStatusPage() {
  const { contact } = useSettings();
  const { showToast } = useToast();
  const [requestId, setRequestId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<DealRequest | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!requestId.trim()) {
      showToast('Please enter your Request ID.', 'error');
      return;
    }
    if (!mobile.trim() || !validateMobile(mobile)) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('deal_requests')
      .select('*')
      .eq('request_id', requestId.trim().toUpperCase())
      .eq('mobile', mobile.trim())
      .maybeSingle();

    setLoading(false);

    if (error) {
      showToast('Something went wrong. Please try again.', 'error');
      return;
    }

    setRequest(data as DealRequest | null);
    setSearched(true);

    if (!data) {
      showToast('No request found with these details.', 'info');
    }
  }

  const phone = contact?.phone_1 || '8185817805';
  const timeline = ['pending', 'accepted', 'completed'];
  const declinedTimeline = ['pending', 'declined'];

  function getTimelineStep(status: string): number {
    if (status === 'pending') return 0;
    if (status === 'accepted') return 1;
    if (status === 'completed') return 2;
    return 0;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-gold mb-3">CHECK YOUR REQUEST</h1>
        <p className="text-slate-400 text-sm">Enter your Request ID and mobile number to track your request</p>
      </div>

      <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8 shadow-dark-lg mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Request ID</label>
            <input
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="e.g. SRB-20260913-001"
              className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl bg-[#0f0f0f] border border-gold/20 text-slate-200 text-sm focus:border-gold/50 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                CHECKING...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                CHECK STATUS
              </>
            )}
          </button>
        </div>
      </div>

      {searched && !request && (
        <div className="rounded-2xl bg-gradient-charcoal border border-red-500/20 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">No Request Found</h3>
          <p className="text-slate-400 text-sm">No request found with the provided Request ID and mobile number. Please check and try again.</p>
        </div>
      )}

      {request && (
        <div className="space-y-6">
          {/* Status display */}
          <div className={`rounded-2xl border p-6 sm:p-8 ${
            request.status === 'accepted' ? 'bg-emerald-950/30 border-emerald-500/30' :
            request.status === 'declined' ? 'bg-red-950/30 border-red-500/30' :
            'bg-gradient-charcoal border-gold/20'
          }`}>
            {request.status === 'accepted' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-emerald-400">REQUEST ACCEPTED</h2>
                </div>
                <p className="text-slate-300 mb-4">
                  Your request for <span className="text-gold font-semibold">{request.material_name} - {request.quantity} {request.unit}</span> has been accepted.
                </p>
                {request.admin_message && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 mb-4">
                    <p className="text-emerald-300 text-sm">{request.admin_message}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-emerald-500 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-500/10 transition-colors">
                    <Phone className="w-5 h-5" /> CALL NOW
                  </a>
                  <a
                    href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppMaterialMessage(contact, request.material_name, request.quantity, request.unit, request.customer_name, request.village || undefined))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> WHATSAPP
                  </a>
                </div>
              </>
            )}

            {request.status === 'declined' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <h2 className="text-2xl font-bold text-red-400">REQUEST DECLINED</h2>
                </div>
                <p className="text-slate-300 mb-4">
                  Your request for <span className="text-gold font-semibold">{request.material_name} - {request.quantity} {request.unit}</span> has been declined.
                </p>
                {request.decline_reason && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-4">
                    <p className="text-red-300 text-xs uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-red-200 text-sm">{request.decline_reason}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors">
                    <Phone className="w-5 h-5" /> CALL FOR HELP
                  </a>
                </div>
              </>
            )}

            {request.status === 'pending' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
                  <h2 className="text-2xl font-bold text-amber-400">REQUEST PENDING</h2>
                </div>
                <p className="text-slate-300 mb-2">
                  Your request for <span className="text-gold font-semibold">{request.material_name} - {request.quantity} {request.unit}</span> is being reviewed.
                </p>
                <p className="text-slate-500 text-sm">Our team will review your request shortly. Please check back later.</p>
              </>
            )}

            {request.status === 'completed' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-bold text-blue-400">REQUEST COMPLETED</h2>
                </div>
                <p className="text-slate-300">
                  Your request for <span className="text-gold font-semibold">{request.material_name} - {request.quantity} {request.unit}</span> has been completed.
                </p>
              </>
            )}
          </div>

          {/* Request details */}
          <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">REQUEST DETAILS</h3>
            <div className="space-y-3">
              <DetailRow label="Request ID" value={request.request_id} />
              <DetailRow label="Customer" value={request.customer_name} />
              <DetailRow label="Mobile" value={request.mobile} />
              <DetailRow label="Material" value={request.material_name} />
              <DetailRow label="Quantity" value={`${request.quantity} ${request.unit}`} />
              <DetailRow label="Location" value={request.village || request.delivery_address} />
              <DetailRow label="Required Date" value={formatDate(request.required_date)} />
              <DetailRow label="Created" value={formatDateTime(request.created_at)} />
              <div className="flex justify-between items-center py-3 border-b border-gold/10">
                <span className="text-slate-500 text-sm">Status</span>
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl bg-gradient-charcoal border border-gold/20 p-6 sm:p-8">
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-6">STATUS TIMELINE</h3>
            {request.status === 'declined' ? (
              <div className="space-y-4">
                <TimelineStep icon={CheckCircle} label="Request Submitted" active />
                <TimelineStep icon={XCircle} label="Request Declined" active danger />
              </div>
            ) : (
              <div className="space-y-4">
                <TimelineStep icon={CheckCircle} label="Request Submitted" active />
                <TimelineStep icon={Clock} label="Admin Reviewing" active={getTimelineStep(request.status) >= 0} current={request.status === 'pending'} />
                <TimelineStep icon={CheckCircle} label="Accepted" active={getTimelineStep(request.status) >= 1} current={request.status === 'accepted'} />
                <TimelineStep icon={Package} label="Deal / Delivery" active={getTimelineStep(request.status) >= 2} current={request.status === 'completed'} />
                <TimelineStep icon={CheckCircle} label="Completed" active={request.status === 'completed'} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gold/10">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 font-medium text-sm text-right">{value}</span>
    </div>
  );
}

function TimelineStep({ icon: Icon, label, active, current, danger }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  current?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
        danger ? 'bg-red-500/10 border-red-500' :
        active ? 'bg-gradient-gold border-gold' :
        'border-slate-700 bg-slate-800/50'
      } ${current ? 'pulse-gold' : ''}`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-400' : active ? 'text-black' : 'text-slate-600'}`} />
      </div>
      <span className={`text-sm font-medium ${active ? (danger ? 'text-red-400' : 'text-gold') : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
  );
}
