"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertTriangle, Clock, Globe, Mail, Calendar, Search, Cpu } from "lucide-react";

export interface Task {
  id: string;
  label: string;
  type: "booking" | "search" | "email" | "calendar" | "browse" | "custom";
  status: "pending" | "running" | "done" | "failed";
}

const TYPE_ICONS: Record<Task["type"], React.ReactNode> = {
  booking:  <Globe size={11} />,
  search:   <Search size={11} />,
  email:    <Mail size={11} />,
  calendar: <Calendar size={11} />,
  browse:   <Globe size={11} />,
  custom:   <Cpu size={11} />,
};

const STATUS_ICON = (s: Task["status"]) => {
  switch (s) {
    case "done":    return <CheckCircle2 size={11} style={{ color: "var(--emerald)" }} />;
    case "running": return <Loader2 size={11} style={{ color: "var(--indigo)", animation: "rotate-slow 1s linear infinite" }} />;
    case "failed":  return <AlertTriangle size={11} style={{ color: "var(--rose)" }} />;
    default:        return <Clock size={11} style={{ color: "var(--text-2)" }} />;
  }
};

export function TaskMonitor({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ flex: 1 }}>
      <AnimatePresence>
        {tasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
            style={{
              marginBottom: 4,
              background: task.status === "running" ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${task.status === "running" ? "rgba(99,102,241,0.18)" : "var(--border-subtle)"}`,
            }}
          >
            <span style={{ color: "var(--text-2)", flexShrink: 0 }}>{TYPE_ICONS[task.type]}</span>
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: 11, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                {task.label.length > 28 ? task.label.slice(0, 28) + "…" : task.label}
              </span>
              {task.status === "running" && (
                <div className="mt-1 rounded-full overflow-hidden" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--indigo)" }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
            {STATUS_ICON(task.status)}
          </motion.div>
        ))}
      </AnimatePresence>

      {tasks.length === 0 && (
        <p style={{ fontSize: 11, color: "var(--text-2)", textAlign: "center", padding: "12px 0" }}>
          No tasks queued
        </p>
      )}
    </div>
  );
}
