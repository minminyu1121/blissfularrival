"use client";

import { getHoursProgressPercent } from "@/lib/progress";
import {
  formatHours,
  getTaskHours,
  isLeafTask,
  type Task,
} from "@/lib/tasks";

interface TaskRowProps {
  task: Task;
  tasks: Task[];
  isPanelOpen?: boolean;
  childLevelLabel?: string;
  isAddingChild?: boolean;
  onAddChild?: () => void;
  onOpenPanel?: (id: string) => void;
  onToggleDone: (id: string) => void;
  onAdjustHours: (id: string, delta: number) => void;
}

const INDENT: Record<Task["level"], string> = {
  big: "pl-0",
  small: "pl-6",
  mini: "pl-12",
};

const ROW_GRID_BIG =
  "grid-cols-[minmax(0,1fr)_4.5rem_6.75rem]";
const ROW_GRID_NORM_DESKTOP =
  "md:grid-cols-[minmax(0,1fr)_21.78rem_4.5rem_6.75rem]";

export default function TaskRow({
  task,
  tasks,
  isPanelOpen = false,
  childLevelLabel,
  isAddingChild = false,
  onAddChild,
  onOpenPanel,
  onToggleDone,
  onAdjustHours,
}: TaskRowProps) {
  const hours = getTaskHours(task, tasks);
  const isLeaf = isLeafTask(task, tasks);
  const barPercent = getHoursProgressPercent(hours.completed, hours.required);
  const allDone = isLeaf ? task.done : getChildrenAllDone(task, tasks);
  const isBig = task.level === "big";
  const canHaveChild = childLevelLabel !== undefined;

  const rowClass = isBig
    ? ROW_GRID_BIG
    : `grid-cols-1 ${ROW_GRID_NORM_DESKTOP}`;

  return (
    <div
      className={`group grid items-center gap-x-2 gap-y-1 border-b border-border/40 py-1.5 ${rowClass} ${
        isPanelOpen || isAddingChild
          ? "bg-tag-sage/40"
          : "hover:bg-background/40"
      }`}
    >
      <div
        className={`flex min-w-0 items-center gap-1.5 overflow-hidden ${INDENT[task.level]}`}
      >
        {canHaveChild && (
          <button
            type="button"
            onClick={() => onAddChild?.()}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] transition-all ${
              isAddingChild
                ? "bg-tag-sage font-medium text-[#4a443c] ring-1 ring-sage/50"
                : "text-[#b5aea3] opacity-40 hover:bg-tag-sage hover:text-[#6b6358] group-hover:opacity-100"
            }`}
            aria-label={`新增${childLevelLabel}`}
            title={
              isAddingChild
                ? `關閉新增${childLevelLabel}`
                : `新增${childLevelLabel}`
            }
          >
            +
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            allDone
              ? "border-sage-dark bg-sage text-white"
              : "border-border bg-surface hover:border-[#b5aea3]"
          }`}
        >
          {allDone && (
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M2 6l3 3 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenPanel?.(task.id)}
          className={`min-w-0 flex-1 truncate text-left text-sm ${
            task.level === "big"
              ? "font-semibold text-[#4a443c]"
              : "text-[#6b6358]"
          } ${isPanelOpen ? "text-[#4a443c]" : "hover:text-[#4a443c]"}`}
          title={task.title || "點擊開啟待辦與備注"}
        >
          {task.title || (
            <span className="text-[#b5aea3]">點擊輸入任務名稱</span>
          )}
        </button>
      </div>

      {!isBig && (
        <div
          className={`@container/taskrow flex min-w-0 items-center gap-2 md:contents ${INDENT[task.level]}`}
        >
          <div className="progress-track h-1.5 min-w-0 flex-1 md:w-[21.78rem] md:max-w-full md:shrink-0 md:flex-none">
            <div
              className={`h-full rounded-full transition-all ${
                allDone || barPercent >= 100
                  ? "bg-sage"
                  : barPercent > 0
                    ? "bg-tan"
                    : "bg-transparent"
              }`}
              style={{ width: `${barPercent}%` }}
            />
          </div>

          <div className="taskrow-hide-hours shrink-0 whitespace-nowrap text-right text-xs text-[#9a9288]">
            {formatHours(hours.completed)}/{formatHours(hours.required)} 時
          </div>

          {isLeaf ? (
            <div className="flex shrink-0 gap-0.5">
              {[-1, -0.5, 0.5, 1].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => onAdjustHours(task.id, delta)}
                  className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-[10px] text-[#9a9288] hover:border-sage hover:bg-tag-sage hover:text-[#4a443c]"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden w-0 md:block" />
          )}
        </div>
      )}

      {isBig && (
        <>
          <div className="shrink-0 whitespace-nowrap text-right text-xs text-[#9a9288]">
            {formatHours(hours.completed)}/{formatHours(hours.required)} 時
          </div>
          <div className="w-0" />
        </>
      )}
    </div>
  );
}

function getChildrenAllDone(task: Task, tasks: Task[]): boolean {
  const children = tasks.filter((t) => t.parentId === task.id);
  if (children.length === 0) return task.done;
  return children.every((c) => getChildrenAllDone(c, tasks));
}
