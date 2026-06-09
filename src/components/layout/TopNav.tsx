"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/settings/SettingsModal";
import ArrivalIcon from "@/components/icons/ArrivalIcon";

export default function TopNav() {
  const { user, logout } = useAuth();
  const { profile, activeGreeting, loading } = useUserProfile();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displayName = profile.name.trim() || "你";
  const greetingText = activeGreeting || "今天也要好好生活喔";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:gap-4 sm:px-8 md:px-14 lg:px-20">
          {/* 左側 Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
              <ArrivalIcon className="h-4 w-4" filled />
            </div>
            <span className="hidden font-serif text-base font-semibold text-[#4a443c] sm:inline">
              Blissful Arrival
            </span>
          </Link>

          {/* 中央招呼語 */}
          <div className="min-w-0 flex-1 text-center">
            {loading ? (
              <div className="mx-auto h-4 w-48 animate-pulse rounded-full bg-surface-inactive" />
            ) : (
              <p className="flex min-w-0 items-baseline justify-center gap-2 text-sm text-[#9a9288] sm:gap-3">
                <span className="shrink-0 font-semibold text-[#4a443c]">
                  嗨！{displayName}
                </span>
                <span className="hidden truncate sm:inline">{greetingText}</span>
              </p>
            )}
          </div>

          {/* 右側使用者區 */}
          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden items-center gap-2 md:flex">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-tag-sage text-xs font-semibold text-[#9a9288]">
                  {user?.displayName?.[0]?.toUpperCase() ??
                    user?.email?.[0]?.toUpperCase() ??
                    "U"}
                </div>
              )}
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-xl px-2 py-1.5 text-xs text-[#9a9288] transition-all hover:bg-tag-sage hover:text-[#4a443c] sm:px-3 sm:text-sm"
              aria-label="設定"
              title="設定"
            >
              設定
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl px-2 py-1.5 text-xs text-[#9a9288] transition-all hover:bg-surface-inactive hover:text-[#4a443c] sm:px-3 sm:text-sm"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
