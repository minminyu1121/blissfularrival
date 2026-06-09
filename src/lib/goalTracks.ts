import { DEFAULT_PROGRESS_GOAL } from "@/lib/progress";
import { getWeekKey, type Task, type WeeklyProgress } from "@/lib/tasks";

export interface GoalTrack {
  id: string;
  title: string;
  startDate: string;
  targetDate: string;
  tasks: Task[];
  weeklyProgress: WeeklyProgress;
  order: number;
}

export const TRACK_COACH_ID = "coach";
export const TRACK_WELLTHCOACH_ID = "wellthcoach";

export function createDefaultGoalTracks(): GoalTrack[] {
  const weekKey = getWeekKey();
  return [
    {
      id: TRACK_COACH_ID,
      title: DEFAULT_PROGRESS_GOAL.title,
      startDate: DEFAULT_PROGRESS_GOAL.startDate,
      targetDate: DEFAULT_PROGRESS_GOAL.targetDate,
      tasks: [],
      weeklyProgress: { weekKey, completedHours: 0 },
      order: 0,
    },
    {
      id: TRACK_WELLTHCOACH_ID,
      title: "上架WellthCoach",
      startDate: "2025-06-01",
      targetDate: "2026-12-01",
      tasks: [],
      weeklyProgress: { weekKey, completedHours: 0 },
      order: 1,
    },
  ];
}

export function parseTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => t as Record<string, unknown>)
    .filter((t) => typeof t.id === "string" && typeof t.title === "string")
    .map((t) => ({
      id: String(t.id),
      title: String(t.title),
      level: (["big", "small", "mini"].includes(String(t.level))
        ? t.level
        : "big") as Task["level"],
      parentId: typeof t.parentId === "string" ? t.parentId : null,
      requiredHours: Number(t.requiredHours) || 0,
      completedHours: Number(t.completedHours) || 0,
      done: Boolean(t.done),
      order: Number(t.order) || 0,
    }));
}

export function parseGoalTrack(raw: Record<string, unknown>): GoalTrack {
  const wp = raw.weeklyProgress as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    title: typeof raw.title === "string" ? raw.title : "",
    startDate:
      typeof raw.startDate === "string" ? raw.startDate : "2025-06-01",
    targetDate:
      typeof raw.targetDate === "string" ? raw.targetDate : "2027-06-01",
    tasks: parseTasks(raw.tasks),
    weeklyProgress: {
      weekKey:
        typeof wp?.weekKey === "string" ? wp.weekKey : getWeekKey(),
      completedHours: Number(wp?.completedHours) || 0,
    },
    order: Number(raw.order) || 0,
  };
}
