"use client";

import {
  TRACK_COACH_ID,
  type GoalTrack,
} from "@/lib/goalTracks";
import ProgressBar from "@/components/progress/ProgressBar";
import TaskArea from "@/components/tasks/TaskArea";

interface GoalTrackSectionProps {
  track: GoalTrack;
  loading?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMove?: (direction: "up" | "down") => void;
}

export default function GoalTrackSection({
  track,
  loading,
  isSelected = false,
  onSelect,
  canMoveUp = false,
  canMoveDown = false,
  onMove,
}: GoalTrackSectionProps) {
  const isPrimary = track.id === TRACK_COACH_ID;
  const showReorder =
    isSelected && onMove && (canMoveUp || canMoveDown);

  return (
    <section
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-1.5 shadow-sm ${
        isPrimary ? "goal-track-highlight" : "ring-1 ring-border"
      }`}
    >
      {showReorder && (
        <div
          className="absolute right-2 top-2 z-10 flex gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={() => onMove("up")}
            className="flex h-6 w-6 items-center justify-center rounded bg-surface text-xs text-[#9a9288] shadow-sm hover:bg-tag-sage hover:text-[#4a443c] disabled:cursor-not-allowed disabled:opacity-30"
            title="目標上移"
            aria-label="目標上移"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={() => onMove("down")}
            className="flex h-6 w-6 items-center justify-center rounded bg-surface text-xs text-[#9a9288] shadow-sm hover:bg-tag-sage hover:text-[#4a443c] disabled:cursor-not-allowed disabled:opacity-30"
            title="目標下移"
            aria-label="目標下移"
          >
            ↓
          </button>
        </div>
      )}

      {/* 內容區底色維持不變；點擊邊框（外圈 p-1.5）才選取 */}
      <div
        className="overflow-hidden rounded-[0.875rem] bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <ProgressBar track={track} loading={loading} embedded />
        <TaskArea track={track} embedded />
      </div>
    </section>
  );
}
