"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { LiveFeed, LogEntry, LogType } from "@/components/LiveFeed";
import { ActionCanvas } from "@/components/ActionCanvas";
import { VoiceCommandBar } from "@/components/VoiceCommandBar";
import { useAgentWS, WSMessage } from "@/hooks/useAgentWS";
import { useUser } from "@clerk/nextjs";
import { Terminal, Activity } from "lucide-react";

const mkLog = (type: LogType, text: string, meta?: string): LogEntry => ({
  id: `l_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  type,
  text,
  timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  meta,
});

const SEED: LogEntry = { id: "seed_init", type: "system", text: "Voice AI initialized. Awaiting commands.", timestamp: "—" };

export default function DashboardPage() {
  const { user } = useUser();
  const [logs,        setLogs]    = useState<LogEntry[]>([]);
  const [agentUrl,    setAgentUrl] = useState<string | undefined>();
  const [isLoading,   setLoading]  = useState(false);
  const [screenshot,  setShot]     = useState<string | undefined>();
  const [isClarify,   setClarify]  = useState(false);
  const [isProcessing,setProc]     = useState(false);
  const [hydrated,    setHydrated] = useState(false);
  const [sessionStats, setSessionStats] = useState({ cmds: 0, done: 0, errs: 0 });
  const logEndRef   = useRef<HTMLDivElement>(null);
  const currentCmd  = useRef<string>("");   // track the active voice command
  const currentIntent = useRef<string>("general"); // track intent from think event
  const cmdStart    = useRef<number>(Date.now());

  // ── Save a completed mission to Mission History localStorage ─────────────
  const saveMission = useCallback((status: "success" | "failed" | "clarify", resultText: string) => {
    const userId = user?.id ?? "anonymous";
    const key = `voice_ai_missions_${userId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      const duration = `${((Date.now() - cmdStart.current) / 1000).toFixed(0)}s`;
      const newMission = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: currentCmd.current || "Voice Command",
        intent: currentIntent.current,
        status,
        date: new Date().toLocaleString("sv").slice(0, 16),
        duration,
        entities: resultText.slice(0, 60),
      };
      localStorage.setItem(key, JSON.stringify([newMission, ...existing]));
    } catch (e) {
      console.error("Failed to save mission", e);
    }
  }, [user]);

  // ── Load from LocalStorage on mount ─────────────────────────────────────────
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem("voice_ai_logs");
      const savedUrl  = localStorage.getItem("voice_ai_url");
      const savedShot = localStorage.getItem("voice_ai_shot");

      if (savedLogs) {
        const parsed: LogEntry[] = JSON.parse(savedLogs);
        // De-duplicate by ID — re-assign unique IDs to any conflicting entries
        const seen = new Set<string>();
        const deduped = parsed.map((log) => {
          if (seen.has(log.id)) {
            return { ...log, id: `l_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` };
          }
          seen.add(log.id);
          return log;
        });
        setLogs(deduped);
      } else {
        // Fresh session: show seed message only
        setLogs([SEED]);
      }
      if (savedUrl) setAgentUrl(savedUrl);
      if (savedShot) setShot(savedShot);
    } catch (e) {
      console.error("Failed to restore session", e);
      setLogs([SEED]);
    }
    setHydrated(true);
  }, []);

  // ── Save to LocalStorage on change ──────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("voice_ai_logs", JSON.stringify(logs));
  }, [logs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (agentUrl) localStorage.setItem("voice_ai_url", agentUrl);
    else localStorage.removeItem("voice_ai_url");
  }, [agentUrl, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (screenshot) localStorage.setItem("voice_ai_shot", screenshot);
    else localStorage.removeItem("voice_ai_shot");
  }, [screenshot, hydrated]);

  // ── Browser TTS ──────────────────────────────────────────────────────────────
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-load voices as soon as they are available
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices(); // try immediately (works in Firefox)
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string) => {
    if (!text?.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.lang = "en-US"; utt.rate = 1.05; utt.pitch = 1;
    const voices = voicesRef.current;
    const preferred = voices.find(v => v.name.includes("Google") && v.lang === "en-US")
                   ?? voices.find(v => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);

  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // ── WebSocket message handler ─────────────────────────────────────────────
  const handleWSMsg = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case "heard":
        setLogs(p => [...p, mkLog("heard", msg.text)]);
        setSessionStats(s => ({ ...s, cmds: s.cmds + 1 }));
        setProc(true);
        break;
      case "think":
        currentIntent.current = msg.intent ?? "general";
        setLogs(p => [
          ...p,
          mkLog("think", `Intent: ${msg.intent} · Confidence: ${(msg.confidence * 100).toFixed(0)}%`, `${msg.latency_ms ?? "?"}ms`),
          ...(msg.reply ? [mkLog("result", `💬 ${msg.reply}`)] : []),
        ]);
        if (msg.reply) speak(msg.reply);
        break;
      case "action":
        clearTimeout((window as any)._agentTimeout);
        setAgentUrl(msg.url); setLoading(true); setShot(undefined);
        setLogs(p => [...p, mkLog("action", `Navigating → ${msg.url}`, msg.url)]);
        break;
      case "result":
        clearTimeout((window as any)._agentTimeout);
        setLoading(false); setProc(false); setClarify(false);
        setLogs(p => [...p, mkLog("result", msg.text)]);
        setSessionStats(s => ({ ...s, done: s.done + 1 }));
        speak(msg.text);
        saveMission("success", msg.text);
        break;
      case "error":
        clearTimeout((window as any)._agentTimeout);
        setLoading(false); setProc(false);
        setLogs(p => [...p, mkLog("error", msg.text)]);
        setSessionStats(s => ({ ...s, errs: s.errs + 1 }));
        saveMission("failed", msg.text);
        break;
      case "clarify":
        setClarify(true); setProc(false);
        setLogs(p => [...p, mkLog("heard", msg.text, "clarify")]);
        saveMission("clarify", msg.text);
        break;
      case "screenshot":
        setShot(`data:image/png;base64,${msg.data}`); setLoading(false);
        break;
    }
  }, [speak, saveMission]);

  const { connected, send } = useAgentWS({
    url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws",
    onMessage: handleWSMsg,
  });

  // ── Interrupt ─────────────────────────────────────────────────────────────
  const handleInterrupt = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearTimeout((window as any)._agentTimeout);
    setProc(false); setLoading(false);
    setLogs(p => [...p, mkLog("system", "⏹ Session interrupted by user")]);
  }, []);

  // ── Send command ──────────────────────────────────────────────────────────
  const handleCommand = useCallback((text: string) => {
    currentCmd.current    = text;
    currentIntent.current = "general";
    cmdStart.current      = Date.now();
    setClarify(false); setProc(true);
    // Don't add a local "heard" log here — the server echoes it back, preventing double-count

    if (connected) {
      send({ type: "command", text });
      const timeout = setTimeout(() => {
        setProc(false);
        setLogs(p => [...p, mkLog("error", "No response from backend (timeout)")]);
      }, 90_000);
      (window as any)._agentTimeout = timeout;
      return;
    }

    // Demo simulation when backend is offline
    const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    setSessionStats(s => ({ ...s, cmds: s.cmds + 1 }));
    setTimeout(() => {
      setLogs(p => [...p, mkLog("think", `Intent: search · Confidence: 88%`, "demo · 287ms")]);
    }, 600);
    setTimeout(() => {
      setAgentUrl(url); setLoading(true); setShot(undefined);
      setLogs(p => [...p, mkLog("action", `Navigating → ${url}`, url)]);
    }, 1400);
    setTimeout(() => {
      setLoading(false); setProc(false);
      setLogs(p => [...p, mkLog("result", `Search completed for: "${text.slice(0, 40)}"`)]);
      setSessionStats(s => ({ ...s, done: s.done + 1 }));
    }, 3200);
  }, [connected, send]);

  return (
    <AppShell pageTitle="Mission Control" wsConnected={connected}>
      {/* ── 2-column layout: Live Feed | Action Canvas ── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gridTemplateRows: "1fr auto",
        gap: 10,
        padding: "10px 12px 12px",
        overflow: "hidden",
        minHeight: 0,
      }}>

        {/* ── Col 1: Live Feed + Session Stats (spans both rows) ── */}
        <div style={{ gridColumn: "1", gridRow: "1 / 3", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>

          {/* Live Feed */}
          <div className="glass" style={{ borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 }}>
            <div className="panel-header">
              <div className="panel-accent accent-cyan" />
              <Terminal size={12} style={{ color: "var(--cyan)" }} />
              <span className="panel-title">Live Feed</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--cyan)", animation: "pulse-ring 2s ease-out infinite" }} />
                <span className="font-mono" style={{ fontSize: 9, color: "var(--text-2)" }}>streaming</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              <LiveFeed logs={logs} />
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Session Stats */}
          <div className="glass" style={{ borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
            <div className="panel-header">
              <div className="panel-accent accent-emerald" />
              <Activity size={12} style={{ color: "var(--emerald)" }} />
              <span className="panel-title">Session</span>
            </div>
            <div style={{ padding: 10, display: "flex", gap: 8 }}>
              {[
                { label: "Commands",  val: sessionStats.cmds,   color: "var(--cyan)"    },
                { label: "Completed", val: sessionStats.done,   color: "var(--emerald)" },
                { label: "Errors",    val: sessionStats.errs,   color: "var(--rose)"    },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)",
                }}>
                  <div className="font-mono" style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 2 Row 1: Action Canvas (full width) ── */}
        <ActionCanvas url={agentUrl} isLoading={isLoading} screenshotUrl={screenshot} />

        {/* ── Col 2 Row 2: Voice Command Bar ── */}
        <VoiceCommandBar
          onCommand={handleCommand}
          onInterrupt={handleInterrupt}
          isProcessing={isProcessing}
          waitingForClarify={isClarify}
          wsConnected={connected}
        />

      </div>
    </AppShell>
  );
}
