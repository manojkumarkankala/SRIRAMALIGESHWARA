import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, HardHat, ChevronRight } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl, getWhatsAppGenericMessage } from '@/lib/utils';

export default function Footer() {
  const { contact } = useSettings();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Materials', path: '/materials' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Videos', path: '/videos' },
    { name: 'Contact', path: '/contact' },
  ];

  const materialLinks = [
    { name: 'Sand', path: '/materials' },
    { name: 'Iron', path: '/materials' },
    { name: 'Cement', path: '/materials' },
    { name: 'Bricks', path: '/materials' },
    { name: 'Aggregates', path: '/materials' },
    { name: 'Tiles', path: '/materials' },
  ];

  const year = new Date().getFullYear();
  const businessName = contact?.business_name || 'Sri Ramligeshwara Building Materials';
  const tagline = contact?.business_name ? 'Build Your Dreams With Quality Materials' : 'Build Your Dreams With Quality Materials';

  return (
    <footer className="bg-gradient-charcoal border-t border-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
                <HardHat className="w-7 h-7 text-black" />
              </div>
              <div>
                <p className="text-gold font-bold text-base leading-tight tracking-wide">
                  SRI RAMLIGESHWARA
                </p>
                <p className="text-slate-400 text-xs font-medium">
                  Building Materials
                </p>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {tagline}
            </p>
            <p className="text-slate-500 text-xs">
              Quality construction materials for homes, commercial buildings, and projects of all sizes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-gold text-sm transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Materials */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">
              Materials
            </h3>
            <ul className="space-y-2">
              {materialLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-gold text-sm transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-slate-300 font-medium">{contact?.contact_person_1 || 'J. Srinkath'}</p>
                <a href={`tel:${contact?.phone_1 || '8185817805'}`} className="text-gold hover:underline">
                  {contact?.phone_1 || '8185817805'}
                </a>
              </div>
              <div className="text-sm">
                <p className="text-slate-300 font-medium">{contact?.contact_person_2 || 'B. Manikanta'}</p>
                <a href={`tel:${contact?.phone_2 || '9666005044'}`} className="text-gold hover:underline">
                  {contact?.phone_2 || '9666005044'}
                </a>
              </div>
              {contact?.address && (
                <div className="flex items-start gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <a
                  href={`tel:${contact?.phone_1 || '8185817805'}`}
                  className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors"
                  aria-label="Call"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                {contact?.maps_url && (
                  <a
                    href={contact.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors"
                    aria-label="Location"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            &copy; {year} {businessName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {contact?.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-gold text-xs transition-colors">Instagram</a>
            )}
            {contact?.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-gold text-xs transition-colors">Facebook</a>
            )}
            {contact?.youtube && (
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-gold text-xs transition-colors">YouTube</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
