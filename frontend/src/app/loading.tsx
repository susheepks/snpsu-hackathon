export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "var(--bg-0, #050710)",
      flexDirection: "column",
      gap: 16,
    }}>
      {/* Pulsing orb */}
      <div style={{ position: "relative", width: 60, height: 60 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 0 40px rgba(99,102,241,0.5)",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>
      <p style={{
        color: "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontFamily: "monospace",
        letterSpacing: "0.1em",
      }}>
        LOADING...
      </p>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
