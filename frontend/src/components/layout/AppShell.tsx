"use client";
import Sidebar from "@/components/layout/Sidebar";
import TopBar  from "@/components/layout/TopBar";

interface AppShellProps {
  children:    React.ReactNode;
  pageTitle?:  string;
  wsConnected?: boolean;
}

export default function AppShell({ children, pageTitle, wsConnected = false }: AppShellProps) {
  return (
    /* Full-viewport flex row: sidebar | (topbar + content) */
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-0)" }}>

      <Sidebar wsConnected={wsConnected} />

      {/* Right column: topbar on top, content fills the rest */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar title={pageTitle} wsConnected={wsConnected} />

        {/* Scrollable content area */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
