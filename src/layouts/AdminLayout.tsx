import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, FolderTree, Users,
  Image, Video, FileText, Phone, MapPin, Search, Settings,
  LogOut, Menu, X, Bell, HardHat,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Requests', path: '/admin/requests', icon: ClipboardList },
  { name: 'Materials', path: '/admin/materials', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: FolderTree },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Gallery', path: '/admin/gallery', icon: Image },
  { name: 'Videos', path: '/admin/videos', icon: Video },
  { name: 'Website Content', path: '/admin/content', icon: FileText },
  { name: 'Contact', path: '/admin/contact', icon: Phone },
  { name: 'Location', path: '/admin/location', icon: MapPin },
  { name: 'SEO', path: '/admin/seo', icon: Search },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || (profile && profile.role !== 'admin')) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => setNotifications((data as Notification[]) || []));
    }
  }, [profile, location.pathname]);

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin')) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#0f0f0f] border-r border-gold/10 fixed inset-y-0 left-0 z-30">
        <SidebarContent isActive={isActive} onSignOut={handleSignOut} />
      </aside>

      {/* Sidebar - mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#0f0f0f] border-r border-gold/10 flex flex-col">
            <SidebarContent isActive={isActive} onSignOut={handleSignOut} onItemClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-gold/10 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gold p-1">
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-gold font-semibold text-sm sm:text-base">
              {SIDEBAR_ITEMS.find((item) => isActive(item.path))?.name || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAllRead(); }}
                className="relative p-2 text-slate-400 hover:text-gold transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-[#0f0f0f] border border-gold/20 shadow-dark-lg p-2">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gold/10 mb-2">
                    <span className="text-gold font-semibold text-sm">Notifications</span>
                    <button onClick={() => setShowNotif(false)} className="text-slate-500 hover:text-gold">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2.5 rounded-lg hover:bg-gold/5 transition-colors mb-1">
                        <p className="text-slate-200 text-sm font-medium">{n.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                        <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-black font-bold text-xs">{profile?.name?.charAt(0) || 'A'}</span>
              </div>
              <span className="hidden sm:block text-slate-300 text-sm font-medium">{profile?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

function SidebarContent({
  isActive,
  onSignOut,
  onItemClick,
}: {
  isActive: (path: string) => boolean;
  onSignOut: () => void;
  onItemClick?: () => void;
}) {
  return (
    <>
      <div className="h-16 flex items-center gap-3 px-5 border-b border-gold/10">
        <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
          <HardHat className="w-6 h-6 text-black" />
        </div>
        <div>
          <p className="text-gold font-bold text-xs leading-tight">SRI RAMLIGESHWARA</p>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-gold text-black'
                  : 'text-slate-400 hover:bg-gold/5 hover:text-gold'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gold/10">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );
}
