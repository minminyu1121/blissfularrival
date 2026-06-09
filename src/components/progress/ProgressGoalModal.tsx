"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import type { GoalTrack } from "@/lib/goalTracks";
import { formatDateZh } from "@/lib/progress";

interface ProgressGoalModalProps {
  open: boolean;
  trackId: string;
  track: GoalTrack;
  onClose: () => void;
}

export default function ProgressGoalModal({
  open,
  trackId,
  track,
  onClose,
}: ProgressGoalModalProps) {
  const { saving, updateGoalTrack } = useUserProfile();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState(track.title);
  const [startDate, setStartDate] = useState(track.startDate);
  const [targetDate, setTargetDate] = useState(track.targetDate);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setTitle(track.title);
      setStartDate(track.startDate);
      setTargetDate(track.targetDate);
      setError("");
      setSaved(false);
    }
  }, [open, track]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const handleSave = async () => {
    setError("");

    if (!title.trim()) {
      setError("請輸入目標名稱");
      return;
    }
    if (targetDate <= startDate) {
      setError("目標日期必須晚於起始日");
      return;
    }

    try {
      await updateGoalTrack(trackId, {
        title: title.trim(),
        startDate,
        targetDate,
      });
      setSaved(true);
      setTimeout(() => onClose(), 600);
    } catch {
      setError("儲存失敗，請稍後再試");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#616161]/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-goal-title"
        className="relative z-10 w-full max-w-sm rounded-2xl bg-surface shadow-xl ring-1 ring-border"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2
            id="progress-goal-title"
            className="font-serif text-sm font-semibold text-[#616161]"
          >
            進度目標設定
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-[#9e9e9e] hover:bg-surface-inactive"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 rounded-xl bg-surface-inactive px-4 py-3">
            <p className="text-[11px] text-[#9e9e9e]">標語預覽</p>
            <p className="mt-1 text-sm font-semibold text-[#616161]">
              {formatDateZh(targetDate)}
              {title.trim() || "目標名稱"}
            </p>
          </div>

          <div className="mb-3">
            <label
              htmlFor="goal-title"
              className="mb-1 block text-xs font-semibold text-[#757575]"
            >
              目標名稱
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：上架WellthCoach"
              className="focus-accent h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-[#616161] placeholder:text-[#bdbdbd]"
            />
            <p className="mt-1 text-[11px] text-[#bdbdbd]">可自行修改目標名稱</p>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="goal-start"
                className="mb-1 block text-xs font-semibold text-[#757575]"
              >
                起始日
              </label>
              <input
                id="goal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="focus-accent h-9 w-full rounded-xl border border-border bg-surface px-2.5 text-xs text-[#616161]"
              />
            </div>
            <div>
              <label
                htmlFor="goal-target"
                className="mb-1 block text-xs font-semibold text-[#757575]"
              >
                目標日期
              </label>
              <input
                id="goal-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="focus-accent h-9 w-full rounded-xl border border-border bg-surface px-2.5 text-xs text-[#616161]"
              />
            </div>
          </div>

          {error && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-9 w-full items-center justify-center rounded-xl bg-accent-gradient text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saved ? "已儲存 ✓" : saving ? "儲存中..." : "儲存設定"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
