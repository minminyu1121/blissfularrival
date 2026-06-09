"use client";

import { UserProfileProvider } from "@/contexts/UserProfileProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <UserProfileProvider>{children}</UserProfileProvider>;
}
