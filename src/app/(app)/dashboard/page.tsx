"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import GoalTrackSection from "@/components/goal/GoalTrackSection";
import { getSortedGoalTracks } from "@/lib/goalTracks";

export default function DashboardPage() {
  const { profile, loading, reorderGoalTracks } = useUserProfile();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const sortedTracks = getSortedGoalTracks(profile.goalTracks);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-8 py-10 md:px-14 lg:px-20">
      {sortedTracks.map((track, index) => (
        <GoalTrackSection
          key={track.id}
          track={track}
          loading={loading}
          isSelected={selectedTrackId === track.id}
          onSelect={() =>
            setSelectedTrackId((prev) =>
              prev === track.id ? null : track.id
            )
          }
          canMoveUp={index > 0}
          canMoveDown={index < sortedTracks.length - 1}
          onMove={(direction) => reorderGoalTracks(track.id, direction)}
        />
      ))}
    </div>
  );
}
