"use client";

import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  getLastRaceResults,
  getCurrentSchedule,
  getData,
  getBiggestClimber,
  getQualiResult,
  lastYearWinner,
} from "@/services/jolpica";

// ─── Constants ───────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  red_bull:     "#3671C6",
  ferrari:      "#E8002D",
  mclaren:      "#FF8000",
  mercedes:     "#27F4D2",
  aston_martin: "#358C75",
  alpine:       "#FF87BC",
  williams:     "#64C4FF",
  rb:           "#6692FF",
  kick_sauber:  "#52E252",
  haas:         "#B6BABD",
};

const POSITION_COLORS: Record<number, string> = {
  1: "#E8C14A",
  2: "#A8B8C8",
  3: "#CD8B56",
};

const CIRCUIT_INFO: Record<string, { laps: number; length: string; turns: number; firstGP: number; drsZones: number }> = {
  "Circuit de Monaco":              { laps: 78,  length: "3.337km", turns: 19, firstGP: 1950, drsZones: 1 },
  "Circuit Gilles Villeneuve":      { laps: 70,  length: "4.361km", turns: 14, firstGP: 1978, drsZones: 2 },
  "Silverstone Circuit":            { laps: 52,  length: "5.891km", turns: 18, firstGP: 1950, drsZones: 2 },
  "Monza Circuit":                  { laps: 53,  length: "5.793km", turns: 11, firstGP: 1950, drsZones: 2 },
  "Spa-Francorchamps":              { laps: 44,  length: "7.004km", turns: 20, firstGP: 1950, drsZones: 2 },
  "Bahrain International Circuit":  { laps: 57,  length: "5.412km", turns: 15, firstGP: 2004, drsZones: 3 },
  "Suzuka International Racing Course": { laps: 53, length: "5.807km", turns: 18, firstGP: 1987, drsZones: 2 },
};

// ─── Sub-components ───────────────────────────────────────────────

function TeamBar({ constructorId }: { constructorId: string }) {
  return (
    <span style={{
      display: "inline-block", width: 3, height: 16,
      borderRadius: 2, background: TEAM_COLORS[constructorId] ?? "#444",
      marginRight: 8, flexShrink: 0,
    }} />
  );
}

function LiveDot() {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: "#E8002D", display: "inline-block",
      animation: "f1pulse 1.4s ease-in-out infinite",
    }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: 11,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: "#5a5a66", padding: "12px 20px 6px",
    }}>
      {children}
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      background: "#111113", border: "1px solid #1f1f24",
      borderRadius: 8, padding: "8px 14px",
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 10, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#4a4a56", marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: 16,
        color: accent ?? "#d8d8e0",
      }}>{value}</div>
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────

function Countdown({ date, time }: { date: string; time: string }) {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(`${date}T${time}`).getTime();
    const tick = () => {
      const dist = target - Date.now();
      if (dist <= 0) return;
      setTl({
        d: Math.floor(dist / 86400000),
        h: Math.floor((dist % 86400000) / 3600000),
        m: Math.floor((dist % 3600000) / 60000),
        s: Math.floor((dist % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date, time]);

  const units = [
    { label: "Days",    value: tl.d, accent: true  },
    { label: "Hours",   value: tl.h, accent: false },
    { label: "Minutes", value: tl.m, accent: false },
    { label: "Seconds", value: tl.s, accent: false },
  ];

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {units.map((u, i) => (
        <div key={u.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: "#111113", border: "1px solid #1f1f24",
            borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 64,
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 36, lineHeight: 1,
              color: u.accent ? "#E8002D" : "#f0f0f4",
              letterSpacing: "-0.02em",
            }}>
              {String(u.value).padStart(2, "0")}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600, fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#4a4a56", marginTop: 4,
            }}>{u.label}</div>
          </div>
          {i < units.length - 1 && (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 24, color: "#2a2a30",
              marginBottom: 14, animation: "f1tick 1s ease-in-out infinite",
            }}>:</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Results table (shared) ───────────────────────────────────────

function ResultsTable({ rows, colLabel, colValue }: {
  rows: any[];
  colLabel: string;
  colValue: (drv: any) => React.ReactNode;
}) {
  return (
    <TableContainer sx={{
      flex: 1, overflow: "auto",
      "&::-webkit-scrollbar": { width: 4 },
      "&::-webkit-scrollbar-track": { background: "#111" },
      "&::-webkit-scrollbar-thumb": { background: "#2a2a30", borderRadius: 2 },
    }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...muiTh, width: 36 }}>Pos</TableCell>
            <TableCell sx={muiTh}>Driver</TableCell>
            <TableCell sx={{ ...muiTh, textAlign: "right" }}>{colLabel}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((drv, index) => {
            const pos = Number(drv.position);
            const posColor = POSITION_COLORS[pos] ?? "#5a5a66";
            return (
              <TableRow key={index} sx={{
                borderBottom: "1px solid #161618",
                "&:hover": { background: "#15151a" },
                "&:last-child td": { border: 0 },
              }}>
                <TableCell sx={{ ...muiTd, fontWeight: 800, fontSize: 15, color: posColor }}>
                  {pos}
                </TableCell>
                <TableCell sx={{ ...muiTd, display: "flex", alignItems: "center" }}>
                  <TeamBar constructorId={drv.Constructor?.constructorId ?? ""} />
                  <span style={styles.driverName}>{drv.Driver.familyName}</span>
                  <span style={styles.driverAbbr}>{drv.Driver.code}</span>
                </TableCell>
                <TableCell sx={{
                  ...muiTd, textAlign: "right",
                  color: pos === 1 ? "#E8C14A" : pos === 2 ? "#A8B8C8" : pos === 3 ? "#CD8B56" : "#7070a0",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                }}>
                  {colValue(drv)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Page states ──────────────────────────────────────────────────

function UpcomingState({ nextRace, lastRace, lap, climber, lastWinner }: any) {
  const circuit     = CIRCUIT_INFO[nextRace?.raceName] ?? null;
  const teamColor   = TEAM_COLORS[lastWinner?.Constructor?.constructorId] ?? "#E8002D";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 1, flex: 1, overflow: "hidden" }}>

      {/* Left col: last race results */}
      <div style={{ borderRight: "1px solid #1f1f24", display: "flex", flexDirection: "column" }}>
        <SectionLabel>Last Race · {lastRace?.raceName}</SectionLabel>
        <ResultsTable
          rows={lastRace?.Results ?? []}
          colLabel="Pts"
          colValue={(d) => d.points}
        />
      </div>

      {/* Right col */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(4, 1fr)", // four equal sections
          height: "100%",
          overflow: "hidden",
        }}
      >

        {/* Countdown */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f1f24",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={styles.statCardLabel}>⏱ Race Starts In</div>
          <Countdown date={nextRace?.date} time={nextRace?.time ?? "00:00:00Z"} />
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f1f24",
            background: "linear-gradient(135deg, #0e0e10 60%, #110a0a)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Accent Glow */}
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: teamColor,
              opacity: 0.06,
              pointerEvents: "none",
            }}
          />

          <div style={styles.statCardLabel}>🏁 Next Race</div>

          {/* Race Name */}
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "#f0f0f4",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {nextRace?.raceName}
          </div>

          {/* Country + Date */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 16,
            }}
          >
            <div>
              <div style={styles.winnerStatLabel}>Country</div>
              <div style={styles.winnerStatVal}>
                {nextRace?.country ?? "—"}
              </div>
            </div>

            <div>
              <div style={styles.winnerStatLabel}>Date</div>
              <div style={styles.winnerStatVal}>
                {nextRace?.date
                  ? new Date(nextRace.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>

          {/* Last Year Winner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderTop: "1px solid #1f1f24",
              paddingTop: 12,
            }}
          >
            <div
              style={{
                width: 4,
                height: 38,
                borderRadius: 2,
                background: teamColor,
                flexShrink: 0,
              }}
            />

            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#5a5a66",
                }}
              >
                Last Year's Winner
              </div>

              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "#f0f0f4",
                }}
              >
                {lastWinner?.Driver?.givenName} {lastWinner?.Driver?.familyName}
              </div>

              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#5a5a66",
                }}
              >
                {lastWinner?.Constructor?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Fastest Lap */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f1f24",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={styles.statCardLabel}>⚡ Fastest Lap</div>
          <div style={styles.flBadge}>◆ PURPLE SECTOR</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={styles.flDriver}>{lap?.Driver?.familyName ?? "—"}</div>
              <div style={styles.flSub}>Lap {lap?.FastestLap?.lap} · {lap?.Constructor?.name}</div>
            </div>
            <div style={styles.flTime}>{lap?.FastestLap?.Time?.time ?? "—"}</div>
          </div>
        </div>

        {/* Biggest Climber */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={styles.statCardLabel}>↑ Biggest Climber</div>
          <div style={styles.gainBadge}>▲ MOST POSITIONS GAINED</div>
          <div style={styles.climberGain}>+{climber?.gain ?? 0}</div>
          <div style={styles.climberName}>{climber?.Driver?.familyName ?? "—"}</div>
          <div style={styles.climberPositions}>
            <span style={styles.posFrom}>P{climber?.grid}</span>
            <span style={styles.posArrow}>→</span>
            <span style={styles.posTo}>P{climber?.position}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function QualiState({ nextRace, qualiResults, lap }: any) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, flex: 1, overflow: "hidden" }}>

      {/* Left: quali grid */}
      <div style={{ borderRight: "1px solid #1f1f24", display: "flex", flexDirection: "column" }}>
        <SectionLabel>Starting Grid · {nextRace?.raceName}</SectionLabel>
        <ResultsTable
          rows={qualiResults ?? []}
          colLabel="Time"
          colValue={(d) => (
            <span style={{ color: Number(d.position) === 1 ? "#c084fc" : undefined }}>
              {d.Q3 ?? d.Q2 ?? d.Q1 ?? "—"}
            </span>
          )}
        />
      </div>

      {/* Right: prediction placeholder + fastest lap */}
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* Prediction banner */}
        <div style={{
          padding: "20px", borderBottom: "1px solid #1f1f24",
          background: "linear-gradient(135deg, #0e0e10, #130a1a)",
        }}>
          <div style={styles.statCardLabel}>🤖 Race Prediction</div>
          <div style={styles.flBadge}>◆ GRID CONFIRMED — HIGH CONFIDENCE</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, color: "#5a5a66", fontWeight: 600,
            letterSpacing: "0.04em",
          }}>
            Connect prediction API to show winner probabilities
          </div>
        </div>

        {/* Fastest lap from last race */}
        <div style={{ padding: "20px", flex: 1 }}>
          <div style={styles.statCardLabel}>⚡ Last Race Fastest Lap</div>
          <div style={styles.flBadge}>◆ PURPLE SECTOR</div>
          <div style={{ ...styles.fastestLapRow }}>
            <div>
              <div style={styles.flDriver}>{lap?.Driver?.familyName ?? "—"}</div>
              <div style={styles.flSub}>Lap {lap?.FastestLap?.lap} · {lap?.Constructor?.name}</div>
            </div>
            <div style={styles.flTime}>{lap?.FastestLap?.Time?.time ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveState({ raceResults, lap, climber }: any) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, flex: 1, overflow: "hidden" }}>

      {/* Left: live order */}
      <div style={{ borderRight: "1px solid #1f1f24", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px 6px" }}>
          <LiveDot />
          <span style={{ ...styles.panelTitle, padding: 0 }}>Live Race Order</span>
        </div>
        <ResultsTable
          rows={raceResults ?? []}
          colLabel="Gap"
          colValue={(d) => d.Time?.time ?? d.status ?? "—"}
        />
      </div>

      {/* Right: fastest lap + climber */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "20px", borderBottom: "1px solid #1f1f24" }}>
          <div style={styles.statCardLabel}>⚡ Fastest Lap</div>
          <div style={styles.flBadge}>◆ PURPLE SECTOR</div>
          <div style={styles.fastestLapRow}>
            <div>
              <div style={styles.flDriver}>{lap?.Driver?.familyName ?? "—"}</div>
              <div style={styles.flSub}>Lap {lap?.FastestLap?.lap} · {lap?.Constructor?.name}</div>
            </div>
            <div style={styles.flTime}>{lap?.FastestLap?.Time?.time ?? "—"}</div>
          </div>
          {lap?.FastestLap?.AverageSpeed && (
            <div style={styles.sectorRow}>
              <span style={styles.sectorLabel}>AVG</span>
              <span style={styles.sectorTime}>{lap.FastestLap.AverageSpeed.speed} {lap.FastestLap.AverageSpeed.units}</span>
              <span style={styles.sectorLabel}>Rank</span>
              <span style={styles.sectorTime}>#{lap.FastestLap.rank}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: "20px" }}>
          <div style={styles.statCardLabel}>↑ Biggest Climber</div>
          <div style={styles.gainBadge}>▲ MOST POSITIONS GAINED</div>
          <div style={styles.climberGain}>+{climber?.gain}</div>
          <div style={styles.climberName}>{climber?.Driver?.familyName ?? "—"}</div>
          <div style={styles.climberPositions}>
            <span style={styles.posFrom}>P{climber?.grid}</span>
            <span style={styles.posArrow}>→</span>
            <span style={styles.posTo}>P{climber?.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────

export default function RaceCenter() {
  const [session,      setSession]      = useState<any>(null);
  const [nextRace,     setNextRace]     = useState<any>(null);
  const [lastRace,     setLastRace]     = useState<any>(null);
  const [lap,          setLap]          = useState<any>(null);
  const [climber,      setClimber]      = useState<any>(null);
  const [lastWinner,   setLastWinner]   = useState<any>(null);
  const [qualiResults, setQualiResults] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const schedule = await getCurrentSchedule();
        setNextRace(schedule);
        setSession(schedule);

        const race = await getLastRaceResults();
        setLastRace(race);

        const lapData = await getData();
        setLap(lapData);

        const climbData = await getBiggestClimber();
        setClimber(climbData);

        const winner = await lastYearWinner(schedule);
        setLastWinner(winner);

        if (schedule?.status === "Quali_Done") {
          const quali = await getQualiResult(schedule?.raceRound);
          setQualiResults(quali ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const status = session?.status;

  const statusLabel: Record<string, string> = {
    UPCOMING:   "Upcoming Race",
    Quali_Done: "Grid Set · Race Day Tomorrow",
    LIVE:       "Race Live",
    PRACTICE:   "Practice Session",
  };

  if (loading) {
    return (
      <div style={{ ...styles.page }}>
        <div style={{ ...styles.card, height: "80vh", background: "#0e0e10", border: "1px solid #1f1f24" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        @keyframes f1pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes f1tick {
          0%, 45%, 55%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={styles.page}>
        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.pageEyebrow}>Race Center</div>
            <div style={styles.pageTitle}>
              Welcome to the Race Center
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {status === "LIVE" && <LiveDot />}
            <div style={styles.statusBadge}>
              {statusLabel[status] ?? status}
            </div>
            <div style={styles.roundBadge}>
              Round {nextRace?.round} · {nextRace?.season ?? new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div style={styles.card}>

          

          {/* State-specific body */}
          {(status === "UPCOMING" || !status) && (
            <UpcomingState nextRace={nextRace} lastRace={lastRace} lap={lap} climber={climber} lastWinner={lastWinner} />
          )}
          {status === "Quali_Done" && (
            <QualiState nextRace={nextRace} qualiResults={qualiResults} lap={lap} />
          )}
          {status === "LIVE" && (
            <LiveState raceResults={lastRace?.Results} lap={lap} climber={climber} />
          )}
        </div>
      </div>
    </>
  );
}

// ─── MUI sx ──────────────────────────────────────────────────────

const muiTh = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 11, fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "#4a4a56", background: "#0e0e10",
  borderBottom: "1px solid #1a1a1e",
  padding: "4px 16px 8px",
};

const muiTd = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700, fontSize: 14,
  color: "#d8d8e0",
  borderBottom: "1px solid #161618",
  padding: "8px 16px",
};

// ─── Styles ───────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "28px 32px",
    fontFamily: "'Barlow', sans-serif",
    color: "#e8e8ec",
    minHeight: "100vh",
    background: "#080809",
  },
  pageHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageEyebrow: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, fontSize: 11,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#E8002D", marginBottom: 4,
  },
  pageTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: 32,
    letterSpacing: "0.02em", color: "#f0f0f4",
  },
  statusBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#E8002D",
    background: "rgba(232,0,45,0.08)",
    border: "1px solid rgba(232,0,45,0.2)",
    borderRadius: 6, padding: "3px 10px",
  },
  roundBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6b6b78",
    background: "#1a1a1e", border: "1px solid #2a2a30",
    borderRadius: 6, padding: "3px 10px",
  },
  card: {
    background: "#0e0e10",
    border: "1px solid #1f1f24",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 140px)",
  },
  cardHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
  },
  cardHeaderLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#4a4a56", marginBottom: 2,
  },
  cardHeaderValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, fontSize: 14, color: "#c0c0cc",
  },
  panelTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, fontSize: 11,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#5a5a66", padding: "10px 16px 6px",
  },
  driverName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, fontSize: 14,
    letterSpacing: "0.02em", color: "#d8d8e0",
  },
  driverAbbr: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600, fontSize: 11,
    letterSpacing: "0.08em", color: "#5a5a66", marginLeft: 4,
  },
  statCardLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11, fontWeight: 700,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#4a4a56", marginBottom: 8,
  },
  flBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#2a1040", border: "1px solid #5a30a0",
    borderRadius: 4, padding: "2px 8px",
    fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, letterSpacing: "0.1em",
    color: "#c084fc", marginBottom: 8,
  },
  fastestLapRow: {
    display: "flex", alignItems: "baseline",
    justifyContent: "space-between", marginTop: 4,
  },
  flDriver: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: 24,
    color: "#c084fc", letterSpacing: "0.02em",
  },
  flSub: {
    fontSize: 11, color: "#4a4a56", marginTop: 4,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600, letterSpacing: "0.06em",
  },
  flTime: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, fontSize: 18,
    color: "#d0d0e0", letterSpacing: "0.05em",
    background: "#18181e", border: "1px solid #2a2a36",
    borderRadius: 8, padding: "4px 10px",
  },
  sectorRow: {
    background: "#1a1820", border: "1px solid #2a2636",
    borderRadius: 8, marginTop: 12, padding: "8px 12px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  sectorLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11, fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a5a66",
  },
  sectorTime: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 13, fontWeight: 700, color: "#c084fc",
  },
  gainBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#0f2a18", border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: 4, padding: "2px 8px",
    fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700, letterSpacing: "0.1em",
    color: "#22c55e", marginBottom: 8,
  },
  climberGain: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: 48,
    lineHeight: 1, color: "#22c55e",
    letterSpacing: "-0.01em", marginBottom: 2,
  },
  climberName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: 22,
    color: "#e0e0ec", letterSpacing: "0.02em", marginBottom: 6,
  },
  climberPositions: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600, fontSize: 14,
  },
  posFrom: {
    color: "#5a5a66", background: "#1a1a1e",
    borderRadius: 4, padding: "2px 8px",
  },
  posArrow: { color: "#22c55e", fontSize: 16 },
  winnerStatChip: {
    display: "flex",
    flexDirection: "column" as const,
    background: "#111113",
    border: "1px solid #1f1f24",
    borderRadius: 6,
    padding: "4px 10px",
  },
  winnerStatLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#4a4a56",
  },
  winnerStatVal: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#c0c0cc",
  },
  posTo: {
    color: "#22c55e", background: "#0f2a18",
    border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: 4, padding: "2px 8px",
  },
};