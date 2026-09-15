import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Package, Home, Info, Image, Video, Mail, ChevronRight, HardHat, Shield } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl, getWhatsAppGenericMessage } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { contact } = useSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Materials', path: '/materials', icon: Package },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Gallery', path: '/gallery', icon: Image },
    { name: 'Videos', path: '/videos', icon: Video },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-dark-lg border-b border-gold/20' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold transition-transform group-hover:scale-110">
                <HardHat className="w-6 h-6 lg:w-7 lg:h-7 text-black" />
              </div>
              <div className="hidden sm:block">
                <p className="text-gold font-bold text-sm lg:text-base leading-tight tracking-wide">
                  SRI RAMLIGESHWARA
                </p>
                <p className="text-slate-300 text-xs lg:text-sm font-medium leading-tight">
                  Building Materials
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                    isActive(link.path)
                      ? 'text-gold'
                      : 'text-slate-300 hover:text-gold'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-gold transition-all duration-300 ${
                      isActive(link.path) ? 'w-8' : 'w-0 group-hover:w-6'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/materials"
                className="px-5 py-2.5 bg-gradient-gold text-black font-semibold text-sm rounded-lg hover:shadow-gold-lg transition-all duration-200 hover:scale-105"
              >
                Request Material
              </Link>
              <Link
                to="/admin/login"
                className="px-4 py-2.5 border border-gold/30 text-gold font-medium text-sm rounded-lg hover:bg-gold/10 transition-all duration-200"
              >
                Admin
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gold rounded-lg hover:bg-gold/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden glass border-t border-gold/20 animate-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'bg-gold/10 text-gold'
                        : 'text-slate-300 hover:bg-gold/5 hover:text-gold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                );
              })}
              <Link
                to="/materials"
                className="flex items-center justify-center gap-2 px-4 py-3 mt-2 bg-gradient-gold text-black font-semibold rounded-lg"
              >
                <Package className="w-5 h-5" />
                Request Material
              </Link>
              <Link
                to="/admin/login"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-gold/10 text-gold'
                    : 'text-slate-300 hover:bg-gold/5 hover:text-gold'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </Link>
              <div className="flex gap-3 pt-2">
                <a
                  href={`tel:${contact?.phone_1 || '8185817805'}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gold/30 text-gold rounded-lg text-sm font-medium"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <a
                  href={getWhatsAppUrl(contact?.whatsapp, getWhatsAppGenericMessage(contact))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16 lg:h-20" />
    </>
  );
}
