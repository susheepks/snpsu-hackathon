"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Zap, ArrowRight, Mic, Globe, Brain, Activity, ChevronRight, Shield, Cpu, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── Data ── */
const FEATURES = [
  { icon: <Mic size={22} />,      accent: "#22D3EE", glow: "rgba(34,211,238,0.25)",  bg: "rgba(34,211,238,0.08)",  title: "Voice-First Input",    badge: "Web Speech API", desc: "Speak naturally. Commands are transcribed in real-time using the browser's native speech recognition engine." },
  { icon: <Brain size={22} />,    accent: "#A78BFA", glow: "rgba(167,139,250,0.25)", bg: "rgba(167,139,250,0.08)", title: "Groq-Powered NLU",     badge: "Llama-3.3-70B",  desc: "Lightning-fast LLM inference extracts intent, entities, and confidence score from your raw command in milliseconds." },
  { icon: <Globe size={22} />,    accent: "#34D399", glow: "rgba(52,211,153,0.25)",  bg: "rgba(52,211,153,0.08)",  title: "Browser Automation",   badge: "Playwright",     desc: "Real Chromium browser — the agent navigates, searches, and extracts AI Overviews just like a human would." },
  { icon: <Activity size={22} />, accent: "#FBBF24", glow: "rgba(251,191,36,0.25)",  bg: "rgba(251,191,36,0.08)",  title: "Live WebSocket Stream", badge: "Real-Time",      desc: "Every step — Heard → Think → Action → Result — streams live to your dashboard over a persistent WebSocket." },
];

const STATS = [
  { value: "Llama-3",   label: "Core Intelligence", color: "#34D399", sub: "70B params" },
  { value: "<300ms",    label: "LLM Latency",       color: "#22D3EE", sub: "Groq inference" },
  { value: "WebSocket", label: "Event Protocol",    color: "#A78BFA", sub: "Bi-directional" },
  { value: "100%",      label: "Browser Native",    color: "#6366F1", sub: "No plugins" },
];

const PIPELINE = [
  { icon: <Mic size={13} />,      label: "HEARD",  desc: "Voice captured",         color: "#22D3EE" },
  { icon: <Cpu size={13} />,      label: "THINK",  desc: "Groq LLM parsing",       color: "#A78BFA" },
  { icon: <Globe size={13} />,    label: "ACTION", desc: "Playwright navigates",   color: "#6366F1" },
  { icon: <Activity size={13} />, label: "RESULT", desc: "Answer streamed back",   color: "#34D399" },
];

/* ── Typing animation ── */
const PHRASES = ["Open YouTube", "Search the web", "Book a meeting", "Find my files", "Play music"];

function TypingText() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[idx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < phrase.length) {
      timer = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 70);
    } else if (!deleting && displayed.length === phrase.length) {
      timer = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % PHRASES.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx]);

  return (
    <span style={{ color: "var(--cyan)" }} className="typing-cursor">{displayed}</span>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", color: "var(--text-0)", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 58,
        background: "rgba(6,8,15,0.8)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,var(--indigo),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            <Zap size={15} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }} className="gradient-brand">Voice AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pipeline" className="nav-link">How it works</a>
          <Link href="/missions" className="nav-link">Missions</Link>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: 12 }}>Dashboard</Link>
          <Link href="/dashboard" className="btn btn-glow" style={{ fontSize: 12, padding: "8px 18px" }}>
            Mission Control <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="aurora-bg" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingTop: 80, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
        position: "relative", textAlign: "center",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)",
        backgroundSize: "64px 64px",
      }}>
        {/* Deep glow orbs */}
        <div style={{ position: "absolute", width: 800, height: 800, top: "5%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle,rgba(99,102,241,0.14),transparent 65%)", borderRadius: "50%", pointerEvents: "none", animation: "orb-float 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, top: "20%", left: "5%", background: "radial-gradient(circle,rgba(34,211,238,0.09),transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orb-float 13s ease-in-out 2s infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, top: "15%", right: "5%", background: "radial-gradient(circle,rgba(167,139,250,0.09),transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "orb-float 11s ease-in-out 4s infinite" }} />

        {/* Live pill */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ position: "relative", zIndex: 1 }}>
          <div className="pill-live" style={{ marginBottom: 36 }}>
            <span className="dot" />
            AI Voice Agent · Hackathon 2026
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(54px,8.5vw,104px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", maxWidth: 900, margin: "0 auto" }}>
            <span className="gradient-hero">Just say</span>
            <br />
            <span style={{ color: "var(--text-0)", display: "block", minHeight: "1.1em" }}>
              "<TypingText />"
            </span>
            <br />
            <span className="gradient-brand">It happens.</span>
          </h1>
        </motion.div>

        {/* Sub */}
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          style={{ fontSize: 17, color: "var(--text-1)", lineHeight: 1.75, maxWidth: 540, marginTop: 28, position: "relative", zIndex: 1 }}>
          Speak a command. Watch the AI agent think, browse the web, and complete real tasks — streamed live to your dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          style={{ display: "flex", gap: 14, marginTop: 40, position: "relative", zIndex: 1 }}>
          <Link href="/dashboard" className="btn btn-glow" style={{ fontSize: 15, padding: "14px 30px" }}>
            Open Mission Control <ChevronRight size={16} />
          </Link>
          <Link href="/missions" className="btn btn-ghost" style={{ fontSize: 14, padding: "14px 26px" }}>
            View My Missions
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: 12, marginTop: 60, position: "relative", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {STATS.map((s, i) => (
            <motion.div key={i} className="stat-pill" whileHover={{ scale: 1.05 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-1)", fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "var(--text-2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pipeline mini preview */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.6 }}
          id="pipeline-preview"
          style={{ width: "100%", maxWidth: 620, marginTop: 60, position: "relative", zIndex: 1 }}>
          <div className="glow-border" style={{ borderRadius: 20, overflow: "hidden", background: "rgba(10,13,22,0.92)", border: "1px solid var(--border-default)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
            {/* Chrome bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(0,0,0,0.35)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
                <Shield size={9} color="var(--emerald)" />
                <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "monospace" }}>voice-ai://mission-control</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Wifi size={9} color="var(--emerald)" />
                <span style={{ fontSize: 9, color: "var(--emerald)", fontWeight: 600 }}>LIVE</span>
              </div>
            </div>
            {/* Pipeline steps */}
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {PIPELINE.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.15 }}
                  className="pipeline-step"
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${step.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="font-mono" style={{ fontSize: 9, fontWeight: 700, color: step.color, letterSpacing: "0.08em" }}>{step.label}</span>
                    <p style={{ fontSize: 11, color: "var(--text-1)", marginTop: 1 }}>{step.desc}</p>
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, boxShadow: `0 0 8px ${step.color}`, animation: "pulse-ring 2s ease-out infinite" }} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3 }}>
          <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom,var(--indigo),transparent)" }} />
          <span style={{ fontSize: 9, color: "var(--text-2)", letterSpacing: "0.12em" }}>SCROLL</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "120px 32px", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label" style={{ margin: "0 auto 20px" }}>
            <Zap size={10} /> Capabilities
          </div>
          <h2 style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Built for <span className="gradient-brand">real automation</span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-1)", marginTop: 14, maxWidth: 500, margin: "14px auto 0" }}>
            Not a toy — the agent actually completes tasks in a live browser.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="feature-card glass"
              style={{ borderRadius: 24, padding: "28px 28px", boxShadow: `0 0 0 0 ${f.glow}`, transition: "box-shadow 0.3s ease" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 40px ${f.glow}`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 0 ${f.glow}`)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.bg, border: `1px solid ${f.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: f.accent, boxShadow: `0 0 20px ${f.glow}` }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>{f.title}</h3>
                    <span className="badge badge-muted" style={{ fontSize: 9 }}>{f.badge}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="pipeline" style={{ padding: "0 32px 120px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ margin: "0 auto 20px" }}>
            <Cpu size={10} /> Pipeline
          </div>
          <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            From voice to <span className="gradient-brand">action</span> in milliseconds
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
          {/* Connecting line */}
          <div style={{ position: "absolute", left: 23, top: 20, bottom: 20, width: 2, background: "linear-gradient(to bottom, var(--indigo), var(--cyan))", opacity: 0.2, borderRadius: 99 }} />
          {PIPELINE.map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", position: "relative" }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `${step.color}12`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, flexShrink: 0 }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: step.color, letterSpacing: "0.08em", marginBottom: 4 }} className="font-mono">{step.label}</div>
                <div style={{ fontSize: 14, color: "var(--text-0)", fontWeight: 500 }}>{step.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 99, background: `${step.color}10`, border: `1px solid ${step.color}25`, fontSize: 10, color: step.color, fontWeight: 600 }}>
                Step {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 32px 120px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 760, margin: "0 auto", borderRadius: 32, padding: "72px 56px", textAlign: "center", position: "relative", overflow: "hidden", background: "rgba(10,13,22,0.8)", border: "1px solid var(--border-default)", boxShadow: "0 0 80px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.18), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 120%, rgba(34,211,238,0.08), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div className="section-label" style={{ margin: "0 auto 24px" }}>
              <Zap size={10} /> Ready?
            </div>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.15 }}>
              See it work <span className="gradient-hero">live</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.7, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
              Open Mission Control and speak your first command. No setup needed — it works in your browser right now.
            </p>
            <Link href="/dashboard" className="btn btn-glow" style={{ fontSize: 15, padding: "15px 36px" }}>
              Launch Mission Control <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,var(--indigo),var(--violet))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={11} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13 }} className="gradient-brand">Voice AI</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-2)" }}>2026 — Next.js · FastAPI · Groq · Playwright</p>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/dashboard" className="nav-link" style={{ fontSize: 11 }}>Dashboard</Link>
          <Link href="/missions" className="nav-link" style={{ fontSize: 11 }}>Missions</Link>
          <Link href="/settings" className="nav-link" style={{ fontSize: 11 }}>Settings</Link>
        </div>
      </footer>
    </div>
  );
}
