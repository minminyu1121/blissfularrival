import AuthGuard from "@/components/auth/AuthGuard";
import TopNav from "@/components/layout/TopNav";
import { AppProviders } from "./providers";

// 需要登入的頁面共用佈局 — 上導覽 + 內容區
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppProviders>
        <div className="flex min-h-screen flex-col bg-background">
          <TopNav />
          <main className="flex-1">{children}</main>
        </div>
      </AppProviders>
    </AuthGuard>
  );
}
