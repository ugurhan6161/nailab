import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import defaults from '../../config/websiteData.json';

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
    const controller = new AbortController();
    fetch('/api/website-data', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok) {
          const message = isRecord(body) && typeof body.error === 'string'
            ? body.error
            : 'WebsiteData yüklenemedi.';
          throw new Error(message);
        }
        if (!isRecord(body) || !isRecord(body.websiteData)) {
          throw new Error('WebsiteData API beklenen biçimde yanıt vermedi.');
        }
        updateWebsiteData(body.websiteData);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('WebsiteData yüklenemedi; varsayılan metinler gösteriliyor:', error);
      });

    return () => controller.abort();
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
