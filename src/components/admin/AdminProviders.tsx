"use client";

import type { ReactNode } from "react";
import { MockAuthProvider } from "@/lib/mock/auth-context";
import type { MockUser } from "@/lib/mock/article-types";

export function AdminProviders({
  children,
  sessionUser = null,
}: {
  children: ReactNode;
  sessionUser?: MockUser | null;
}) {
  return (
    <MockAuthProvider sessionUser={sessionUser}>{children}</MockAuthProvider>
  );
}
