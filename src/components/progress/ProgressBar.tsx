"use client";

import { useState } from "react";
import type { GoalTrack } from "@/lib/goalTracks";
import {
  formatDateZh,
  getHoursProgressPercent,
  getMonthMarkers,
  getWeekCount,
  getWeekProgress,
  getWeeklyHourGoal,
} from "@/lib/progress";
import {
  formatHours,
  getTotalHours,
  getWeeklyCompletedHours,
} from "@/lib/tasks";
import ProgressGoalModal from "@/components/progress/ProgressGoalModal";

interface ProgressBarProps {
  track: GoalTrack;
  loading?: boolean;
  embedded?: boolean;
}

export default function ProgressBar({
  track,
  loading,
  embedded,
}: ProgressBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const markers = getMonthMarkers(track.startDate, track.targetDate);
  const week = getWeekProgress();
  const totalHours = getTotalHours(track.tasks);
  const totalPercent = getHoursProgressPercent(
    totalHours.completed,
    totalHours.required
  );
  const weekCompleted = getWeeklyCompletedHours(track.weeklyProgress);
  const weekGoal = getWeeklyHourGoal(
    totalHours.required,
    totalHours.completed,
    track.startDate,
    track.targetDate
  );
  const weekCount = getWeekCount(track.startDate, track.targetDate);
  const weekPercent = getHoursProgressPercent(weekCompleted, weekGoal);

  const wrapperClass = embedded
    ? "px-6 pb-4 pt-6"
    : "rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border";

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div className="mb-4 h-6 w-64 animate-pulse rounded-lg bg-surface-inactive" />
        <div className="progress-track h-3 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className={wrapperClass}>
        {/* 標題列：日期 + 目標名稱 */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-[#4a443c]">
            {formatDateZh(track.targetDate)} {track.title}
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-full border border-border bg-surface-tan px-4 py-1.5 text-xs font-medium text-[#6b6358] transition-all hover:border-sage hover:bg-tag-sage hover:text-[#4a443c]"
            aria-label="設定進度目標"
            title="設定目標"
          >
            設定
          </button>
        </div>

        {/* 大時間軸 */}
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="w-8 shrink-0 pt-1 text-xs font-medium text-[#9a9288]">
            全部
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-[#9a9288]">
              <span className="shrink-0">{formatDateZh(track.startDate)} 起程</span>
              <span className="shrink-0 font-semibold text-[#4a443c]">
                {Math.round(totalPercent)}%
              </span>
            </div>

            <div className="relative">
              <div className="relative">
                <div className="progress-track h-3">
                  <div
                    className="h-full rounded-full bg-sage transition-all duration-700"
                    style={{ width: `${totalPercent}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-sage shadow-sm"
                  style={{ left: `calc(${totalPercent}% - 8px)` }}
                />
              </div>

              <div className="relative mt-0.5 h-7 w-full">
                {markers.map((m, i) => {
                  const isFirst = i === 0;
                  const isLast = i === markers.length - 1;
                  return (
                    <div
                      key={`${m.label}-${i}`}
                      className={`absolute top-0 flex flex-col ${
                        isFirst
                          ? "items-start"
                          : isLast
                            ? "items-end"
                            : "items-center"
                      }`}
                      style={{
                        left: isFirst ? "0%" : isLast ? "auto" : `${m.position}%`,
                        right: isLast ? "0%" : "auto",
                        transform: isFirst || isLast ? "none" : "translateX(-50%)",
                      }}
                    >
                      <div
                        className={`h-1.5 w-px ${
                          m.isCurrent ? "bg-sage" : "bg-border"
                        }`}
                      />
                      <span
                        className={`mt-0.5 text-[10px] font-medium leading-none ${
                          m.isCurrent
                            ? "rounded bg-sage px-1 py-0.5 text-white"
                            : m.isPast
                              ? "text-[#9a9288]"
                              : "text-[#b5aea3]"
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-28 shrink-0 pt-1 text-right text-xs leading-relaxed sm:w-32">
            <p className="whitespace-nowrap font-semibold text-[#4a443c]">
              {formatDateZh(track.targetDate)} 抵達
            </p>
            <p className="mt-0.5 whitespace-nowrap font-semibold text-[#4a443c]">
              已完成 {formatHours(totalHours.completed)}/
              {formatHours(totalHours.required)} 小時
            </p>
          </div>
        </div>

        {/* 小時間軸 */}
        <div className="mt-2 flex items-start gap-2 sm:gap-3">
          <span className="w-8 shrink-0 pt-1 text-xs font-medium text-[#9a9288]">
            本週
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs text-[#9a9288]">
              {week.rangeLabel}
              <span className="ml-1 text-[#b5aea3]">（共 {weekCount} 週）</span>
            </p>

            <div className="relative">
              <div className="progress-track h-2.5">
                <div
                  className="h-full rounded-full bg-sage transition-all duration-500"
                  style={{ width: `${weekPercent}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-sage shadow-sm"
                style={{ left: `calc(${weekPercent}% - 6px)` }}
              />

              <div className="relative mt-0.5 h-6 w-full">
                {week.markers.map((d, i) => {
                  const isFirst = i === 0;
                  const isLast = i === week.markers.length - 1;
                  return (
                    <div
                      key={`week-${d.label}-${i}`}
                      className={`absolute top-0 flex flex-col ${
                        isFirst
                          ? "items-start"
                          : isLast
                            ? "items-end"
                            : "items-center"
                      }`}
                      style={{
                        left: isFirst ? "0%" : isLast ? "auto" : `${d.position}%`,
                        right: isLast ? "0%" : "auto",
                        transform: isFirst || isLast ? "none" : "translateX(-50%)",
                      }}
                    >
                      <div
                        className={`h-1 w-px ${
                          d.isCurrent ? "bg-sage" : "bg-border"
                        }`}
                      />
                      <span
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-medium ${
                          d.isCurrent
                            ? "bg-sage text-white"
                            : d.isPast
                              ? "bg-tag-sage text-[#9a9288]"
                              : "bg-surface-inactive text-[#b5aea3]"
                        }`}
                      >
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-28 shrink-0 pt-1 text-right text-xs sm:w-32">
            <p className="whitespace-nowrap font-semibold text-[#4a443c]">
              已完成 {formatHours(weekCompleted)}/{formatHours(weekGoal)} 小時
            </p>
          </div>
        </div>
      </div>

      <ProgressGoalModal
        open={modalOpen}
        trackId={track.id}
        track={track}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
