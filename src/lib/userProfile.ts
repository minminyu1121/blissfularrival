import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  TRACK_COACH_ID,
  TRACK_WELLTHCOACH_ID,
  createDefaultGoalTracks,
  parseGoalTrack,
  parseTasks,
  type GoalTrack,
} from "@/lib/goalTracks";
import { DEFAULT_PROGRESS_GOAL } from "@/lib/progress";
import { getWeekKey } from "@/lib/tasks";

export type { GoalTrack };

export interface UserProfile {
  name: string;
  greetings: string[];
  goalTracks: GoalTrack[];
}

export interface UserProfileMeta {
  email: string;
  photoURL?: string;
}

const COLLECTION = "users";

export const DEFAULT_GREETINGS = [
  "今天也要好好生活喔",
  "每一步都在靠近更好的自己",
  "慢慢來，比較快",
];

function parseGoalTracks(data: Record<string, unknown>): GoalTrack[] {
  if (Array.isArray(data.goalTracks) && data.goalTracks.length > 0) {
    const tracks = data.goalTracks
      .map((t) => parseGoalTrack(t as Record<string, unknown>))
      .sort((a, b) => a.order - b.order);

    // 確保兩組目標都存在
    const defaults = createDefaultGoalTracks();
    for (const def of defaults) {
      if (!tracks.find((t) => t.id === def.id)) {
        tracks.push(def);
      }
    }
    return tracks.sort((a, b) => a.order - b.order);
  }

  // 舊版資料遷移
  const pg = data.progressGoal as Record<string, unknown> | undefined;
  const wp = data.weeklyProgress as Record<string, unknown> | undefined;
  const defaults = createDefaultGoalTracks();

  defaults[0] = {
    ...defaults[0],
    title:
      typeof pg?.title === "string" ? pg.title : DEFAULT_PROGRESS_GOAL.title,
    startDate:
      typeof pg?.startDate === "string"
        ? pg.startDate
        : DEFAULT_PROGRESS_GOAL.startDate,
    targetDate:
      typeof pg?.targetDate === "string"
        ? pg.targetDate
        : DEFAULT_PROGRESS_GOAL.targetDate,
    tasks: parseTasks(data.tasks),
    weeklyProgress: {
      weekKey:
        typeof wp?.weekKey === "string" ? wp.weekKey : getWeekKey(),
      completedHours: Number(wp?.completedHours) || 0,
    },
  };

  return defaults;
}

function parseProfile(data: Record<string, unknown>): UserProfile {
  let greetings: string[] = DEFAULT_GREETINGS;

  if (Array.isArray(data.greetings)) {
    const parsed = data.greetings
      .map((g) => String(g).trim())
      .filter(Boolean);
    if (parsed.length > 0) greetings = parsed;
  } else if (typeof data.greeting === "string" && data.greeting.trim()) {
    greetings = [data.greeting.trim()];
  }

  return {
    name: typeof data.name === "string" ? data.name : "",
    greetings,
    goalTracks: parseGoalTracks(data),
  };
}

export function subscribeUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const ref = doc(getFirebaseDb(), COLLECTION, userId);

  return onSnapshot(
    ref,
    (snap) => {
      onData(snap.exists() ? parseProfile(snap.data()) : null);
    },
    (err) => onError(err)
  );
}

export async function saveUserProfile(
  userId: string,
  profile: UserProfile,
  meta?: UserProfileMeta
): Promise<void> {
  const greetings = profile.greetings.map((g) => g.trim()).filter(Boolean);
  const finalGreetings =
    greetings.length > 0 ? greetings : DEFAULT_GREETINGS;

  await setDoc(
    doc(getFirebaseDb(), COLLECTION, userId),
    {
      name: profile.name.trim(),
      greetings: finalGreetings,
      goalTracks: profile.goalTracks,
      ...(meta?.email ? { email: meta.email } : {}),
      ...(meta?.photoURL ? { photoURL: meta.photoURL } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createUserProfile(
  userId: string,
  profile: UserProfile,
  meta: UserProfileMeta
): Promise<void> {
  const greetings = profile.greetings.map((g) => g.trim()).filter(Boolean);
  const finalGreetings =
    greetings.length > 0 ? greetings : DEFAULT_GREETINGS;

  await setDoc(doc(getFirebaseDb(), COLLECTION, userId), {
    name: profile.name.trim(),
    greetings: finalGreetings,
    goalTracks: profile.goalTracks ?? createDefaultGoalTracks(),
    email: meta.email,
    ...(meta.photoURL ? { photoURL: meta.photoURL } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function pickRotatingGreeting(
  userId: string,
  greetings: string[]
): string {
  const list = greetings.length > 0 ? greetings : DEFAULT_GREETINGS;
  const key = `greeting-index-${userId}`;
  const index = parseInt(sessionStorage.getItem(key) ?? "0", 10);
  const text = list[index % list.length];
  sessionStorage.setItem(key, String(index + 1));
  return text;
}

export { TRACK_COACH_ID, TRACK_WELLTHCOACH_ID };
