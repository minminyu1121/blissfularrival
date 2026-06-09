export type TaskLevel = "big" | "small" | "mini";

export interface TaskTodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface TaskNoteItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  level: TaskLevel;
  parentId: string | null;
  requiredHours: number;
  completedHours: number;
  done: boolean;
  order: number;
  todos: TaskTodoItem[];
  archivedTodos: TaskTodoItem[];
  notes: TaskNoteItem[];
}

export function getTodayDateString(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseTaskTodoItems(raw: unknown): TaskTodoItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => item as Record<string, unknown>)
    .filter((item) => typeof item.id === "string")
    .map((item) => ({
      id: String(item.id),
      text: typeof item.text === "string" ? item.text : "",
      done: Boolean(item.done),
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : getTodayDateString(),
      completedAt:
        typeof item.completedAt === "string" ? item.completedAt : undefined,
    }));
}

export function parseTaskNoteItems(raw: unknown): TaskNoteItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => item as Record<string, unknown>)
    .filter((item) => typeof item.id === "string")
    .map((item) => ({
      id: String(item.id),
      text: typeof item.text === "string" ? item.text : "",
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : getTodayDateString(),
    }));
}

export function createEmptyTaskExtras(): Pick<
  Task,
  "todos" | "archivedTodos" | "notes"
> {
  return { todos: [], archivedTodos: [], notes: [] };
}

export interface WeeklyProgress {
  weekKey: string;
  completedHours: number;
}

export interface TaskHours {
  required: number;
  completed: number;
}

export const DEFAULT_WEEKLY_HOUR_GOAL = 15;

export function getWeekKey(now = new Date()): string {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function getChildren(tasks: Task[], parentId: string): Task[] {
  return tasks
    .filter((t) => t.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

export function getRootTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => !t.parentId)
    .sort((a, b) => a.order - b.order);
}

// 葉節點用自身時數；有子任務則累加下層
export function getTaskHours(task: Task, tasks: Task[]): TaskHours {
  const children = getChildren(tasks, task.id);
  if (children.length === 0) {
    return {
      required: task.requiredHours,
      completed: task.completedHours,
    };
  }
  return children.reduce(
    (acc, child) => {
      const h = getTaskHours(child, tasks);
      return {
        required: acc.required + h.required,
        completed: acc.completed + h.completed,
      };
    },
    { required: 0, completed: 0 }
  );
}

export function isLeafTask(task: Task, tasks: Task[]): boolean {
  return getChildren(tasks, task.id).length === 0;
}

export function getTotalHours(tasks: Task[]): TaskHours {
  return getRootTasks(tasks).reduce(
    (acc, task) => {
      const h = getTaskHours(task, tasks);
      return {
        required: acc.required + h.required,
        completed: acc.completed + h.completed,
      };
    },
    { required: 0, completed: 0 }
  );
}

export function getWeeklyCompletedHours(
  weeklyProgress: WeeklyProgress | undefined,
  now = new Date()
): number {
  const key = getWeekKey(now);
  if (!weeklyProgress || weeklyProgress.weekKey !== key) return 0;
  return weeklyProgress.completedHours;
}

export function flattenTaskTree(tasks: Task[]): Task[] {
  const result: Task[] = [];
  const walk = (parentId: string | null) => {
    const nodes = parentId
      ? getChildren(tasks, parentId)
      : getRootTasks(tasks);
    for (const node of nodes) {
      result.push(node);
      walk(node.id);
    }
  };
  walk(null);
  return result;
}

export const LEVEL_LABELS: Record<TaskLevel, string> = {
  big: "大任務",
  small: "小任務",
  mini: "迷你任務",
};

export function getParentLevel(level: TaskLevel): TaskLevel | null {
  if (level === "small") return "big";
  if (level === "mini") return "small";
  return null;
}

export function getSiblingTasks(tasks: Task[], task: Task): Task[] {
  return tasks
    .filter((t) => t.parentId === task.parentId)
    .sort((a, b) => a.order - b.order);
}

// 將任務調整至同層的指定順序（1-based，最多 10）
export function setTaskSiblingOrder(
  tasks: Task[],
  taskId: string,
  targetPosition: number
): Task[] | null {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const siblings = getSiblingTasks(tasks, task);
  const clamped = Math.min(
    siblings.length,
    Math.max(1, Math.min(10, Math.round(targetPosition)))
  );
  const fromIndex = siblings.findIndex((t) => t.id === taskId);
  const toIndex = clamped - 1;
  if (fromIndex < 0 || fromIndex === toIndex) return null;

  const reordered = [...siblings];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const orderMap = new Map(reordered.map((t, i) => [t.id, i]));
  return tasks.map((t) =>
    orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t
  );
}

// 在同層兄弟任務間上移／下移
export function reorderTask(
  tasks: Task[],
  taskId: string,
  direction: "up" | "down"
): Task[] | null {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const siblings = getSiblingTasks(tasks, task);
  const index = siblings.findIndex((t) => t.id === taskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return null;

  const other = siblings[swapIndex];
  return tasks.map((t) => {
    if (t.id === task.id) return { ...t, order: other.order };
    if (t.id === other.id) return { ...t, order: task.order };
    return t;
  });
}
