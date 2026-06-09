"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import type { GoalTrack } from "@/lib/goalTracks";
import {
  LEVEL_LABELS,
  flattenTaskTree,
  getSiblingTasks,
  getWeekKey,
  reorderTask,
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
  const [addDraft, setAddDraft] = useState<AddDraft | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = track.tasks;

  const openAddDraft = (level: TaskLevel, parentId: string | null = null) => {
    setAddDraft((prev) =>
      prev?.level === level && prev?.parentId === parentId
        ? null
        : { level, parentId }
    );
  };

  const closeAddDraft = () => setAddDraft(null);

  const handleSelectTask = (id: string) => {
    setSelectedTaskId((prev) => (prev === id ? null : id));
  };

  const handleAdd = async (
    input: Omit<Task, "id" | "order" | "done" | "completedHours">
  ) => {
    const siblings = tasks.filter((t) => t.parentId === input.parentId);
    const newTask: Task = {
      ...input,
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

  const handleUpdateTitle = async (id: string, title: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, title } : t));
    await updateGoalTrack(track.id, { tasks: updated });
  };

  const handleUpdateRequiredHours = async (id: string, requiredHours: number) => {
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        requiredHours,
        done: requiredHours > 0 && t.completedHours >= requiredHours,
      };
    });
    await updateGoalTrack(track.id, { tasks: updated });
  };

  const handleMoveTask = async (id: string, direction: "up" | "down") => {
    const reordered = reorderTask(tasks, id, direction);
    if (!reordered) return;
    await updateGoalTrack(track.id, { tasks: reordered });
  };

  const handleDelete = async (id: string) => {
    const toDelete = new Set<string>();
    const collect = (tid: string) => {
      toDelete.add(tid);
      tasks.filter((t) => t.parentId === tid).forEach((c) => collect(c.id));
    };
    collect(id);
    if (selectedTaskId && toDelete.has(selectedTaskId)) {
      setSelectedTaskId(null);
    }
    await updateGoalTrack(track.id, {
      tasks: tasks.filter((t) => !toDelete.has(t.id)),
    });
  };

  const flatTasks = flattenTaskTree(tasks);
  const isAddingBig =
    addDraft?.level === "big" && addDraft.parentId === null;

  const wrapperClass = embedded
    ? "border-t border-border/50 px-6 pb-4 pt-3"
    : "mt-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border";

  return (
    <div className={wrapperClass}>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-[#4a443c]">所有任務</h3>
        <button
          onClick={() => openAddDraft("big")}
          disabled={saving}
          className="rounded-lg border border-border bg-tag-sage px-3 py-1.5 text-xs font-medium text-[#6b6358] hover:bg-surface-tan hover:text-[#4a443c]"
        >
          + {LEVEL_LABELS.big}
        </button>
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
          尚無任務，點「+ 大任務」開始建立
        </p>
      ) : (
        <div>
          {flatTasks.map((task) => {
            const childLevel = CHILD_LEVEL[task.level];
            const showAddChild =
              selectedTaskId === task.id && childLevel !== undefined;
            const isAddingChild =
              addDraft?.parentId === task.id &&
              addDraft.level === childLevel;
            const siblings = getSiblingTasks(tasks, task);
            const siblingIndex = siblings.findIndex((t) => t.id === task.id);

            return (
              <div key={task.id}>
                <TaskRow
                  task={task}
                  tasks={tasks}
                  isSelected={selectedTaskId === task.id}
                  canMoveUp={siblingIndex > 0}
                  canMoveDown={siblingIndex < siblings.length - 1}
                  onSelect={handleSelectTask}
                  onToggleDone={handleToggleDone}
                  onAdjustHours={handleAdjustHours}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateRequiredHours={handleUpdateRequiredHours}
                  onMove={handleMoveTask}
                  onDelete={handleDelete}
                />
                {showAddChild && (
                  <div className={ADD_CHILD_INDENT[task.level]}>
                    {isAddingChild ? (
                      <AddTaskInline
                        level={childLevel}
                        parentId={task.id}
                        disabled={saving}
                        onAdd={handleAdd}
                        onCancel={closeAddDraft}
                      />
                    ) : (
                      <div className="border-b border-border/50 py-1">
                        <button
                          onClick={() => openAddDraft(childLevel, task.id)}
                          disabled={saving}
                          className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-[#9a9288] hover:border-sage hover:bg-tag-sage hover:text-[#4a443c]"
                        >
                          + {LEVEL_LABELS[childLevel]}
                        </button>
                      </div>
                    )}
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
