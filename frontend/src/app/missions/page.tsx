"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import {
  Search, Filter, CheckCircle2, Loader2, AlertTriangle,
  XCircle, Clock, ChevronRight, ListChecks, TrendingUp, Zap
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "success" | "active" | "clarify" | "failed" | "pending";

interface MissionRecord {
  id: string;
  title: string;
  intent: string;
  status: Status;
  date: string;
  duration: string;
  entities?: string;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const ALL_MISSIONS: MissionRecord[] = [
  { id: "m1",  title: "Book conference room A for tomorrow 3pm", intent: "book_room",   status: "success", date: "2026-05-02 09:14", duration: "6s",  entities: "Room A · 2026-05-03 · 15:00" },
  { id: "m2",  title: "Email team re: Q2 standup at 10am",       intent: "send_email",  status: "success", date: "2026-05-02 09:22", duration: "4s",  entities: "team@co · standup" },
  { id: "m3",  title: "Search Q2 sales data PDF on drive",       intent: "search_web",  status: "success", date: "2026-05-02 09:41", duration: "3s",  entities: "Q2 sales data" },
  { id: "m4",  title: "Open JIRA and assign ticket to Alice",     intent: "open_url",    status: "failed",  date: "2026-05-02 10:05", duration: "12s", entities: "JIRA · Alice" },
  { id: "m5",  title: "Add client call to calendar next Monday",  intent: "calendar_add",status: "success", date: "2026-05-02 10:30", duration: "5s",  entities: "2026-05-06 · client call" },
  { id: "m6",  title: "Play focus music on Spotify",              intent: "play_music",  status: "success", date: "2026-05-02 11:00", duration: "2s",  entities: "focus music" },
  { id: "m7",  title: "Book a room",                              intent: "clarify",     status: "clarify", date: "2026-05-02 11:15", duration: "1s",  entities: "–" },
  { id: "m8",  title: "Find the latest quarterly report online",  intent: "search_web",  status: "active",  date: "2026-05-02 11:20", duration: "…",   entities: "quarterly report 2026" },
];

const INTENT_LABELS: Record<string, string> = {
  book_room: "Book Room", send_email: "Email", search_web: "Search",
  open_url: "Navigate", calendar_add: "Calendar", play_music: "Music",
  clarify: "Clarify", general: "General",
};

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { cls: string; icon: React.ReactNode; label: string }> = {
    success: { cls: "badge-emerald", icon: <CheckCircle2 size={9} />, label: "Success"  },
    active:  { cls: "badge-indigo",  icon: <Loader2 size={9} className="animate-spin" />, label: "Running" },
    clarify: { cls: "badge-amber",   icon: <AlertTriangle size={9} />, label: "Clarify" },
    failed:  { cls: "badge-rose",    icon: <XCircle size={9} />,        label: "Failed"  },
    pending: { cls: "badge-muted",   icon: <Clock size={9} />,          label: "Pending" },
  };
  const cfg = map[status];
  return (
    <span className={`badge ${cfg.cls}`} style={{ gap: 4 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color, accent }: { icon: React.ReactNode; value: number | string; label: string; color: string; accent: string }) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <div className={accent} style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MissionsPage() {
  const { user, isLoaded } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [missions, setMissions] = useState<MissionRecord[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      const saved = localStorage.getItem(`voice_ai_missions_${user.id}`);
      if (saved) {
        try {
          setMissions(JSON.parse(saved));
        } catch (e) {
          setMissions([]);
        }
      } else {
        // Start with empty history for new users
        setMissions([]);
        localStorage.setItem(`voice_ai_missions_${user.id}`, JSON.stringify([]));
      }
    }
  }, [isLoaded, user]);

  const filtered = missions.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    total:   missions.length,
    success: missions.filter((m) => m.status === "success").length,
    active:  missions.filter((m) => m.status === "active").length,
    failed:  missions.filter((m) => m.status === "failed").length,
  };

  const pageTitle = isLoaded && user ? `${user.firstName}'s Mission History` : "Mission History";

  return (
    <AppShell pageTitle={pageTitle}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "12px 16px", gap: 12 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flexShrink: 0 }}>
          <StatCard icon={<ListChecks size={18} />}  value={counts.total}   label="Total Missions"    color="var(--text-0)"   accent="accent-indigo" />
          <StatCard icon={<CheckCircle2 size={18} />} value={counts.success} label="Successful"         color="var(--emerald)"  accent="accent-emerald" />
          <StatCard icon={<TrendingUp size={18} />}   value={counts.active}  label="Active"             color="var(--indigo)"   accent="accent-cyan" />
          <StatCard icon={<Zap size={18} />}          value={counts.failed}  label="Failed"             color="var(--rose)"     accent="accent-amber" />
        </div>

        {/* Table card */}
        <div className="glass" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 16 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-2)" }} />
              <input
                className="input"
                style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
                placeholder="Search missions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {(["all", "success", "active", "clarify", "failed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="btn"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    background: filter === f ? "rgba(99,102,241,0.15)" : "var(--bg-card)",
                    border: `1px solid ${filter === f ? "rgba(99,102,241,0.3)" : "var(--border-default)"}`,
                    color: filter === f ? "var(--indigo)" : "var(--text-2)",
                  }}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-2)" }}>
              {filtered.length} results
            </span>
          </div>

          {/* Table header */}
          <div
            className="mission-row"
            style={{
              flexShrink: 0,
              gridTemplateColumns: "1fr 120px 120px 90px 60px",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid var(--border-subtle)",
              cursor: "default",
              padding: "8px 16px",
            }}
          >
            {["Mission", "Intent", "Entities", "Date", ""].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <AnimatePresence initial={false}>
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="mission-row"
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                  style={{
                    gridTemplateColumns: "1fr 120px 120px 90px 60px",
                    background: selected === m.id ? "rgba(99,102,241,0.05)" : undefined,
                  }}
                >
                  {/* Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <StatusBadge status={m.status} />
                    <span style={{ fontSize: 12, color: "var(--text-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.title}
                    </span>
                  </div>

                  {/* Intent */}
                  <span className="badge badge-muted" style={{ width: "fit-content" }}>
                    {INTENT_LABELS[m.intent] ?? m.intent}
                  </span>

                  {/* Entities */}
                  <span style={{ fontSize: 11, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.entities}
                  </span>

                  {/* Date */}
                  <span className="font-mono" style={{ fontSize: 10, color: "var(--text-2)" }}>{m.date}</span>

                  {/* Arrow */}
                  <ChevronRight size={12} style={{ color: "var(--text-2)", marginLeft: "auto" }} />
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 60 }}>
                <Search size={20} style={{ color: "var(--text-3)" }} />
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>No missions match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
