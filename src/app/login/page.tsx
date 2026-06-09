"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import LoginForm from "@/components/auth/LoginForm";
import LoginBranding from "@/components/auth/LoginBranding";
import ArrivalIcon from "@/components/icons/ArrivalIcon";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden w-[42%] shrink-0 lg:block">
        <LoginBranding />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-8 py-12">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
            <ArrivalIcon className="h-4 w-4" filled />
          </div>
          <span className="font-serif text-lg text-[#4a443c]">Blissful Arrival</span>
        </div>

        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl font-semibold text-[#4a443c]">
            歡迎回來 👋
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#9a9288]">
            登入你的生活進度工作台，繼續記錄每一天的成長
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <button
          type="button"
          title="需要協助？"
          className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-sm text-[#b5aea3] shadow-sm ring-1 ring-border transition-all hover:text-[#9a9288] hover:ring-sage"
        >
          ?
        </button>
      </div>
    </div>
  );
}
