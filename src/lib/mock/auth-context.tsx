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
import { isAdminRole, normalizeRole } from "@/lib/auth/role-utils";
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
  isAdmin: boolean;
  login: (userId: string) => void;
  refresh: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

function normalizeUser(user: MockUser | null): MockUser | null {
  if (!user) return null;
  const role = normalizeRole(user.role);
  if (!role) return null;
  return { ...user, role };
}

/**
 * Sessione admin: con profilo Supabase la demo localStorage è disattivata.
 * Il selettore ruolo resta solo fallback senza sessione reale.
 */
export function MockAuthProvider({
  children,
  sessionUser = null,
}: {
  children: ReactNode;
  /** Profilo reale dal layout server; se presente disabilita il mock. */
  sessionUser?: MockUser | null;
}) {
  const realtimeUser = normalizeUser(sessionUser);
  const usingDemo = realtimeUser == null;

  const [demoUser, setDemoUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  // Con sessione reale siamo subito ready: niente attesa localStorage.
  const [demoReady, setDemoReady] = useState(!usingDemo);

  const refresh = useCallback(() => {
    if (!usingDemo) return;
    ensureSeeded();
    setUsers(getUsers());
    setDemoUser(normalizeUser(getSessionUser()));
  }, [usingDemo]);

  useEffect(() => {
    if (!usingDemo) {
      setDemoReady(true);
      return;
    }
    refresh();
    setDemoReady(true);
  }, [usingDemo, refresh]);

  const login = useCallback(
    (userId: string) => {
      if (!usingDemo) return;
      setDemoUser(normalizeUser(loginAs(userId)));
    },
    [usingDemo],
  );

  const user = usingDemo ? demoUser : realtimeUser;
  const ready = usingDemo ? demoReady : true;

  const value = useMemo(
    () => ({
      user,
      users,
      ready,
      usingDemo,
      isAdmin: isAdminRole(user?.role),
      login,
      refresh,
    }),
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
