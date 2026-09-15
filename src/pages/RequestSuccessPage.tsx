import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Search, Phone, MessageCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl, getWhatsAppMaterialMessage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui';

export default function RequestSuccessPage() {
  const location = useLocation();
  const { contact } = useSettings();
  const data = location.state as {
    requestId?: string;
    materialName?: string;
    quantity?: string;
    unit?: string;
    customerName?: string;
  };

  if (!data?.requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No request data found.</p>
          <Link to="/" className="px-6 py-3 bg-gradient-gold text-black font-semibold rounded-lg">
            GO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-6 pulse-gold">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gradient-gold text-center mb-3">
        REQUEST SENT SUCCESSFULLY
      </h1>
      <p className="text-slate-400 text-center mb-8 max-w-md">
        Your request has been sent to Sri Ramligeshwara Building Materials. Keep your Request ID to check status.
      </p>

      <div className="w-full rounded-2xl bg-gradient-charcoal border border-gold/30 p-6 sm:p-8 shadow-gold mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gold/10">
            <span className="text-slate-500 text-sm">Request ID</span>
            <span className="text-gold font-bold text-lg tracking-wide">{data.requestId}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gold/10">
            <span className="text-slate-500 text-sm">Material</span>
            <span className="text-slate-200 font-medium">{data.materialName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gold/10">
            <span className="text-slate-500 text-sm">Quantity</span>
            <span className="text-slate-200 font-medium">{data.quantity} {data.unit}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gold/10">
            <span className="text-slate-500 text-sm">Status</span>
            <StatusBadge status="pending" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center w-full">
        <Link
          to="/request-status"
          className="flex-1 min-w-[160px] px-6 py-3.5 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          CHECK REQUEST STATUS
        </Link>
        <Link
          to="/"
          className="flex-1 min-w-[160px] px-6 py-3.5 border-2 border-gold/30 text-gold font-semibold rounded-xl hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          GO TO HOME
        </Link>
      </div>

      <div className="mt-8 flex gap-4">
        <a
          href={`tel:${contact?.phone_1 || '8185817805'}`}
          className="flex items-center gap-2 text-emerald-400 text-sm font-medium hover:underline"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </a>
        <a
          href={getWhatsAppUrl(
            contact?.whatsapp,
            getWhatsAppMaterialMessage(contact, data.materialName || '', data.quantity, data.unit, data.customerName)
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-emerald-400 text-sm font-medium hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
