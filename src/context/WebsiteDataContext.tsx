import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import defaults from '../../config/websiteData.json';
import { supabase } from '../lib/supabase';

const defaultCopy = defaults.copy as Record<string, string>;
type WebsiteDataContextValue = {
  copy: Record<string, string>;
  revision: number;
  updateWebsiteData: (data: unknown) => void;
};

const WebsiteDataContext = createContext<WebsiteDataContextValue | null>(null);
let activeCopy = defaultCopy;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function siteText(key: string, fallback: string): string {
  return activeCopy[key] ?? fallback;
}

export function WebsiteDataProvider({ children }: { children: ReactNode }) {
  const [copy, setCopy] = useState(defaultCopy);
  const [revision, setRevision] = useState(0);

  const updateWebsiteData = useCallback((data: unknown) => {
    const remoteCopy = isRecord(data) && isRecord(data.copy) ? data.copy : {};
    const nextCopy = Object.fromEntries(
      Object.entries({ ...defaultCopy, ...remoteCopy })
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
    activeCopy = nextCopy;
    setCopy(nextCopy);
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('data')
          .eq('id', 'site')
          .maybeSingle();
        if (error) throw error;
        if (active && data?.data) updateWebsiteData(data.data);
      } catch (error: unknown) {
        if (active) console.error('Supabase site içerikleri yüklenemedi; varsayılan metinler gösteriliyor:', error);
      }
    })();

    return () => { active = false; };
  }, [updateWebsiteData]);

  const value = useMemo(
    () => ({ copy, revision, updateWebsiteData }),
    [copy, revision, updateWebsiteData],
  );
  return <WebsiteDataContext.Provider value={value}>{children}</WebsiteDataContext.Provider>;
}

export function useWebsiteData() {
  const context = useContext(WebsiteDataContext);
  if (!context) throw new Error('useWebsiteData must be used within WebsiteDataProvider');
  return context;
}
