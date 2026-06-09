"use client";

import { useState } from "react";
import { useTaskPanel } from "@/contexts/TaskPanelProvider";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import type { GoalTrack } from "@/lib/goalTracks";
import {
  LEVEL_LABELS,
  flattenTaskTree,
  createEmptyTaskExtras,
  getWeekKey,
  type Task,
  type TaskLevel,
} from "@/lib/tasks";
import AddTaskInline from "@/components/tasks/AddTaskInline";
import TaskRow from "@/components/tasks/TaskRow";

interface TaskAreaProps {
  track: GoalTrack;
  embedded?: boolean;
}

const CHILD_LEVEL: Partial<Record<TaskLevel, TaskLevel>> = {
  big: "small",
  small: "mini",
};

const ADD_CHILD_INDENT: Partial<Record<TaskLevel, string>> = {
  big: "pl-6",
  small: "pl-12",
};

interface AddDraft {
  level: TaskLevel;
  parentId: string | null;
}

export default function TaskArea({ track, embedded }: TaskAreaProps) {
  const { saving, updateGoalTrack } = useUserProfile();
  const { toggleTaskPanel, isTaskPanelOpen } = useTaskPanel();
  const [addDraft, setAddDraft] = useState<AddDraft | null>(null);
  const [headerSelected, setHeaderSelected] = useState(false);

  const tasks = track.tasks;

  const openAddDraft = (level: TaskLevel, parentId: string | null = null) => {
    setAddDraft((prev) =>
      prev?.level === level && prev?.parentId === parentId
        ? null
        : { level, parentId }
    );
  };

  const closeAddDraft = () => setAddDraft(null);

  /** 點勾選框左側「+」：直接開啟／關閉子任務新增 */
  const handleAddChildClick = (taskId: string, level: TaskLevel) => {
    const isOpen =
      addDraft?.parentId === taskId && addDraft.level === level;
    if (isOpen) {
      closeAddDraft();
    } else {
      openAddDraft(level, taskId);
    }
  };

  const handleOpenPanel = (id: string) => {
    toggleTaskPanel(track.id, id);
  };

  const isPanelOpen = (id: string) => isTaskPanelOpen(track.id, id);

  const handleAdd = async (
    input: Omit<
      Task,
      "id" | "order" | "done" | "completedHours" | "todos" | "archivedTodos" | "notes"
    >
  ) => {
    const siblings = tasks.filter((t) => t.parentId === input.parentId);
    const newTask: Task = {
      ...input,
      ...createEmptyTaskExtras(),
      id: crypto.randomUUID(),
      completedHours: 0,
      done: false,
      order: siblings.length,
    };
    await updateGoalTrack(track.id, { tasks: [...tasks, newTask] });
    closeAddDraft();
  };

  const handleToggleDone = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const hasChildren = tasks.some((t) => t.parentId === id);
    const nextDone = hasChildren
      ? !getSubtreeDone(tasks, id)
      : !task.done;

    const updated = tasks.map((t) => {
      if (t.id === id) return { ...t, done: nextDone };
      if (hasChildren && isDescendant(tasks, id, t.id)) {
        return { ...t, done: nextDone };
      }
      return t;
    });

    await updateGoalTrack(track.id, { tasks: updated });
  };

  const handleAdjustHours = async (id: string, delta: number) => {
    const weekKey = getWeekKey();
    let weekAdded = 0;

    const updatedTasks = tasks.map((t) => {
      if (t.id !== id) return t;
      const prev = t.completedHours;
      const next = Math.max(0, t.completedHours + delta);
      weekAdded = next - prev;
      return {
        ...t,
        done: t.requiredHours > 0 && next >= t.requiredHours,
        completedHours: next,
      };
    });

    let weeklyProgress = { ...track.weeklyProgress };
    if (weeklyProgress.weekKey !== weekKey) {
      weeklyProgress = { weekKey, completedHours: 0 };
    }
    weeklyProgress.completedHours = Math.max(
      0,
      weeklyProgress.completedHours + weekAdded
    );

    await updateGoalTrack(track.id, {
      tasks: updatedTasks,
      weeklyProgress,
    });
  };

  const flatTasks = flattenTaskTree(tasks);
  const isAddingBig =
    addDraft?.level === "big" && addDraft.parentId === null;

  const wrapperClass = embedded
    ? "border-t border-border/50 px-3 pb-4 pt-3 sm:px-6"
    : "mt-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border sm:p-6";

  return (
    <div className={wrapperClass}>
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setHeaderSelected((prev) => !prev)}
          className="text-xs font-medium text-[#b5aea3] hover:text-[#9a9288]"
        >
          所有任務
        </button>
        {headerSelected && (
          <button
            onClick={() => openAddDraft("big")}
            disabled={saving}
            className="rounded-lg border border-border bg-tag-sage px-3 py-1.5 text-xs font-medium text-[#6b6358] hover:bg-surface-tan hover:text-[#4a443c]"
          >
            + {LEVEL_LABELS.big}
          </button>
        )}
      </div>

      {isAddingBig && (
        <AddTaskInline
          level="big"
          disabled={saving}
          onAdd={handleAdd}
          onCancel={closeAddDraft}
        />
      )}

      {flatTasks.length === 0 && !isAddingBig ? (
        <p className="py-6 text-center text-sm text-[#b5aea3]">
          尚無任務，點「所有任務」開始建立
        </p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          {flatTasks.map((task) => {
            const childLevel = CHILD_LEVEL[task.level];
            const isAddingChild =
              childLevel !== undefined &&
              addDraft?.parentId === task.id &&
              addDraft.level === childLevel;
            return (
              <div key={task.id}>
                <TaskRow
                  task={task}
                  tasks={tasks}
                  isPanelOpen={isPanelOpen(task.id)}
                  childLevelLabel={
                    childLevel ? LEVEL_LABELS[childLevel] : undefined
                  }
                  isAddingChild={isAddingChild}
                  onAddChild={
                    childLevel
                      ? () => handleAddChildClick(task.id, childLevel)
                      : undefined
                  }
                  onOpenPanel={handleOpenPanel}
                  onToggleDone={handleToggleDone}
                  onAdjustHours={handleAdjustHours}
                />
                {isAddingChild && (
                  <div className={ADD_CHILD_INDENT[task.level]}>
                    <AddTaskInline
                      level={childLevel}
                      parentId={task.id}
                      disabled={saving}
                      onAdd={handleAdd}
                      onCancel={closeAddDraft}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getSubtreeDone(tasks: Task[], id: string): boolean {
  const task = tasks.find((t) => t.id === id);
  if (!task) return false;
  const children = tasks.filter((t) => t.parentId === id);
  if (children.length === 0) return task.done;
  return children.every((c) => getSubtreeDone(tasks, c.id));
}

function isDescendant(
  tasks: Task[],
  ancestorId: string,
  id: string
): boolean {
  let current = tasks.find((t) => t.id === id);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = tasks.find((t) => t.id === current!.parentId);
  }
  return false;
}
