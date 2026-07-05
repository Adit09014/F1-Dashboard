"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { getSession } from "@/services/jolpica";
import { getLastRaceResults } from "@/services/jolpica";
import { getData } from "@/services/jolpica";
import { getBiggestClimber } from "@/services/jolpica";
import { getQualiResult } from "@/services/jolpica";

// Team colors mapped by constructor ID
const TEAM_COLORS: Record<string, string> = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
  mercedes: "#27F4D2",
  aston_martin: "#358C75",
  alpine: "#FF87BC",
  williams: "#64C4FF",
  rb: "#6692FF",
  kick_sauber: "#52E252",
  haas: "#B6BABD",
};

const POSITION_COLORS: Record<number, string> = {
  1: "#E8C14A",
  2: "#A8B8C8",
  3: "#CD8B56",
};

function TeamBar({ constructorId }: { constructorId: string }) {
  const color = TEAM_COLORS[constructorId] ?? "#444";
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: 16,
        borderRadius: 2,
        background: color,
        verticalAlign: "middle",
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

function LiveDot() {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#E8002D",
        display: "inline-block",
        animation: "f1pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

export default function LiveCard() {
  const [session, setSession] = useState<any>(null);
  const [driver, setDriver] = useState<any[]>([]);
  const [lap, setLap] = useState<any>(null);
  const [climber, setClimber] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRace, setLastRace] = useState<any>(null);
  const [qualiResults, setQualiResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getSession();
        setSession(data);

        const grid = await getLastRaceResults();
        setDriver(grid.Results);
        setLastRace(grid);

        const lapTime = await getData();
        setLap(lapTime);

        const climb = await getBiggestClimber();
        setClimber(climb);

        // Only fetch quali if session says it's done
        if (data?.status === "Quali_Done") {
          const qualiData = await getQualiResult(data?.raceRound);
          console.log(data)
          await console.log(qualiData)
          setQualiResults(qualiData ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{ height: 440, background: "#0e0e10", border: "1px solid #1f1f24" }}
      />
    );
  }

  if (!session) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        @keyframes f1pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>

      <Card
        sx={{
          height: 440,
          background: "#0e0e10",
          border: "1px solid #818181",
          overflow: "hidden",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {session.status === "LIVE" && <LiveDot />}
            <div>
              <div style={styles.raceLabel}>
                {session.status === "UPCOMING"
                  ? "Last Race Result"
                  : "Race Result"}
              </div>
              <div style={styles.raceName}>{lastRace.raceName}</div>
            </div>
          </div>
          <div style={styles.roundBadge}>
            Round {lastRace.round} · {lastRace.season}
          </div>
        </div>

        {/* Body — fills remaining height (440 - 57px header) */}
        <div style={{ display: "flex", height: "calc(100% - 57px)" }}>
          {/* Left: scrollable results table — 65% */}
          <div
            style={{
              width: "65%",
              borderRight: "1px solid #1f1f24",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {session.status === "UPCOMING" && (
              <>
                <div style={styles.panelTitle}>Race Classification</div>
                <TableContainer
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-track": { background: "#111" },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#2a2a30",
                      borderRadius: 2,
                    },
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...muiTh, width: 36 }}>Pos</TableCell>
                        <TableCell sx={muiTh}>Driver</TableCell>
                        <TableCell sx={{ ...muiTh, textAlign: "right" }}>
                          Pts
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {driver.map((drv, index) => {
                        const pos = Number(drv.position);
                        const posColor = POSITION_COLORS[pos] ?? "#5a5a66";
                        return (
                          <TableRow
                            key={index}
                            sx={{
                              borderBottom: "1px solid #161618",
                              "&:hover": { background: "#15151a" },
                              "&:last-child td": { border: 0 },
                            }}
                          >
                            <TableCell
                              sx={{
                                ...muiTd,
                                fontWeight: 800,
                                fontSize: 15,
                                color: posColor,
                                width: 36,
                              }}
                            >
                              {pos}
                            </TableCell>
                            <TableCell
                              sx={{
                                ...muiTd,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <TeamBar
                                constructorId={
                                  drv.Constructor?.constructorId ?? ""
                                }
                              />
                              <span style={styles.driverName}>
                                {drv.Driver.familyName}
                              </span>
                              <span style={styles.driverAbbr}>
                                {drv.Driver.code}
                              </span>
                            </TableCell>
                            <TableCell
                              sx={{
                                ...muiTd,
                                textAlign: "right",
                                color:
                                  pos === 1
                                    ? "#E8C14A"
                                    : pos === 2
                                      ? "#A8B8C8"
                                      : pos === 3
                                        ? "#CD8B56"
                                        : "#7070a0",
                              }}
                            >
                              {drv.points}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {session.status === "Quali_Done" && (
              <>
                <div style={styles.panelTitle}>Race Classification</div>
                <TableContainer
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-track": { background: "#111" },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#2a2a30",
                      borderRadius: 2,
                    },
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...muiTh, width: 36 }}>Pos</TableCell>
                        <TableCell sx={muiTh}>Driver</TableCell>
                        <TableCell sx={{ ...muiTh, textAlign: "right" }}>
                          Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {qualiResults.map((drv, index) => {
                        const pos = Number(drv.position);
                        const posColor = POSITION_COLORS[pos] ?? "#5a5a66";
                        return (
                          <TableRow
                            key={index}
                            sx={{
                              borderBottom: "1px solid #161618",
                              "&:hover": { background: "#15151a" },
                              "&:last-child td": { border: 0 },
                            }}
                          >
                            <TableCell
                              sx={{
                                ...muiTd,
                                fontWeight: 800,
                                fontSize: 15,
                                color: posColor,
                                width: 36,
                              }}
                            >
                              {pos}
                            </TableCell>
                            <TableCell
                              sx={{
                                ...muiTd,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <TeamBar
                                constructorId={
                                  drv.Constructor?.constructorId ?? ""
                                }
                              />
                              <span style={styles.driverName}>
                                {drv.Driver.familyName}
                              </span>
                              <span style={styles.driverAbbr}>
                                {drv.Driver.code}
                              </span>
                            </TableCell>
                            <TableCell
                              sx={{
                                ...muiTd,
                                textAlign: "right",
                                color:
                                  pos === 1
                                    ? "#c084fc"
                                    : pos <= 3
                                      ? "#E8C14A"
                                      : "#7070a0",
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontWeight: 700,
                              }}
                            >
                              {drv.Q3 ?? drv.Q2 ?? drv.Q1 ?? "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </div>

          {/* Right: two stat cards stacked — 35% */}
          <div
            style={{
              width: "35%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Fastest Lap */}
            <CardContent
              sx={{
                flex: 1,
                borderBottom: "1px solid #1f1f24",
                p: "10px 22px !important",
                overflow: "hidden",
              }}
            >
              <div style={styles.statCardLabel}>⚡ Fastest Lap</div>
              <div style={styles.flBadge}>◆ PURPLE SECTOR</div>
              <div style={styles.fastestLapRow}>
                <div>
                  <div style={styles.flDriver}>
                    {lap?.Driver?.familyName ?? "—"}
                  </div>
                  <div style={styles.flSub}>
                    Lap {lap?.FastestLap?.lap} · {lap?.Constructor?.name}
                  </div>
                </div>
                <div style={styles.flTime}>
                  {lap?.FastestLap?.Time?.time ?? "—"}
                </div>
              </div>
              {lap?.FastestLap?.AverageSpeed && (
                <div style={styles.sectorRow}>
                  <span style={styles.sectorLabel}>AVG</span>
                  <span style={styles.sectorTime}>
                    {lap.FastestLap.AverageSpeed.speed}{" "}
                    {lap.FastestLap.AverageSpeed.units}
                  </span>
                  <span style={styles.sectorLabel}>Rank</span>
                  <span style={styles.sectorTime}>#{lap.FastestLap.rank}</span>
                </div>
              )}
            </CardContent>

            {/* Biggest Climber */}
            <CardContent
              sx={{ flex: 1, p: "18px 22px !important", overflow: "hidden" }}
            >
              <div style={styles.statCardLabel}>↑ Biggest Climber</div>
              <div style={styles.gainBadge}>▲ MOST POSITIONS GAINED</div>
              <div style={styles.climberGain}>+{climber?.gain}</div>
              <div style={styles.climberName}>
                {climber?.Driver?.familyName ?? "—"}
              </div>
              <div style={styles.climberPositions}>
                <span style={styles.posFrom}>P{climber?.grid}</span>
                <span style={styles.posArrow}>→</span>
                <span style={styles.posTo}>P{climber?.position}</span>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </>
  );
}

// ─── MUI sx shorthands ───────────────────────────────────────────────────────

const muiTh = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#4a4a56",
  background: "#0e0e10",
  borderBottom: "1px solid #1a1a1e",
  padding: "4px 16px 8px",
};

const muiTd = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: "#d8d8e0",
  borderBottom: "1px solid #161618",
  padding: "8px 16px",
};

// ─── Inline styles ────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    height: 57,
    boxSizing: "border-box",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  raceLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#E8002D",
  },
  raceName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    letterSpacing: "0.03em",
    color: "#f0f0f4",
  },
  roundBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6b6b78",
    background: "#1a1a1e",
    border: "1px solid #2a2a30",
    borderRadius: 6,
    padding: "3px 10px",
  },
  panelTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#5a5a66",
    padding: "10px 16px 6px",
  },
  driverName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.02em",
    color: "#d8d8e0",
  },
  driverAbbr: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.08em",
    color: "#5a5a66",
    marginLeft: 4,
  },
  statCardLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginBottom: 8,
  },
  flBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#2a1040",
    border: "1px solid #5a30a0",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 11,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#c084fc",
    marginBottom: 8,
  },
  fastestLapRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 4,
  },
  flDriver: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 24,
    color: "#c084fc",
    letterSpacing: "0.02em",
  },
  flSub: {
    fontSize: 11,
    color: "#4a4a56",
    marginTop: 4,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    letterSpacing: "0.06em",
  },
  flTime: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    color: "#d0d0e0",
    letterSpacing: "0.05em",
    background: "#18181e",
    border: "1px solid #2a2a36",
    borderRadius: 8,
    padding: "4px 10px",
  },
  sectorRow: {
    background: "#1a1820",
    border: "1px solid #2a2636",
    borderRadius: 8,
    marginTop: 12,
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectorLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5a5a66",
  },
  sectorTime: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: "#c084fc",
  },
  gainBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "#0f2a18",
    border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 11,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#22c55e",
    marginBottom: 8,
  },
  climberGain: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 48,
    lineHeight: 1,
    color: "#22c55e",
    letterSpacing: "-0.01em",
    marginBottom: 2,
  },
  climberName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    color: "#e0e0ec",
    letterSpacing: "0.02em",
    marginBottom: 6,
  },
  climberPositions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 14,
  },
  posFrom: {
    color: "#5a5a66",
    background: "#1a1a1e",
    borderRadius: 4,
    padding: "2px 8px",
  },
  posArrow: {
    color: "#22c55e",
    fontSize: 16,
  },
  posTo: {
    color: "#22c55e",
    background: "#0f2a18",
    border: "1px solid rgba(34,197,94,0.25)",
    borderRadius: 4,
    padding: "2px 8px",
  },
};
