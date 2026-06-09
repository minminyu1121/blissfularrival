"use client";

import type { GoalTrack } from "@/lib/goalTracks";
import ProgressBar from "@/components/progress/ProgressBar";
import TaskArea from "@/components/tasks/TaskArea";

interface GoalTrackSectionProps {
  track: GoalTrack;
  loading?: boolean;
}

export default function GoalTrackSection({
  track,
  loading,
}: GoalTrackSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <ProgressBar track={track} loading={loading} embedded />
      <TaskArea track={track} embedded />
    </section>
  );
}
