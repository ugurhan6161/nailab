import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

type AdminAuthContextValue = {
  authenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading, signInAdmin, signOut } = useAuth();
  const authenticated = Boolean(user && profile?.role === 'admin');

  const login = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    if (result.error) throw new Error(result.error);
  }, [signInAdmin]);

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

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
