"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, AlertTriangle, Loader2, Square } from "lucide-react";

const BAR_COUNT = 28;

interface VoiceCommandBarProps {
  onCommand:    (text: string) => void;
  onInterrupt?: () => void;          // stop current session
  isProcessing: boolean;
  waitingForClarify: boolean;
  wsConnected: boolean;
}

export function VoiceCommandBar({ onCommand, onInterrupt, isProcessing, waitingForClarify, wsConnected }: VoiceCommandBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [textInput,   setTextInput]   = useState("");
  const [bars,        setBars]        = useState<number[]>(Array(BAR_COUNT).fill(3));
  const [micError,    setMicError]    = useState<string | null>(null);
  const recRef        = useRef<any>(null); // SpeechRecognition — browser API
  const animRef        = useRef<number>(0);
  const idleRef        = useRef<number>(0);
  const tickRef        = useRef<number>(0);
  const transcriptRef  = useRef<string>("");  // mirrors transcript without setState-in-render

  /* ── Idle breathing animation (gentle wave when not listening) ── */
  const startIdleAnim = useCallback(() => {
    const tick = () => {
      const now = Date.now() / 600;
      setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
        const wave = Math.sin(now + i * 0.45) * 0.5 + 0.5;   // 0-1 sine
        return 2 + wave * 5;                                   // 2-7px gentle ripple
      }));
      idleRef.current = requestAnimationFrame(tick);
    };
    idleRef.current = requestAnimationFrame(tick);
  }, []);

  const stopIdleAnim = useCallback(() => {
    cancelAnimationFrame(idleRef.current);
  }, []);

  /* ── Live mic animation ── */
  const animateBars = useCallback(() => {
    setBars(Array.from({ length: BAR_COUNT }, () =>
      Math.random() > 0.3 ? 4 + Math.random() * 32 : 3
    ));
    animRef.current = requestAnimationFrame(animateBars);
  }, []);

  /* Lifecycle */
  useEffect(() => {
    startIdleAnim();
    return () => { stopIdleAnim(); cancelAnimationFrame(animRef.current); recRef.current?.stop(); };
  }, [startIdleAnim, stopIdleAnim]);

  const stopListening = useCallback((submit = false) => {
    setIsListening(false);
    cancelAnimationFrame(animRef.current);
    startIdleAnim();
    recRef.current?.stop();
    recRef.current = null;
    const captured = transcriptRef.current.trim();
    transcriptRef.current = "";
    setTranscript("");
    if (submit && captured) onCommand(captured);
  }, [onCommand, startIdleAnim]);

  const startListening = useCallback(() => {
    if (isListening) return;
    setMicError(null);

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicError("Web Speech API not supported. Use Chrome/Edge, or type your command instead.");
      return;
    }

    setIsListening(true);
    setTranscript("");
    stopIdleAnim();
    animRef.current = requestAnimationFrame(animateBars);

    const rec = new SR();
    rec.continuous     = true;   // keep mic open — don't timeout after silence
    rec.interimResults = true;
    rec.lang           = "en-US";
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      transcriptRef.current = t;
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        stopListening(true);
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "no-speech") {
        // Don't show error — just silently keep waiting
        return;
      }
      if (e.error === "not-allowed") {
        setMicError("Mic access denied — click the 🔒 lock icon in the address bar and allow microphone.");
      } else if (e.error === "network") {
        setMicError("Speech API needs HTTPS or localhost. Use the text box instead.");
      } else {
        setMicError(`Speech error: ${e.error}`);
      }
      stopListening(false);
    };
    rec.onend = () => stopListening(true);
    recRef.current = rec;
    rec.start();
  }, [isListening, animateBars, stopIdleAnim, stopListening]);

  const handleSend = () => {
    const val = textInput.trim();
    if (!val || isProcessing) return;
    onCommand(val);
    setTextInput("");
  };

  /* ── Bar colour helper ── */
  const barColor = (i: number) => {
    if (isListening) return `hsl(${238 + i * 2}, 78%, ${52 + i * 0.4}%)`;
    return `rgba(255,255,255,${0.06 + (bars[i] - 2) / 5 * 0.12})`; // subtle shimmer in idle
  };

  return (
    <div
      className="glass"
      style={{
        borderRadius: 16,
        flexShrink: 0,
        overflow: "hidden",
        transition: "box-shadow 0.4s, border-color 0.4s",
        boxShadow: waitingForClarify
          ? "0 0 28px rgba(251,191,36,0.18)"
          : isListening
          ? "0 0 28px rgba(99,102,241,0.2)"
          : "none",
        borderColor: waitingForClarify ? "rgba(251,191,36,0.35)" : undefined,
      }}
    >
      {/* ── Error banner ── */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", overflow: "hidden",
              background: "rgba(239,68,68,0.07)",
              borderBottom: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertTriangle size={12} style={{ color: "#f87171", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#f87171" }}>{micError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clarify banner ── */}
      <AnimatePresence>
        {waitingForClarify && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", overflow: "hidden",
              background: "rgba(251,191,36,0.07)",
              borderBottom: "1px solid rgba(251,191,36,0.18)",
            }}
          >
            <AlertTriangle size={12} style={{ color: "var(--amber)", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "var(--amber)" }}>
              Agent needs clarification — please refine your command
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Live Voice Transcript Banner ── */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: "hidden",
              borderBottom: "1px solid rgba(99,102,241,0.2)",
              background: "rgba(99,102,241,0.06)",
            }}
          >
            <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              {/* LIVE pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 99, padding: "3px 8px", flexShrink: 0,
              }}>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--indigo)" }}
                />
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--indigo)", letterSpacing: 1 }}>LIVE</span>
              </div>

              {/* Transcript text */}
              <p style={{
                fontSize: 15, fontWeight: 500, color: "var(--cyan)",
                fontFamily: "monospace", flex: 1,
                minHeight: 22,
              }}>
                {transcript || (
                  <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic", fontSize: 13 }}>
                    Listening... speak your command
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>

        {/* Mic button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => isListening ? stopListening(true) : startListening()}
          disabled={isProcessing}
          style={{
            width: 40, height: 40, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, cursor: "pointer",
            background: isListening
              ? "linear-gradient(135deg, var(--indigo), var(--violet))"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${isListening ? "rgba(99,102,241,0.4)" : "var(--border-default)"}`,
            boxShadow: isListening ? "0 0 20px var(--indigo-glow)" : "none",
            transition: "all 0.25s",
          }}
        >
          {isListening
            ? <Mic size={16} color="white" />
            : <MicOff size={16} color="var(--text-2)" />
          }
        </motion.button>

        {/* Waveform bars */}
        <div style={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0, width: 100, height: 36 }}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: isListening ? h : bars[i] }}
              transition={{ duration: isListening ? 0.07 : 0.25, ease: "easeOut" }}
              style={{
                flex: 1,
                borderRadius: 99,
                minHeight: 2,
                background: barColor(i),
                transition: "background 0.4s",
              }}
            />
          ))}
        </div>

        {/* Input / transcript */}
        <div style={{ flex: 1, position: "relative" }}>
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="transcript"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  height: 38, display: "flex", alignItems: "center", padding: "0 12px",
                  borderRadius: 10, fontFamily: "monospace", fontSize: 12,
                  background: "rgba(34,211,238,0.04)",
                  border: "1px solid rgba(34,211,238,0.2)",
                  color: "var(--cyan)",
                }}
              >
                {transcript || (
                  <span style={{ color: "var(--text-2)" }}>
                    Listening<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>|</motion.span>
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.input
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={waitingForClarify ? "Type your clarification..." : "Speak or type a command..."}
                disabled={isProcessing}
                className={`input${waitingForClarify ? " input-gold" : ""}`}
                style={{ height: 38, fontSize: 13 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* STOP button — visible while processing */}
        <AnimatePresence>
          {isProcessing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onInterrupt?.()}
              title="Stop session"
              style={{
                width: 38, height: 38, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: "pointer",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                boxShadow: "0 0 14px rgba(239,68,68,0.4)",
              }}
            >
              <Square size={14} color="white" fill="white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleSend}
          disabled={isProcessing || (!textInput.trim() && !transcript.trim())}
          style={{
            width: 38, height: 38, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, cursor: "pointer",
            background: "linear-gradient(135deg, var(--indigo), #4F46E5)",
            border: "none",
            boxShadow: "0 0 14px var(--indigo-glow)",
            opacity: (isProcessing || (!textInput.trim() && !transcript.trim())) ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {isProcessing
            ? <Loader2 size={14} color="white" style={{ animation: "rotate-slow 1s linear infinite" }} />
            : <Send size={14} color="white" />
          }
        </motion.button>
      </div>
    </div>
  );
}
