"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  createDefaultGoalTracks,
  reorderGoalTrack,
  type GoalTrack,
} from "@/lib/goalTracks";
import {
  DEFAULT_GREETINGS,
  createUserProfile,
  pickRotatingGreeting,
  saveUserProfile,
  subscribeUserProfile,
  type UserProfile,
} from "@/lib/userProfile";

interface UserProfileContextType {
  profile: UserProfile;
  activeGreeting: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateGoalTrack: (
    trackId: string,
    updates: Partial<
      Pick<GoalTrack, "title" | "startDate" | "targetDate" | "tasks" | "weeklyProgress">
    >
  ) => Promise<void>;
  reorderGoalTracks: (
    trackId: string,
    direction: "up" | "down"
  ) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "",
  greetings: DEFAULT_GREETINGS,
  goalTracks: createDefaultGoalTracks(),
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeGreeting, setActiveGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPickedGreeting = useRef(false);
  const isCreating = useRef(false);

  const persistProfile = useCallback(
    async (next: UserProfile) => {
      if (!user) return;
      setSaving(true);
      setError(null);
      try {
        await saveUserProfile(user.uid, next, {
          email: user.email ?? "",
          photoURL: user.photoURL ?? undefined,
        });
        setProfile(next);
      } catch (err) {
        setError("儲存失敗，請稍後再試");
        console.error("Save error:", err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      setProfile(defaultProfile);
      setActiveGreeting("");
      setError(null);
      setLoading(false);
      hasPickedGreeting.current = false;
      isCreating.current = false;
      return;
    }

    setLoading(true);
    setError(null);
    hasPickedGreeting.current = false;

    const unsubscribe = subscribeUserProfile(
      user.uid,
      async (data) => {
        if (!data) {
          if (isCreating.current) return;
          isCreating.current = true;

          const initial: UserProfile = {
            ...defaultProfile,
            name: user.displayName ?? user.email?.split("@")[0] ?? "",
          };

          try {
            await createUserProfile(user.uid, initial, {
              email: user.email ?? "",
              photoURL: user.photoURL ?? undefined,
            });
          } catch {
            isCreating.current = false;
            setError("無法建立使用者資料，請確認 Firestore 已啟用");
            setProfile(initial);
            if (!hasPickedGreeting.current) {
              setActiveGreeting(
                pickRotatingGreeting(user.uid, initial.greetings)
              );
              hasPickedGreeting.current = true;
            }
            setLoading(false);
          }
          return;
        }

        isCreating.current = false;
        setProfile(data);

        if (!hasPickedGreeting.current) {
          setActiveGreeting(pickRotatingGreeting(user.uid, data.greetings));
          hasPickedGreeting.current = true;
        }

        setLoading(false);
      },
      (err) => {
        setError("無法連線 Firestore，請確認資料庫已建立");
        setLoading(false);
        console.error("Firestore error:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateProfile = useCallback(
    async (next: UserProfile) => {
      const cleaned: UserProfile = {
        ...next,
        name: next.name.trim(),
        greetings:
          next.greetings.map((g) => g.trim()).filter(Boolean) ||
          DEFAULT_GREETINGS,
      };
      await persistProfile(cleaned);
      setActiveGreeting((prev) => {
        if (prev && cleaned.greetings.includes(prev)) return prev;
        return cleaned.greetings[0] ?? DEFAULT_GREETINGS[0];
      });
    },
    [persistProfile]
  );

  const updateGoalTrack = useCallback(
    async (
      trackId: string,
      updates: Partial<
        Pick<
          GoalTrack,
          "title" | "startDate" | "targetDate" | "tasks" | "weeklyProgress"
        >
      >
    ) => {
      const goalTracks = profile.goalTracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track
      );
      await persistProfile({ ...profile, goalTracks });
    },
    [profile, persistProfile]
  );

  const reorderGoalTracks = useCallback(
    async (trackId: string, direction: "up" | "down") => {
      const reordered = reorderGoalTrack(profile.goalTracks, trackId, direction);
      if (!reordered) return;
      await persistProfile({ ...profile, goalTracks: reordered });
    },
    [profile, persistProfile]
  );

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        activeGreeting,
        loading,
        saving,
        error,
        updateProfile,
        updateGoalTrack,
        reorderGoalTracks,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile 必須在 UserProfileProvider 內使用");
  }
  return context;
}
