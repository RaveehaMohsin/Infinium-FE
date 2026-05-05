"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, clearToken, getToken, setToken } from "@/lib/api";
import type { User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasToken: boolean;
  refresh: () => Promise<void>;
  setSession: (token: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    setHasToken(!!token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
      setHasToken(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = useCallback(async (token: string) => {
    setToken(token);
    setHasToken(true);
    setLoading(true);
    try {
      const me = await authApi.getMe();
      setUser(me);
      return me;
    } catch {
      clearToken();
      setUser(null);
      setHasToken(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — token is cleared either way
    }
    setUser(null);
    setHasToken(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, hasToken, refresh, setSession, signOut }),
    [user, loading, hasToken, refresh, setSession, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
