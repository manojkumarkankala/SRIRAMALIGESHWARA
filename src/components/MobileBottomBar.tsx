import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Package } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl, getWhatsAppGenericMessage } from '@/lib/utils';

export default function MobileBottomBar() {
  const { contact } = useSettings();
  const phone = contact?.phone_1 || '8185817805';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gold/20">
      <div className="grid grid-cols-3 gap-1 p-2">
        <a
          href={`tel:${phone}`}
          className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gold/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <Phone className="w-5 h-5 text-black" />
          </div>
          <span className="text-xs text-gold font-medium">CALL</span>
        </a>
        <a
          href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-emerald-400 font-medium">WHATSAPP</span>
        </a>
        <Link
          to="/materials"
          className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gold/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-charcoal border border-gold flex items-center justify-center shadow-gold">
            <Package className="w-5 h-5 text-gold" />
          </div>
          <span className="text-xs text-gold font-medium">REQUEST</span>
        </Link>
      </div>
    </div>
  );
}
