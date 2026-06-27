"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Cpu, Globe, Terminal, Activity } from "lucide-react";

export type LogType = "heard" | "think" | "action" | "result" | "error" | "system";

export interface LogEntry {
  id:        string;
  type:      LogType;
  text:      string;
  timestamp: string;
  meta?:     string;
}

const CFG: Record<LogType, { label: string; color: string; cls: string; icon: React.ReactNode }> = {
  heard:  { label: "HEARD",  color: "var(--cyan)",    cls: "log-heard",  icon: <Mic      size={10} /> },
  think:  { label: "THINK",  color: "var(--violet)",  cls: "log-think",  icon: <Cpu      size={10} /> },
  action: { label: "ACTION", color: "var(--indigo)",  cls: "log-action", icon: <Globe    size={10} /> },
  result: { label: "RESULT", color: "var(--emerald)", cls: "log-result", icon: <Activity size={10} /> },
  error:  { label: "ERROR",  color: "var(--rose)",    cls: "log-error",  icon: <Terminal size={10} /> },
  system: { label: "SYS",    color: "var(--text-2)",  cls: "log-system", icon: <Terminal size={10} /> },
};

export function LiveFeed({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
        <Terminal size={20} style={{ color: "var(--text-3)" }} />
        <p style={{ fontSize: 12, color: "var(--text-2)" }}>Awaiting agent activity…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <AnimatePresence initial={false}>
        {logs.map((log) => {
          const cfg = CFG[log.type];
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cfg.cls}
              style={{ display: "flex", gap: 10, padding: "9px 12px", borderRadius: 10 }}
            >
              {/* Icon */}
              <span style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }}>{cfg.icon}</span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 2 }}>
                  <span className="font-mono" style={{ fontSize: 9, fontWeight: 700, color: cfg.color, letterSpacing: "0.08em" }}>
                    {cfg.label}
                  </span>
                  {log.meta && (
                    <span className="font-mono" style={{ fontSize: 9, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.meta}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.55 }}>{log.text}</p>
              </div>

              {/* Timestamp */}
              <span className="font-mono" style={{ fontSize: 9, color: "var(--text-2)", flexShrink: 0, marginTop: 2 }}>
                {log.timestamp}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
