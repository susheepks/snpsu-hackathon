"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

interface TopBarProps {
  title?:      string;
  wsConnected: boolean;
}

export default function TopBar({ title, wsConnected }: TopBarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header style={{
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(6,8,15,0.85)",
      backdropFilter: "blur(20px)",
      flexShrink: 0,
      position: "relative",
      zIndex: 9999,
    }}>
      {/* Left — page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {title && (
          <h1 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)", letterSpacing: "-0.01em" }}>
            {title}
          </h1>
        )}
      </div>

      {/* Right — status + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* Backend status pill */}
        <AnimatePresence mode="wait">
          <motion.div
            key={wsConnected ? "live" : "demo"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px", borderRadius: 99,
              background: wsConnected ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)",
              border: `1px solid ${wsConnected ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: wsConnected ? "var(--emerald)" : "var(--amber)",
              boxShadow: wsConnected ? "0 0 6px var(--emerald-glow)" : "0 0 6px var(--amber-glow)",
              animation: wsConnected ? "pulse-ring 2s ease-out infinite" : undefined,
            }} />
            <span className="font-mono" style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
              color: wsConnected ? "var(--emerald)" : "var(--amber)",
            }}>
              {wsConnected ? "BACKEND LIVE" : "DEMO MODE"}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)" }} />

        {/* Icon buttons */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button 
            className="btn btn-icon" 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ 
              background: showNotifs ? "var(--bg-hover)" : undefined,
              borderColor: showNotifs ? "var(--border-strong)" : undefined,
              color: showNotifs ? "var(--text-0)" : undefined,
              position: "relative"
            }}
          >
            <Bell size={14} />
            {/* Unread dot */}
            <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--indigo)", boxShadow: "0 0 6px var(--indigo-glow)" }} />
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  borderRadius: 16,
                  padding: 16,
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "rgba(10, 13, 22, 0.96)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>Notifications</span>
                  <span style={{ fontSize: 10, color: "var(--indigo)", background: "rgba(99,102,241,0.15)", padding: "2px 6px", borderRadius: 99 }}>3 unread</span>
                </div>

                {/* Notification 1 */}
                <div style={{ display: "flex", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)" }}>
                  <CheckCircle2 size={14} color="var(--emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-0)", lineHeight: 1.4 }}>System Core Online</p>
                    <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>Llama-3 model successfully loaded in 280ms.</p>
                  </div>
                </div>

                {/* Notification 2 */}
                <div style={{ display: "flex", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)" }}>
                  <Info size={14} color="var(--cyan)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-0)", lineHeight: 1.4 }}>Browser Instance Ready</p>
                    <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>Playwright connected via WebSocket.</p>
                  </div>
                </div>

                {/* Notification 3 */}
                <div style={{ display: "flex", gap: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-subtle)" }}>
                  <Bell size={14} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-0)", lineHeight: 1.4 }}>Security Alert</p>
                    <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>Unrecognized entity found in command context.</p>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/settings" className="btn btn-icon"><Settings size={14} /></Link>

        {/* Avatar / Auth */}
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="btn" style={{ fontSize: 12, padding: "6px 12px" }}>Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn" style={{ fontSize: 12, padding: "6px 12px", background: "var(--indigo)", color: "white" }}>Sign Up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton appearance={{ elements: { userButtonAvatarBox: { width: 30, height: 30 } } }} />
        </Show>
      </div>
    </header>
  );
}
