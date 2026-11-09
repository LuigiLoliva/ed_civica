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
  login: (userId: string) => void;
  refresh: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

/** Sessione mock per demo ruoli finché Supabase Auth non è configurato. */
export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    ensureSeeded();
    setUsers(getUsers());
    setUser(getSessionUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const login = useCallback((userId: string) => {
    setUser(loginAs(userId));
  }, []);

  const value = useMemo(
    () => ({ user, users, ready, login, refresh }),
    [user, users, ready, login, refresh],
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
