"use client";

import type { ReactNode } from "react";
import { MockAuthProvider } from "@/lib/mock/auth-context";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <MockAuthProvider>{children}</MockAuthProvider>;
}
