"use client";

import {
  Home,
  Trophy,
  Flag,
  Calendar,
  Timer,
  BarChart3,
  Users,
  Settings,
  Cpu,
  Activity,
} from "lucide-react";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { title: "Home",        icon: Home,     href: "/"           },
      { title: "Race Center", icon: Timer,    href: "/race-center" },
      { title: "Prediction",  icon: Cpu,      href: "/prediction" },
    ],
  },
  {
    label: "Standings",
    items: [
      { title: "Driver Standings",      icon: Trophy, href: "/driver-standings"      },
      { title: "Constructor Standings", icon: Users,  href: "/constructor-standings" },
    ],
  },
  {
    label: "Explore",
    items: [
      { title: "Race Calendar", icon: Calendar,  href: "/calendar"   },
      { title: "Circuits",      icon: Flag,      href: "/circuits"   },
      { title: "Telemetry",     icon: Activity,  href: "/telemetry", soon: true },
      { title: "Season Stats",  icon: BarChart3, href: "/analytics", soon: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');
      `}</style>

      <aside
        style={{
          display:        "flex",
          flexDirection:  "column",
          height:         "100vh",
          width:          260,
          flexShrink:     0,
          background:     "#0a0a0c",
          borderRight:    "1px solid #1f1f24",
          padding:        "20px 14px",
          fontFamily:     "'Barlow', sans-serif",
          overflowY:      "auto",
          boxSizing:      "border-box",
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 28 }}>
          <Image src="/F1.svg.png" width={42} height={42} alt="F1 Logo" />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 17, color: "#f0f0f4", letterSpacing: "0.03em" }}>
              F1 Analytics
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 11, color: "#4a4a56", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Live Dashboard
            </div>
          </div>
        </div>

        {/* ── Nav groups ───────────────────────────────────────── */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              <div style={{
                fontFamily:    "'Barlow Condensed', sans-serif",
                fontWeight:    700,
                fontSize:      10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "#3a3a46",
                padding:       "0 10px",
                marginBottom:  6,
              }}>
                {group.label}
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((item) => {
                  const Icon    = item.icon;
                  const active  = pathname === item.href;
                  const soon    = item.soon ?? false;

                  return (
                    <button
                      key={item.href}
                      onClick={() => !soon && router.push(item.href)}
                      disabled={soon}
                      style={{
                        display:        "flex",
                        alignItems:     "center",
                        gap:            10,
                        padding:        "9px 12px",
                        borderRadius:   10,
                        border:         "none",
                        cursor:         soon ? "default" : "pointer",
                        width:          "100%",
                        textAlign:      "left",
                        transition:     "background 0.15s",
                        background:     active ? "#E8002D" : "transparent",
                        opacity:        soon ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!active && !soon)
                          (e.currentTarget as HTMLElement).style.background = "#15151a";
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <Icon
                        size={17}
                        color={active ? "#fff" : "#5a5a66"}
                        strokeWidth={active ? 2.5 : 2}
                      />

                      <span style={{
                        fontFamily:    "'Barlow', sans-serif",
                        fontWeight:    active ? 600 : 500,
                        fontSize:      13.5,
                        color:         active ? "#fff" : "#8a8a96",
                        flex:          1,
                      }}>
                        {item.title}
                      </span>

                      {soon && (
                        <span style={{
                          fontFamily:    "'Barlow Condensed', sans-serif",
                          fontSize:      9,
                          fontWeight:    700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color:         "#3a3a46",
                          background:    "#1a1a1e",
                          border:        "1px solid #2a2a30",
                          borderRadius:  4,
                          padding:       "1px 5px",
                        }}>
                          Soon
                        </span>
                      )}

                      {active && (
                        <span style={{
                          width:        4,
                          height:       4,
                          borderRadius: "50%",
                          background:   "rgba(255,255,255,0.6)",
                          flexShrink:   0,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>


        {/* ── Settings at bottom ───────────────────────────────── */}
        <button
          onClick={() => router.push("/settings")}
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         10,
            padding:     "9px 12px",
            borderRadius: 10,
            border:      "none",
            background:  "transparent",
            cursor:      "pointer",
            width:       "100%",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#15151a";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Settings size={17} color="#3a3a46" strokeWidth={2} />
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize:   13,
            color:      "#3a3a46",
          }}>
            Settings
          </span>
        </button>

        <style>{`
          @keyframes f1pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(0.85); }
          }
        `}</style>
      </aside>
    </>
  );
}