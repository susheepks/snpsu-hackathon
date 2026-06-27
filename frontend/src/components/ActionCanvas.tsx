"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, RefreshCw, Shield, ExternalLink, Eye, Zap } from "lucide-react";

interface ActionCanvasProps {
  url?: string;
  isLoading: boolean;
  screenshotUrl?: string;
}

export function ActionCanvas({ url, isLoading, screenshotUrl }: ActionCanvasProps) {
  return (
    <div className="glass" style={{ flex: 1, minHeight: 0, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Browser Chrome ── */}
      <div className="browser-chrome">
        <div style={{ display: "flex", gap: 6 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
            <div key={c} className="traffic-dot" style={{ background: c }} />
          ))}
        </div>

        {/* URL bar */}
        <div suppressHydrationWarning style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          padding: "5px 12px", borderRadius: 8, margin: "0 12px",
          background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)",
          fontFamily: "monospace", fontSize: 11,
          transition: "border-color 0.3s",
          borderColor: isLoading ? "rgba(99,102,241,0.3)" : "",
        }}>
          <Shield size={9} style={{ color: url ? "var(--emerald)" : "var(--text-2)", flexShrink: 0, transition: "color 0.3s" }} />
          <AnimatePresence mode="wait">
            <motion.span
              key={url ?? "idle"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2 }}
              style={{ color: "var(--text-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {url ?? "agent://awaiting-command"}
            </motion.span>
          </AnimatePresence>
          {url && <ExternalLink size={9} style={{ color: "var(--text-2)", flexShrink: 0 }} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoading && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={12} style={{ color: "var(--indigo)" }} />
            </motion.div>
          )}
          <Eye size={12} style={{ color: "var(--text-2)" }} />
        </div>
      </div>

      {/* ── Canvas Body ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#050710" }}>
        {/* Indigo scan line while loading */}
        {isLoading && (
          <motion.div
            style={{
              position: "absolute", left: 0, right: 0, height: 2, zIndex: 20,
              background: "linear-gradient(90deg,transparent,var(--indigo),var(--cyan),transparent)",
            }}
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        )}

        <AnimatePresence mode="wait">
          {screenshotUrl ? (
            <motion.img
              key="screenshot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={screenshotUrl}
              alt="Agent browser view"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyCanvas isLoading={isLoading} url={url} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Status Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 16px", borderTop: "1px solid var(--border-subtle)",
        background: "rgba(0,0,0,0.25)", fontFamily: "monospace", fontSize: 10, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: isLoading ? "var(--indigo)" : "var(--emerald)",
            boxShadow: isLoading ? "0 0 6px var(--indigo-glow)" : "0 0 6px var(--emerald-glow)",
            transition: "all 0.4s",
          }} />
          <span style={{ color: isLoading ? "var(--indigo)" : "var(--text-2)", transition: "color 0.3s" }}>
            {isLoading ? "Navigating..." : "Ready"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={8} style={{ color: "var(--text-3)" }} />
          <span style={{ color: "var(--text-3)" }}>Playwright · Chromium</span>
        </div>
      </div>
    </div>
  );
}

function EmptyCanvas({ isLoading, url }: { isLoading: boolean; url?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, position: "relative" }}>

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Floating orb icon */}
      <div style={{ position: "relative", width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
          <Globe size={40} style={{ color: "rgba(99,102,241,0.45)" }} />
        </motion.div>

        {/* Pulsing ring */}
        <motion.div
          style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(99,102,241,0.2)" }}
          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,211,238,0.15)" }}
          animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
        />
      </div>

      {/* Label */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p style={{ fontSize: 13, color: "var(--indigo)", fontWeight: 600, marginBottom: 6 }}>Agent is navigating...</p>
              <p className="font-mono" style={{ fontSize: 10, color: "var(--text-2)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500, marginBottom: 4 }}>Action Canvas</p>
              <p style={{ fontSize: 11, color: "var(--text-2)" }}>Browser view streams here when the agent navigates</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
