"use client";

import { useEffect, useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileProvider";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { profile, saving, error, updateProfile } = useUserProfile();
  const [name, setName] = useState(profile.name);
  const [greetingsText, setGreetingsText] = useState(
    profile.greetings.join("\n")
  );
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setGreetingsText(profile.greetings.join("\n"));
      setSaved(false);
    }
  }, [open, profile]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const previewName = name.trim() || "你";
  const previewGreetings = greetingsText
    .split("\n")
    .map((g) => g.trim())
    .filter(Boolean);
  const previewGreeting =
    previewGreetings[0] || "今天也要好好生活喔";

  const handleSave = async () => {
    setSaveError("");
    const greetings = greetingsText
      .split("\n")
      .map((g) => g.trim())
      .filter(Boolean);
    try {
      await updateProfile({
        ...profile,
        name,
        greetings,
      });
      setSaved(true);
      setTimeout(() => onClose(), 600);
    } catch {
      setSaveError("儲存失敗，請確認 Firestore 已啟用並重試");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#616161]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-surface shadow-xl ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-[#616161]">
            個人設定
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9e9e9e] transition-colors hover:bg-surface-inactive hover:text-[#616161]"
            aria-label="關閉"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 預覽 — 漸層標籤 */}
          <div className="mb-6 rounded-2xl bg-surface-inactive px-5 py-4">
            <p className="text-xs font-medium text-[#9e9e9e]">招呼語預覽</p>
            <p className="mt-2 flex items-baseline gap-3 text-sm text-[#9e9e9e]">
              <span className="shrink-0 font-semibold text-[#616161]">
                嗨！{previewName}
              </span>
              <span>{previewGreeting}</span>
            </p>
            {previewGreetings.length > 1 && (
              <p className="mt-3 text-xs text-[#bdbdbd]">
                共 {previewGreetings.length} 則招呼句，每次重新整理輪播下一則
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="settings-name" className="mb-1.5 block text-sm font-semibold text-[#757575]">
              你的名字
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入你的名字"
              className="focus-accent h-11 w-full rounded-xl border border-border bg-surface px-4 text-[#616161] transition-all placeholder:text-[#bdbdbd]"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="settings-greetings" className="mb-1.5 block text-sm font-semibold text-[#757575]">
              自訂招呼句
            </label>
            <textarea
              id="settings-greetings"
              value={greetingsText}
              onChange={(e) => setGreetingsText(e.target.value)}
              placeholder={"今天也要好好生活喔\n每一步都在靠近更好的自己\n慢慢來，比較快"}
              rows={5}
              className="focus-accent w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[#616161] transition-all placeholder:text-[#bdbdbd]"
            />
            <p className="mt-1.5 text-xs text-[#bdbdbd]">
              每行輸入一則招呼句，重新整理頁面時會依序輪播
            </p>
          </div>

          {(saveError || error) && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500 ring-1 ring-red-100">
              {saveError || error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent-gradient text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saved ? "已儲存至 Firestore ✓" : saving ? "儲存中..." : "儲存設定"}
          </button>
        </div>
      </div>
    </div>
  );
}
