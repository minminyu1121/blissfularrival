"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTaskPanel } from "@/contexts/TaskPanelProvider";
import { useUserProfile } from "@/contexts/UserProfileProvider";
import { formatDateZh } from "@/lib/progress";
import {
  getTodayDateString,
  type Task,
} from "@/lib/tasks";

const PANEL_WIDTH_RATIO = 0.4;

/** 面板固定佔視窗 40% */
export function resolvePanelWidth(viewportWidth?: number) {
  const vw =
    viewportWidth ??
    (typeof window !== "undefined" ? window.innerWidth : 0);
  return Math.floor(vw * PANEL_WIDTH_RATIO);
}

interface TaskSidePanelProps {
  panelWidth: number;
}

export default function TaskSidePanel({ panelWidth }: TaskSidePanelProps) {
  const { selection, closeTaskPanel } = useTaskPanel();
  const { profile, saving, updateGoalTrack } = useUserProfile();
  const [titleDraft, setTitleDraft] = useState("");
  const [todoDraft, setTodoDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const track = selection
    ? profile.goalTracks.find((t) => t.id === selection.trackId)
    : null;
  const task = track?.tasks.find((t) => t.id === selection?.taskId) ?? null;

  useEffect(() => {
    if (task) setTitleDraft(task.title);
    setTodoDraft("");
    setNoteDraft("");
    setShowArchived(false);
    setDeleteConfirming(false);
  }, [selection?.trackId, selection?.taskId, task?.title]);

  if (!selection || !track || !task) return null;

  const persistTask = async (nextTask: Task) => {
    await updateGoalTrack(track.id, {
      tasks: track.tasks.map((t) => (t.id === task.id ? nextTask : t)),
    });
  };

  const handleAddTodo = async () => {
    const text = todoDraft.trim();
    if (!text) return;

    await persistTask({
      ...task,
      todos: [
        {
          id: crypto.randomUUID(),
          text,
          done: false,
          createdAt: getTodayDateString(),
        },
        ...task.todos,
      ],
    });
    setTodoDraft("");
  };

  const handleToggleTodo = async (todoId: string) => {
    const target = task.todos.find((t) => t.id === todoId);
    if (!target) return;

    await persistTask({
      ...task,
      todos: task.todos.filter((t) => t.id !== todoId),
      archivedTodos: [
        {
          ...target,
          done: true,
          completedAt: getTodayDateString(),
        },
        ...task.archivedTodos,
      ],
    });
  };

  const handleUpdateTodoText = async (todoId: string, text: string) => {
    await persistTask({
      ...task,
      todos: task.todos.map((t) =>
        t.id === todoId ? { ...t, text: text.trim() } : t
      ),
    });
  };

  const handleAddNote = async () => {
    const text = noteDraft.trim();
    if (!text) return;

    await persistTask({
      ...task,
      notes: [
        {
          id: crypto.randomUUID(),
          text,
          createdAt: getTodayDateString(),
        },
        ...task.notes,
      ],
    });
    setNoteDraft("");
  };

  const handleUpdateNoteText = async (noteId: string, text: string) => {
    await persistTask({
      ...task,
      notes: task.notes.map((n) =>
        n.id === noteId ? { ...n, text: text.trim() } : n
      ),
    });
  };

  const handleSaveTitle = async () => {
    const next = titleDraft.trim();
    if (!next || next === task.title) {
      setTitleDraft(task.title);
      return;
    }
    await persistTask({ ...task, title: next });
  };

  const handleDeleteTask = async () => {
    const toDelete = new Set<string>();
    const collect = (tid: string) => {
      toDelete.add(tid);
      track.tasks
        .filter((t) => t.parentId === tid)
        .forEach((c) => collect(c.id));
    };
    collect(task.id);

    closeTaskPanel();
    await updateGoalTrack(track.id, {
      tasks: track.tasks.filter((t) => !toDelete.has(t.id)),
    });
  };

  return (
    <aside
      style={{ width: panelWidth }}
      className="fixed left-0 top-14 z-30 flex h-[calc(100dvh-3.5rem)] flex-col border-r border-border/60 bg-surface shadow-lg"
    >
      {/* 任務設定 */}
      <div className="shrink-0 border-b border-border/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => void handleSaveTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="任務名稱"
            disabled={saving}
            className="focus-accent min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-[#4a443c] outline-none placeholder:text-[#b5aea3]"
          />
          <div className="flex shrink-0 items-center gap-2">
            {deleteConfirming ? (
              <button
                type="button"
                onClick={() => void handleDeleteTask()}
                disabled={saving}
                className="text-[11px] text-coral hover:text-coral/80 disabled:opacity-40"
              >
                確定
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirming(true)}
                disabled={saving}
                className="text-[11px] text-[#b5aea3] hover:text-coral disabled:opacity-40"
              >
                刪除
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDeleteConfirming(false);
                closeTaskPanel();
              }}
              className="text-[11px] text-[#b5aea3] hover:text-[#6b6358]"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* 筆電及以下：待辦上、備注下；超大螢幕（2xl+）：左備注、右待辦 */}
      <div className="flex min-h-0 flex-1 flex-col 2xl:flex-row">
        <section className="order-1 flex min-h-0 min-w-0 flex-1 flex-col 2xl:order-2">
          <p className="shrink-0 px-3 pt-2 text-[11px] text-[#b5aea3]">待辦</p>

          <div className="shrink-0 px-3 py-1">
            <input
              value={todoDraft}
              onChange={(e) => setTodoDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddTodo();
                }
              }}
              placeholder="＋ 輸入後按 Enter"
              disabled={saving}
              className="focus-accent w-full border-0 border-b border-border/50 bg-transparent py-1.5 text-xs text-[#4a443c] outline-none placeholder:text-[#b5aea3]"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {task.todos.length === 0 ? (
              <p className="py-2 text-[11px] text-[#b5aea3]">—</p>
            ) : (
              <ul>
                {task.todos.map((todo) => (
                  <ItemRow
                    key={todo.id}
                    date={todo.createdAt}
                    text={todo.text}
                    onTextChange={(text) =>
                      void handleUpdateTodoText(todo.id, text)
                    }
                    leading={
                      <button
                        type="button"
                        onClick={() => void handleToggleTodo(todo.id)}
                        className="mt-1 flex h-3.5 w-3.5 shrink-0 rounded-sm border border-border/80 hover:border-sage"
                        aria-label="完成"
                      />
                    }
                  />
                ))}
              </ul>
            )}

            {task.archivedTodos.length > 0 && (
              <div className="mt-2 border-t border-border/30 pt-1">
                <button
                  type="button"
                  onClick={() => setShowArchived((p) => !p)}
                  className="text-[11px] text-[#b5aea3] hover:text-[#9a9288]"
                >
                  封存 {task.archivedTodos.length}
                  {showArchived ? " ↑" : " ↓"}
                </button>
                {showArchived && (
                  <ul className="mt-1">
                    {task.archivedTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="border-b border-border/20 py-1.5 text-xs text-[#b5aea3] line-through"
                      >
                        <span className="mr-1.5 text-[10px] no-underline">
                          {formatDateZh(todo.createdAt)}
                        </span>
                        {todo.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="order-2 flex min-h-0 min-w-0 flex-1 flex-col border-t border-border/40 2xl:order-1 2xl:border-t-0 2xl:border-r">
          <p className="shrink-0 px-3 pt-2 text-[11px] text-[#b5aea3]">備注</p>

          <div className="shrink-0 px-3 py-1">
            <input
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddNote();
                }
              }}
              placeholder="＋ 輸入後按 Enter"
              disabled={saving}
              className="focus-accent w-full border-0 border-b border-border/50 bg-transparent py-1.5 text-xs text-[#4a443c] outline-none placeholder:text-[#b5aea3]"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {task.notes.length === 0 ? (
              <p className="py-2 text-[11px] text-[#b5aea3]">—</p>
            ) : (
              <ul>
                {task.notes.map((note) => (
                  <ItemRow
                    key={note.id}
                    date={note.createdAt}
                    text={note.text}
                    onTextChange={(text) =>
                      void handleUpdateNoteText(note.id, text)
                    }
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

function ItemRow({
  date,
  text,
  onTextChange,
  leading,
}: {
  date: string;
  text: string;
  onTextChange: (text: string) => void;
  leading?: ReactNode;
}) {
  const [draft, setDraft] = useState(text);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  return (
    <li className="flex items-start gap-2 border-b border-border/20 py-1.5">
      {leading}
      <span className="shrink-0 pt-px text-[10px] text-[#b5aea3]">
        {formatDateZh(date)}
      </span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== text) onTextChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-xs text-[#4a443c] outline-none"
      />
    </li>
  );
}
