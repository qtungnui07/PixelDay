import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { api, type AuthSession, type AuthUser } from '@/lib/api';
import { signOutClerkSession } from '@/lib/clerk-config';

type AuthContextValue = {
  isReady: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  devLogin: () => Promise<void>;
  personalLogin: () => Promise<void>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  loginWithClerk: (input: { clerkUserId: string; email: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const SESSION_KEY = 'pixelday.auth.session.v1';
const AuthContext = createContext<AuthContextValue | null>(null);

type StoredSession = {
  user: AuthUser;
  session: AuthSession;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await AsyncStorage.getItem(SESSION_KEY);

        if (!saved) {
          const result = await api.personalLogin();
          await persistSession(result.user, result.session);
          return;
        }

        const stored = JSON.parse(saved) as StoredSession;
        const fresh = await api.me(stored.session.token);

        setToken(stored.session.token);
        setUser(fresh.user);
      } catch {
        await AsyncStorage.removeItem(SESSION_KEY);
        const result = await api.personalLogin();
        await persistSession(result.user, result.session);
      } finally {
        setIsReady(true);
      }
    }

    restoreSession();
  }, []);

  async function persistSession(nextUser: AuthUser, session: AuthSession) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user: nextUser, session }));
    setToken(session.token);
    setUser(nextUser);
    router.replace('/home');
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      token,
      user,
      async login(input) {
        const result = await api.login(input);
        await persistSession(result.user, result.session);
      },
      async devLogin() {
        const result = await api.devLogin();
        await persistSession(result.user, result.session);
      },
      async personalLogin() {
        const result = await api.personalLogin();
        await persistSession(result.user, result.session);
      },
      async register(input) {
        const result = await api.register(input);
        await persistSession(result.user, result.session);
      },
      async loginWithClerk(input) {
        const result = await api.clerkLogin(input);
        await persistSession(result.user, result.session);
      },
      async logout() {
        const currentToken = token;

        await signOutClerkSession().catch(() => undefined);
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem(SESSION_KEY);

        if (currentToken) {
          api.logout(currentToken).catch(() => undefined);
        }

        const result = await api.personalLogin();
        await persistSession(result.user, result.session);
      },
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
