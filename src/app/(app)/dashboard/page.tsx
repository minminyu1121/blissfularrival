"use client";

import { useUserProfile } from "@/contexts/UserProfileProvider";
import GoalTrackSection from "@/components/goal/GoalTrackSection";

export default function DashboardPage() {
  const { profile, loading } = useUserProfile();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-8 py-10 md:px-14 lg:px-20">
      {profile.goalTracks.map((track) => (
        <GoalTrackSection key={track.id} track={track} loading={loading} />
      ))}
    </div>
  );
}
