"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { Key, Globe, Mic, Brain, Sliders, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}

const SECTIONS: SettingSection[] = [
  { id: "agent",   icon: <Brain size={16} />,   title: "Agent Config",   description: "Model selection and behaviour settings", accent: "accent-cyan" },
  { id: "voice",   icon: <Mic size={16} />,     title: "Voice Input",    description: "Microphone and speech recognition", accent: "accent-emerald" },
  { id: "browser", icon: <Globe size={16} />,   title: "Browser",        description: "Playwright automation settings", accent: "accent-amber" },
  { id: "ui",      icon: <Sliders size={16} />, title: "UI Preferences", description: "Appearance and dashboard layout", accent: "accent-indigo" },
];

// ─── Input components ─────────────────────────────────────────────────────────

function SecretInput({ label, placeholder, description }: { label: string; placeholder?: string; description?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", display: "block", marginBottom: 6 }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "sk-••••••••"}
          className="input"
          style={{ paddingRight: 40, fontSize: 13 }}
        />
        <button
          onClick={() => setShow(!show)}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-2)", background: "none", border: "none", cursor: "pointer" }}
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {description && <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 5 }}>{description}</p>}
    </div>
  );
}

function TextInput({ label, value, description, type = "text" }: { label: string; value: string; description?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", display: "block", marginBottom: 6 }}>{label}</label>
      <input defaultValue={value} type={type} className="input" style={{ fontSize: 13 }} />
      {description && <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 5 }}>{description}</p>}
    </div>
  );
}

function SelectInput({ label, options, value, onChange, description }: { label: string; options: string[]; value: string; onChange?: (val: string) => void; description?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", display: "block", marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="input"
        style={{ fontSize: 13, cursor: "pointer", appearance: "none" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {description && <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 5 }}>{description}</p>}
    </div>
  );
}

function Toggle({ label, defaultChecked, description }: { label: string; defaultChecked?: boolean; description?: string }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-start justify-between" style={{ marginBottom: 16, gap: 16 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)" }}>{label}</p>
        {description && <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 3 }}>{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: 44, height: 24,
          borderRadius: 99,
          background: on ? "var(--indigo)" : "var(--bg-card)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${on ? "rgba(255,255,255,0.2)" : "var(--border-strong)"}`,
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: on 
            ? "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 12px var(--indigo-glow)" 
            : "inset 0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <motion.div
          animate={{ x: on ? 20 : 2, scale: on ? 1 : 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ 
            width: 18, height: 18, 
            borderRadius: "50%", 
            background: "white", 
            position: "absolute", top: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        />
      </button>
    </div>
  );
}

// ─── Section panel ────────────────────────────────────────────────────────────

function SectionPanel({ section }: { section: SettingSection }) {
  const [, setForceRender] = useState(0);

  const renderContent = () => {
    switch (section.id) {
      case "agent":
        return (
          <>
            <SelectInput label="LLM Model" options={["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"]} value="llama3-70b-8192" description="Groq model for intent extraction" />
            <TextInput label="Temperature" value="0.1" type="number" description="Lower = more deterministic intent matching" />
            <TextInput label="Max Retries" value="3" type="number" description="How many times to retry on API failure" />
            <Toggle label="Human-in-the-Loop" defaultChecked={true} description="Show gold glow when agent needs clarification" />
            <Toggle label="Auto-execute on high confidence" defaultChecked={false} description="Execute automatically if confidence > 90%" />
          </>
        );
      case "voice":
        return (
          <>
            <SelectInput label="STT Provider" options={["Web Speech API (Browser)", "Whisper (Local)", "Deepgram (Cloud)"]} value="Web Speech API (Browser)" />
            <SelectInput label="Language" options={["en-US", "en-GB", "hi-IN", "es-ES"]} value="en-US" />
            <Toggle label="Continuous listening" description="Keep mic open after each command" />
            <Toggle label="Push-to-talk mode" defaultChecked={false} description="Hold spacebar to record instead of clicking mic" />
            <Toggle label="Show voice bars animation" defaultChecked={true} />
          </>
        );
      case "browser":
        return (
          <>
            <SelectInput label="Browser" options={["Chromium (Default)", "Firefox", "WebKit"]} value="Chromium (Default)" />
            <Toggle label="Headless mode" defaultChecked={true} description="Run browser without a visible window" />
            <Toggle label="Stream screenshots" defaultChecked={true} description="Send live screenshots to Action Canvas" />
            <TextInput label="Screenshot interval (ms)" value="500" type="number" description="How often to capture the browser view" />
            <TextInput label="Page timeout (ms)" value="10000" type="number" />
          </>
        );
      case "ui":
        const currentTheme = typeof document !== 'undefined' && document.documentElement.classList.contains("light-mode") ? "Light" : "Dark";
        return (
          <>
            <SelectInput 
              label="Theme" 
              options={["Dark", "Light"]} 
              value={currentTheme} 
              onChange={(val) => {
                if (val === "Light") document.documentElement.classList.add("light-mode");
                else document.documentElement.classList.remove("light-mode");
                setForceRender(f => f + 1);
              }}
            />
            <Toggle label="Reduce motion" description="Disable micro-animations for accessibility" />
            <Toggle label="Compact Live Feed" description="Show smaller log entries" />
            <Toggle label="Auto-scroll log feed" defaultChecked={true} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-section">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.accent}`} style={{ color: "white" }}>
          {section.icon}
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>{section.title}</h3>
          <p style={{ fontSize: 11, color: "var(--text-2)" }}>{section.description}</p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState("agent");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell pageTitle="Settings">
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 12,
          padding: "12px 16px 16px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Left nav */}
        <div className="liquid-glass rounded-2xl flex flex-col overflow-hidden" style={{ height: "fit-content" }}>
          <div className="panel-header">
            <div className="panel-accent accent-indigo" />
            <span className="panel-title">Categories</span>
          </div>
          <nav className="flex flex-col p-2 gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className="flex items-center gap-2.5 btn"
                style={{
                  padding: "9px 12px",
                  borderRadius: 10,
                  textAlign: "left",
                  background: active === s.id ? "rgba(99,102,241,0.12)" : "transparent",
                  border: `1px solid ${active === s.id ? "rgba(99,102,241,0.25)" : "transparent"}`,
                  color: active === s.id ? "var(--indigo)" : "var(--text-1)",
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <span style={{ color: active === s.id ? "var(--indigo)" : "var(--text-2)" }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{s.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right: settings panel */}
        <div className="liquid-glass rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between panel-header">
            <div className="flex items-center gap-2">
              <div className="panel-accent accent-indigo" />
              <span className="panel-title">{SECTIONS.find((s) => s.id === active)?.title}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="btn btn-primary"
              style={{ height: 32, fontSize: 12, padding: "0 16px", gap: 6 }}
            >
              {saved
                ? <><CheckCircle2 size={12} /> Saved!</>
                : <><Save size={12} /> Save Changes</>
              }
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {SECTIONS.map((s) =>
              s.id === active ? <SectionPanel key={s.id} section={s} /> : null
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
