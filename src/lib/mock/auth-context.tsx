"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MockUser } from "@/lib/mock/article-types";
import {
  ensureSeeded,
  getSessionUser,
  getUsers,
  loginAs,
} from "@/lib/mock/store";

interface MockAuthContextValue {
  user: MockUser | null;
  users: MockUser[];
  ready: boolean;
  /** True solo senza sessione Supabase: il selettore demo è attivo. */
  usingDemo: boolean;
  login: (userId: string) => void;
  refresh: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

/**
 * Sessione admin: preferisce il profilo Supabase reale.
 * Il cookie/localStorage demo resta solo fallback quando non c'è sessione.
 */
export function MockAuthProvider({
  children,
  sessionUser = null,
}: {
  children: ReactNode;
  sessionUser?: MockUser | null;
}) {
  const [demoUser, setDemoUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [ready, setReady] = useState(false);
  const usingDemo = !sessionUser;

  const refresh = useCallback(() => {
    ensureSeeded();
    setUsers(getUsers());
    setDemoUser(getSessionUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const login = useCallback(
    (userId: string) => {
      if (!usingDemo) return;
      setDemoUser(loginAs(userId));
    },
    [usingDemo],
  );

  const user = sessionUser ?? demoUser;

  const value = useMemo(
    () => ({ user, users, ready, usingDemo, login, refresh }),
    [user, users, ready, usingDemo, login, refresh],
  );

  return (
    <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
  );
}

export function useMockAuth(): MockAuthContextValue {
  const ctx = useContext(MockAuthContext);
  if (!ctx) {
    throw new Error("useMockAuth deve essere usato dentro MockAuthProvider");
  }
  return ctx;
}
