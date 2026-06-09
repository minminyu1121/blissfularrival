import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import TopNav from "@/components/layout/TopNav";
import { AppProviders } from "./providers";

// 需要登入的頁面共用佈局 — 上導覽 + 左側任務面板 + 內容區
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppProviders>
        <div className="flex min-h-screen flex-col bg-background">
          <TopNav />
          <div className="relative flex h-[calc(100dvh-3.5rem)] min-h-0 flex-1">
            <AppShell>{children}</AppShell>
          </div>
        </div>
      </AppProviders>
    </AuthGuard>
  );
}
