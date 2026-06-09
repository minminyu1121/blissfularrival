"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import {
  shouldUseRedirectSignIn,
  translateAuthError,
} from "@/lib/authErrors";

export default function LoginForm() {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleGoogleSignIn = async () => {
    setError("");
    clearAuthError();
    setSubmitting(true);

    try {
      await signInWithGoogle();
      // 本機 popup 登入成功後導向；正式環境 redirect 會整頁跳轉，不會執行到這行
      if (!shouldUseRedirectSignIn()) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(translateAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm leading-relaxed text-red-500 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="flex h-12 items-center justify-center gap-3 rounded-2xl bg-accent-gradient text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {submitting ? "登入中..." : "使用 Google 登入 →"}
      </button>

      <div className="rounded-2xl border border-border bg-tag-sage px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span>✨</span>
          <p className="text-sm font-semibold text-[#6b6358]">Beta 測試版</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#9a9288]">
          使用你的 Google 帳號即可登入，無需另外註冊密碼，資料安全儲存於 Firebase。
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="white"
        fillOpacity="0.75"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="white"
        fillOpacity="0.75"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}
