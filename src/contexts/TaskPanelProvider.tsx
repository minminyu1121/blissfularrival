"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface TaskPanelSelection {
  trackId: string;
  taskId: string;
}

interface TaskPanelContextType {
  selection: TaskPanelSelection | null;
  openTaskPanel: (trackId: string, taskId: string) => void;
  closeTaskPanel: () => void;
  toggleTaskPanel: (trackId: string, taskId: string) => void;
  isTaskPanelOpen: (trackId: string, taskId: string) => boolean;
}

const TaskPanelContext = createContext<TaskPanelContextType | undefined>(
  undefined
);

export function TaskPanelProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<TaskPanelSelection | null>(null);

  const openTaskPanel = useCallback((trackId: string, taskId: string) => {
    setSelection({ trackId, taskId });
  }, []);

  const closeTaskPanel = useCallback(() => {
    setSelection(null);
  }, []);

  const toggleTaskPanel = useCallback((trackId: string, taskId: string) => {
    setSelection((prev) =>
      prev?.trackId === trackId && prev?.taskId === taskId
        ? null
        : { trackId, taskId }
    );
  }, []);

  const isTaskPanelOpen = useCallback(
    (trackId: string, taskId: string) =>
      selection?.trackId === trackId && selection?.taskId === taskId,
    [selection]
  );

  return (
    <TaskPanelContext.Provider
      value={{
        selection,
        openTaskPanel,
        closeTaskPanel,
        toggleTaskPanel,
        isTaskPanelOpen,
      }}
    >
      {children}
    </TaskPanelContext.Provider>
  );
}

export function useTaskPanel() {
  const context = useContext(TaskPanelContext);
  if (!context) {
    throw new Error("useTaskPanel 必須在 TaskPanelProvider 內使用");
  }
  return context;
}
