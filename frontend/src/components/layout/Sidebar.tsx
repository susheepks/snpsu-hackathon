"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, LayoutDashboard, ListChecks, Settings } from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: <LayoutDashboard size={18} />, tip: "Mission Control" },
  { href: "/missions",  icon: <ListChecks size={18} />,     tip: "Missions"         },
  { href: "/settings",  icon: <Settings size={18} />,       tip: "Settings"         },
];

export default function Sidebar({ wsConnected }: { wsConnected?: boolean }) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 60,
      minWidth: 60,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 0",
      background: "var(--bg-1)",
      borderRight: "1px solid var(--border-subtle)",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        width: 36, height: 36, borderRadius: 10,
        background: "linear-gradient(135deg, var(--indigo), var(--violet))",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 16px var(--indigo-glow)",
        marginBottom: 20, flexShrink: 0,
      }}>
        <Zap size={16} color="white" />
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, width: "100%", alignItems: "center", padding: "0 10px" }}>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="sidebar-item" style={{ position: "relative" }}>
              {active && (
                <motion.div layoutId="nav-active" style={{
                  position: "absolute", inset: 0, borderRadius: 10,
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }} transition={{ type: "spring", bounce: 0.2, duration: 0.35 }} />
              )}
              <span style={{ position: "relative", zIndex: 1, color: active ? "var(--indigo)" : "var(--text-2)" }}>
                {item.icon}
              </span>
              <span className="tooltip">{item.tip}</span>
            </Link>
          );
        })}
      </nav>

      {/* WS dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: wsConnected ? "var(--emerald)" : "var(--rose)",
          boxShadow: wsConnected ? "0 0 8px var(--emerald-glow)" : "0 0 8px var(--rose-glow)",
        }} />
        <span className="font-mono" style={{ fontSize: 8, color: "var(--text-2)" }}>
          {wsConnected ? "LIVE" : "OFF"}
        </span>
      </div>
    </aside>
  );
}
