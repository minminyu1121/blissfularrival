"use client";

import { useEffect, useState } from "react";
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

  const [title, setTitle] = useState(track.title);
  const [startDate, setStartDate] = useState(track.startDate);
  const [targetDate, setTargetDate] = useState(track.targetDate);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

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

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#616161]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-surface shadow-xl ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-[#616161]">
            進度目標設定
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9e9e9e] hover:bg-surface-inactive"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-6 rounded-2xl bg-surface-inactive px-5 py-4">
            <p className="text-xs text-[#9e9e9e]">標語預覽</p>
            <p className="mt-1 text-base font-semibold text-[#616161]">
              {formatDateZh(targetDate)}
              {title.trim() || "目標名稱"}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="goal-title" className="mb-1.5 block text-sm font-semibold text-[#757575]">
              目標名稱
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：上架WellthCoach"
              className="focus-accent h-11 w-full rounded-xl border border-border bg-surface px-4 text-[#616161] placeholder:text-[#bdbdbd]"
            />
            <p className="mt-1 text-xs text-[#bdbdbd]">可自行修改目標名稱</p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-start" className="mb-1.5 block text-sm font-semibold text-[#757575]">
                起始日
              </label>
              <input
                id="goal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="focus-accent h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-[#616161]"
              />
            </div>
            <div>
              <label htmlFor="goal-target" className="mb-1.5 block text-sm font-semibold text-[#757575]">
                目標日期
              </label>
              <input
                id="goal-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="focus-accent h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-[#616161]"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-accent-gradient text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saved ? "已儲存 ✓" : saving ? "儲存中..." : "儲存設定"}
          </button>
        </div>
      </div>
    </div>
  );
}
