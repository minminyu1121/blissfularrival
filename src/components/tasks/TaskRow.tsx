"use client";

import { useEffect, useState } from "react";
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
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onToggleDone: (id: string) => void;
  onAdjustHours: (id: string, delta: number) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateRequiredHours: (id: string, requiredHours: number) => void;
  onDelete: (id: string) => void;
}

const INDENT: Record<Task["level"], string> = {
  big: "pl-0",
  small: "pl-6",
  mini: "pl-12",
};

export default function TaskRow({
  task,
  tasks,
  isSelected = false,
  onSelect,
  onToggleDone,
  onAdjustHours,
  onUpdateTitle,
  onUpdateRequiredHours,
  onDelete,
}: TaskRowProps) {
  const [title, setTitle] = useState(task.title);
  const [requiredDraft, setRequiredDraft] = useState(String(task.requiredHours));
  const hours = getTaskHours(task, tasks);
  const isLeaf = isLeafTask(task, tasks);
  const barPercent = getHoursProgressPercent(hours.completed, hours.required);
  const allDone = isLeaf ? task.done : getChildrenAllDone(task, tasks);
  const isBig = task.level === "big";

  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    setRequiredDraft(String(task.requiredHours));
  }, [task.requiredHours]);

  const saveRequiredHours = () => {
    const parsed = parseFloat(requiredDraft);
    if (isNaN(parsed) || parsed <= 0) {
      setRequiredDraft(String(task.requiredHours));
      return;
    }
    if (parsed !== task.requiredHours) {
      onUpdateRequiredHours(task.id, parsed);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(task.id);
        }
      }}
      className={`group grid cursor-pointer items-center gap-x-3 border-b border-border/40 py-2.5 transition-colors ${
        isBig
          ? "grid-cols-[minmax(0,1fr)_4.5rem_6.75rem_1.5rem]"
          : "grid-cols-[minmax(0,11rem)_minmax(0,1fr)_4.5rem_6.75rem_1.5rem]"
      } ${isSelected ? "bg-tag-sage/70" : "hover:bg-background/60"}`}
    >
      <div className={`flex min-w-0 items-center gap-2 ${INDENT[task.level]}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(task.id);
          }}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            allDone
              ? "border-sage-dark bg-sage text-white"
              : "border-border bg-surface hover:border-[#b5aea3]"
          }`}
        >
          {allDone && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <input
          value={title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== task.title) onUpdateTitle(task.id, title);
          }}
          className={`min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#b5aea3] ${
            task.level === "big"
              ? "font-semibold text-[#4a443c]"
              : "text-[#6b6358]"
          }`}
          placeholder="任務名稱"
        />
      </div>

      {!isBig && (
        <div className="progress-track h-1.5 w-full min-w-0">
          <div
            className={`h-full rounded-full transition-all ${
              allDone || barPercent >= 100 ? "bg-sage" : barPercent > 0 ? "bg-tan" : "bg-transparent"
            }`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}

      {/* 點選葉節點任務可編輯所需時數 */}
      <div
        className="flex items-center justify-end gap-0.5 text-xs text-[#9a9288]"
        onClick={(e) => e.stopPropagation()}
      >
        <span>{formatHours(hours.completed)}/</span>
        {isSelected && isLeaf ? (
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={requiredDraft}
            onChange={(e) => setRequiredDraft(e.target.value)}
            onBlur={saveRequiredHours}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveRequiredHours();
              }
            }}
            className="input-number-plain focus-accent w-12 rounded border border-sage bg-surface px-1 py-0.5 text-right text-xs text-[#4a443c]"
            aria-label="所需時數"
          />
        ) : (
          <span>{formatHours(hours.required)}</span>
        )}
        <span>時</span>
      </div>

      {isLeaf ? (
        <div className="flex gap-0.5">
          {[-1, -0.5, 0.5, 1].map((delta) => (
            <button
              key={delta}
              onClick={(e) => {
                e.stopPropagation();
                onAdjustHours(task.id, delta);
              }}
              className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-[10px] text-[#9a9288] hover:border-sage hover:bg-tag-sage hover:text-[#4a443c]"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      ) : (
        <div />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="rounded p-1 text-[#b5aea3] opacity-0 transition-opacity hover:text-coral group-hover:opacity-100"
        title="刪除"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function getChildrenAllDone(task: Task, tasks: Task[]): boolean {
  const children = tasks.filter((t) => t.parentId === task.id);
  if (children.length === 0) return task.done;
  return children.every((c) => getChildrenAllDone(c, tasks));
}
