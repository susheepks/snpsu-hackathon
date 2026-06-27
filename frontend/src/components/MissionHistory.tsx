"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, AlertTriangle, XCircle, Clock, ChevronRight
} from "lucide-react";

export type MissionStatus = "success" | "active" | "clarify" | "failed" | "pending";

export interface Mission {
  id: string;
  title: string;
  intent: string;
  status: MissionStatus;
  time: string;
  duration?: string;
}

const StatusIcon = ({ status }: { status: MissionStatus }) => {
  switch (status) {
    case "success":  return <CheckCircle2 size={13} className="text-emerald-400" />;
    case "active":   return <Loader2 size={13} className="text-blue-400 animate-spin" />;
    case "clarify":  return <AlertTriangle size={13} className="text-amber-400" />;
    case "failed":   return <XCircle size={13} className="text-red-400" />;
    default:         return <Clock size={13} className="text-gray-500" />;
  }
};

const statusPip = (status: MissionStatus) => {
  const base = "w-2 h-2 rounded-full flex-shrink-0";
  switch (status) {
    case "success": return `${base} bg-emerald-400 pip-success`;
    case "active":  return `${base} bg-blue-400 pip-active`;
    case "clarify": return `${base} bg-amber-400 pip-clarify`;
    case "failed":  return `${base} bg-red-400`;
    default:        return `${base} bg-gray-600`;
  }
};

const labelColors: Record<MissionStatus, string> = {
  success: "text-emerald-400 bg-emerald-400/10",
  active:  "text-blue-400 bg-blue-400/10",
  clarify: "text-amber-400 bg-amber-400/10",
  failed:  "text-red-400 bg-red-400/10",
  pending: "text-gray-500 bg-gray-500/10",
};

interface MissionHistoryProps {
  missions: Mission[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function MissionHistory({ missions, selectedId, onSelect }: MissionHistoryProps) {
  return (
    <aside
      className="glass-card flex flex-col rounded-2xl overflow-hidden"
      style={{ width: 240, minWidth: 220, maxWidth: 260, height: "100%" }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Mission History
          </h2>
        </div>
        <p className="text-[10px] text-gray-600 ml-3.5">{missions.length} sessions logged</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence initial={false}>
          {missions.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              onClick={() => onSelect(m.id)}
              className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-all duration-200 border-l-2 ${
                selectedId === m.id
                  ? "border-l-blue-500 bg-blue-500/5"
                  : "border-l-transparent hover:bg-white/5"
              }`}
            >
              {/* Title row */}
              <div className="flex items-center gap-2">
                <div className={statusPip(m.status)} />
                <span className="text-[12px] font-medium text-gray-200 truncate flex-1">{m.title}</span>
                {selectedId === m.id && <ChevronRight size={10} className="text-blue-400" />}
              </div>

              {/* Intent badge + time */}
              <div className="flex items-center justify-between ml-4">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${labelColors[m.status]}`}>
                  {m.status}
                </span>
                <span className="text-[9px] text-gray-600">{m.time}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {missions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Clock size={20} className="text-gray-700" />
            <p className="text-[11px] text-gray-600">No missions yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">Session uptime</span>
          <span className="text-[10px] font-mono text-emerald-400">●  LIVE</span>
        </div>
      </div>
    </aside>
  );
}
