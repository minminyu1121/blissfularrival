"use client";

import { TaskPanelProvider } from "@/contexts/TaskPanelProvider";
import { UserProfileProvider } from "@/contexts/UserProfileProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <TaskPanelProvider>{children}</TaskPanelProvider>
    </UserProfileProvider>
  );
}
