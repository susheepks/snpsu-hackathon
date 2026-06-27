"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Tag, Calendar, Clock, Target, Activity, Cpu } from "lucide-react";

export interface BrainState {
  intent: string;
  confidence: number;
  entities: Record<string, string | undefined>;
  model: string;
  latency_ms?: number;
  status: "idle" | "processing" | "done" | "error";
}

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  date:     <Calendar size={10} />,
  time:     <Clock size={10} />,
  task:     <Target size={10} />,
  location: <Tag size={10} />,
  person:   <Tag size={10} />,
};

// SVG confidence ring
function ConfidenceRing({ value, status }: { value: number; status: string }) {
  const R = 30, C = 2 * Math.PI * R;
  const color = value > 0.75 ? "var(--emerald)" : value > 0.45 ? "var(--amber)" : "var(--rose)";
  const isProcessing = status === "processing";

  return (
    <div style={{ position: "relative", width: 80, height: 80 }}>
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        {isProcessing ? (
          <motion.circle
            cx="40" cy="40" r={R}
            fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${C * 0.25} ${C}`}
            animate={{ strokeDashoffset: [-C, C] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.circle
            cx="40" cy="40" r={R}
            fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C - C * value }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </svg>
      <div
        className="ring-label"
        style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        {isProcessing ? (
          <Cpu size={14} style={{ color, animation: "rotate-slow 1s linear infinite" }} />
        ) : (
          <>
            <span style={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(value * 100)}</span>
            <span style={{ fontSize: 8, color: "var(--text-2)", fontWeight: 500 }}>%</span>
          </>
        )}
      </div>
    </div>
  );
}

// Neural network dots
function NeuralBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 3, height: 3,
            borderRadius: "50%",
            background: "var(--violet)",
            left: `${(i % 4) * 25 + 12}%`,
            top: `${Math.floor(i / 4) * 33 + 16}%`,
            animation: `neural-pulse ${1.5 + (i * 0.25)}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SystemBrain({ state }: { state: BrainState }) {
  const entities = Object.entries(state.entities).filter(([, v]) => Boolean(v));

  return (
    <div
      className="glass flex flex-col overflow-hidden"
      style={{ borderRadius: 16, position: "relative", flex: 1, minHeight: 0 }}
    >
      <NeuralBg />

      {/* Header */}
      <div className="panel-header" style={{ position: "relative", zIndex: 1 }}>
        <div className="panel-accent accent-indigo" />
        <Brain size={12} style={{ color: "var(--violet)" }} />
        <span className="panel-title">System Brain</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <Activity size={9} style={{ color: state.status === "processing" ? "var(--indigo)" : "var(--text-2)", animation: state.status === "processing" ? "blink 1s ease-in-out infinite" : undefined }} />
          <span className="font-mono" style={{ fontSize: 9, color: "var(--text-2)" }}>
            {state.status === "processing" ? "thinking" : state.model.split("/").pop()}
          </span>
        </div>
      </div>

      {/* Confidence + intent */}
      <div
        className="flex items-center gap-4 px-4 py-4"
        style={{ position: "relative", zIndex: 1, borderBottom: "1px solid var(--border-subtle)" }}
      >
        <ConfidenceRing value={state.confidence} status={state.status} />
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 9, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Detected Intent
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={state.intent}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="font-mono"
              style={{ fontSize: 13, fontWeight: 700, color: "var(--violet)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {state.intent || "—"}
            </motion.p>
          </AnimatePresence>
          <p style={{ fontSize: 9, color: "var(--text-2)", marginTop: 3 }}>Confidence Score</p>
        </div>
      </div>

      {/* Entities */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 9, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Extracted Entities
        </p>
        <AnimatePresence>
          {entities.length > 0 ? (
            <div className="flex flex-col gap-2">
              {entities.map(([key, val]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.14)", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ color: "var(--violet)", flexShrink: 0 }}>
                    {ENTITY_ICONS[key] ?? <Tag size={10} />}
                  </span>
                  <div className="min-w-0">
                    <p style={{ fontSize: 9, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{key}</p>
                    <p className="font-mono" style={{ fontSize: 11, color: "var(--text-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "var(--text-2)", textAlign: "center", paddingTop: 16 }}>No entities extracted</p>
          )}
        </AnimatePresence>
      </div>

      {/* Latency footer */}
      {state.latency_ms !== undefined && (
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid var(--border-subtle)", position: "relative", zIndex: 1 }}
        >
          <div className="flex items-center gap-1.5">
            <Zap size={9} style={{ color: "var(--amber)" }} />
            <span style={{ fontSize: 10, color: "var(--text-2)" }}>API Latency</span>
          </div>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--amber)", fontWeight: 600 }}>{state.latency_ms}ms</span>
        </div>
      )}
    </div>
  );
}
