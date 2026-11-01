import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signInTrainer: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: Pick<Profile, 'full_name' | 'phone' | 'address'>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    profileUserId.current = userId;
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error('Supabase oturumu yüklenemedi:', error);
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (session?.user) await fetchProfile(session.user.id);
      } catch (profileError) {
        console.error('Kullanıcı profili yüklenemedi:', profileError);
      } finally {
        setLoading(false);
      }
    }).catch((error: unknown) => {
      console.error('Supabase oturumu yüklenemedi:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (profileUserId.current !== (session?.user.id ?? null)) {
        profileUserId.current = session?.user.id ?? null;
        setProfile(null);
      }
      setLoading(true);
      (async () => {
        try {
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (profileError) {
          setProfile(null);
          console.error('Kullanıcı profili yüklenemedi:', profileError);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInWithRole = async (email: string, password: string, role: 'admin' | 'trainer') => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: accountProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const hasRequiredRole = role === 'admin'
      ? accountProfile?.role === 'admin'
      : accountProfile?.role === 'trainer' || accountProfile?.role === 'admin';
    if (profileError || !hasRequiredRole) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        return { error: `Hesap yetkisi doğrulanamadı ve oturum kapatılamadı: ${signOutError.message}` };
      }
      setUser(null);
      setSession(null);
      profileUserId.current = null;
      setProfile(null);
      return {
        error: profileError
          ? `Hesap yetkisi doğrulanamadı: ${profileError.message}`
          : role === 'admin'
            ? 'Bu hesap yönetici yetkisine sahip değil.'
            : 'Bu hesap eğitmen portalına erişim yetkisine sahip değil.',
      };
    }

    setUser(data.user);
    setSession(data.session);
    profileUserId.current = data.user.id;
    setProfile(accountProfile);
    return { error: null };
  };

  const signInAdmin = (email: string, password: string) => signInWithRole(email, password, 'admin');
  const signInTrainer = (email: string, password: string) => signInWithRole(email, password, 'trainer');

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const saveProfile = async (updates: Pick<Profile, 'full_name' | 'phone' | 'address'>) => {
    if (!user) throw new Error('Profil bilgilerini kaydetmek için giriş yapın.');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw error;
    profileUserId.current = user.id;
    setProfile(data);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signInAdmin, signInTrainer, signUp, signOut, refreshProfile, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
