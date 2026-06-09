"use client";

import { useEffect, useRef, useState } from "react";
import { LEVEL_LABELS, type Task, type TaskLevel } from "@/lib/tasks";

interface AddTaskInlineProps {
  level: TaskLevel;
  onAdd: (task: Omit<Task, "id" | "order" | "done" | "completedHours">) => void;
  onCancel: () => void;
  parentId?: string | null;
  disabled?: boolean;
}

const INDENT: Record<TaskLevel, string> = {
  big: "pl-0",
  small: "pl-5",
  mini: "pl-10",
};

export default function AddTaskInline({
  level,
  onAdd,
  onCancel,
  parentId = null,
  disabled,
}: AddTaskInlineProps) {
  const [title, setTitle] = useState("");
  const [requiredHours, setRequiredHours] = useState("1");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("請輸入任務名稱");
      return;
    }
    const hours = parseFloat(requiredHours);
    if (isNaN(hours) || hours <= 0) {
      setError("請輸入有效的所需時數");
      return;
    }

    onAdd({
      title: title.trim(),
      level,
      parentId: level === "big" ? null : parentId,
      requiredHours: hours,
    });
  };

  return (
    <div
      className={`border-b border-border/50 py-3 ${INDENT[level]}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-[#9e9e9e]">
          新增{LEVEL_LABELS[level]}
        </span>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="任務名稱"
          disabled={disabled}
          className="focus-accent min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-[#4a443c] placeholder:text-[#b5aea3]"
        />
        <div className="flex shrink-0 items-center gap-1">
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={requiredHours}
            onChange={(e) => {
              setRequiredHours(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={disabled}
            className="input-number-plain focus-accent w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-[#4a443c]"
            aria-label="需完成時數"
          />
          <span className="text-xs text-[#9e9e9e]">時</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="shrink-0 rounded-lg bg-accent-gradient px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          新增
        </button>
        <button
          onClick={onCancel}
          disabled={disabled}
          className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-[#9a9288] hover:bg-surface-inactive hover:text-[#4a443c]"
        >
          取消
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
