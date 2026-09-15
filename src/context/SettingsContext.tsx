import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ContactSettings, SiteContent } from '@/types';

interface SettingsContextValue {
  contact: ContactSettings | null;
  content: Record<string, SiteContent>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [contactRes, contentRes] = await Promise.all([
      supabase.from('contact_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('site_content').select('*'),
    ]);

    if (contactRes.data) setContact(contactRes.data as ContactSettings);
    if (contentRes.data) {
      const map: Record<string, SiteContent> = {};
      for (const item of contentRes.data as SiteContent[]) {
        map[item.section] = item;
      }
      setContent(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ contact, content, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
