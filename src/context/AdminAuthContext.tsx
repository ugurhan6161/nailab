import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type AdminAuthContextValue = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

async function requestAdminApi(path: string, method: 'GET' | 'POST', body?: unknown) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof responseBody === 'object' && responseBody !== null
      && 'error' in responseBody && typeof responseBody.error === 'string'
      ? responseBody.error
      : `Admin API isteği başarısız oldu (${response.status}).`;
    throw new Error(message);
  }
  return responseBody;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const body = await requestAdminApi('/api/admin/session', 'GET');
      setAuthenticated(
        typeof body === 'object' && body !== null
        && 'authenticated' in body && body.authenticated === true,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch((error: unknown) => {
      console.error('Admin oturumu yüklenemedi:', error);
    });
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await requestAdminApi('/api/admin/login', 'POST', { email, password });
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await requestAdminApi('/api/admin/logout', 'POST');
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ authenticated, loading, login, logout }),
    [authenticated, loading, login, logout],
  );
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
}
