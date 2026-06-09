"use client";

import { useEffect, useState } from "react";
import { useTaskPanel } from "@/contexts/TaskPanelProvider";
import TaskSidePanel, {
  resolvePanelWidth,
} from "@/components/tasks/TaskSidePanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { selection } = useTaskPanel();
  const [panelWidth, setPanelWidth] = useState(0);

  useEffect(() => {
    const update = () => setPanelWidth(resolvePanelWidth());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <TaskSidePanel panelWidth={panelWidth} />
      <main
        className="min-h-0 min-w-0 flex-1 overflow-y-auto transition-[margin-left] duration-200 ease-out"
        style={{ marginLeft: selection ? panelWidth : 0 }}
      >
        {children}
      </main>
    </>
  );
}
