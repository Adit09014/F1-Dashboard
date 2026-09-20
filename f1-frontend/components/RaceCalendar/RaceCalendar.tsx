"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import * as Flags from "country-flag-icons/react/3x2";
import { getSeason } from "@/services/jolpica";

// ─── Constants ────────────────────────────────────────────────────

const CIRCUIT_INFO: Record<string, { laps: number; length: string; turns: number; drsZones: number }> = {
  "albert_park":   { laps: 58,  length: "5.278km", turns: 16, drsZones: 4 },
  "bahrain":       { laps: 57,  length: "5.412km", turns: 15, drsZones: 3 },
  "jeddah":        { laps: 50,  length: "6.174km", turns: 27, drsZones: 3 },
  "miami":         { laps: 57,  length: "5.412km", turns: 19, drsZones: 3 },
  "imola":         { laps: 63,  length: "4.909km", turns: 19, drsZones: 2 },
  "monaco":        { laps: 78,  length: "3.337km", turns: 19, drsZones: 1 },
  "villeneuve":    { laps: 70,  length: "4.361km", turns: 14, drsZones: 2 },
  "catalunya":     { laps: 66,  length: "4.657km", turns: 16, drsZones: 2 },
  "red_bull_ring": { laps: 71,  length: "4.318km", turns: 10, drsZones: 3 },
  "silverstone":   { laps: 52,  length: "5.891km", turns: 18, drsZones: 2 },
  "hungaroring":   { laps: 70,  length: "4.381km", turns: 14, drsZones: 1 },
  "spa":           { laps: 44,  length: "7.004km", turns: 20, drsZones: 2 },
  "zandvoort":     { laps: 72,  length: "4.259km", turns: 14, drsZones: 2 },
  "monza":         { laps: 53,  length: "5.793km", turns: 11, drsZones: 2 },
  "marina_bay":    { laps: 62,  length: "4.940km", turns: 23, drsZones: 3 },
  "suzuka":        { laps: 53,  length: "5.807km", turns: 18, drsZones: 2 },
  "losail":        { laps: 57,  length: "5.380km", turns: 16, drsZones: 2 },
  "americas":      { laps: 56,  length: "5.513km", turns: 20, drsZones: 2 },
  "rodriguez":     { laps: 71,  length: "4.304km", turns: 17, drsZones: 3 },
  "interlagos":    { laps: 71,  length: "4.309km", turns: 15, drsZones: 2 },
  "vegas":         { laps: 50,  length: "6.201km", turns: 17, drsZones: 2 },
  "yas_marina":    { laps: 58,  length: "5.281km", turns: 16, drsZones: 2 },
};

// ─── Country → ISO 3166-1 alpha-2 map ───────────────────────────

const COUNTRY_ISO: Record<string, keyof typeof Flags> = {
  "Australia":     "AU",
  "Bahrain":       "BH",
  "Saudi Arabia":  "SA",
  "Japan":         "JP",
  "China":         "CN",
  "USA":           "US",
  "United States": "US",
  "Italy":         "IT",
  "Monaco":        "MC",
  "Canada":        "CA",
  "Spain":         "ES",
  "Austria":       "AT",
  "UK":            "GB",
  "United Kingdom":"GB",
  "Hungary":       "HU",
  "Belgium":       "BE",
  "Netherlands":   "NL",
  "Singapore":     "SG",
  "Azerbaijan":    "AZ",
  "Mexico":        "MX",
  "Brazil":        "BR",
  "United Arab Emirates": "AE",
  "Qatar":         "QA",
  "Las Vegas":     "US",
};

function FlagIcon({ country, size = 20 }: { country: string; size?: number }) {
  const code = COUNTRY_ISO[country];
  if (!code) return null;
  const Flag = Flags[code] as React.ComponentType<{ style?: React.CSSProperties }>;
  if (!Flag) return null;
  return (
    <Flag style={{
      width: size,
      height: "auto",
      borderRadius: 2,
      display: "block",
      flexShrink: 0,
    }} />
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function isCompleted(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function isNext(races: any[], race: any) {
  const upcoming = races.filter(r => !isCompleted(r.date));
  return upcoming.length > 0 && upcoming[0].round === race.round;
}

// ─── Sub-components ───────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: "#0e0e10", border: "1px solid #1f1f24",
      borderRadius: 8, padding: "8px 14px", flex: 1,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 10, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#4a4a56", marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800, fontSize: 17, color: "#d8d8e0",
      }}>{value}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

export default function RaceCalendar() {
  const [races,         setRaces]         = useState<any[]>([]);
  const [selectedRace,  setSelectedRace]  = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getSeason();
      setRaces(data);
      // Default to next upcoming race
      const upcoming = data.filter((r: any) => !isCompleted(r.date));
      setSelectedRace(upcoming.length > 0 ? upcoming[0] : data[0]);
    }
    fetchData();
  }, []);

  if (!selectedRace) return null;

  const completed    = isCompleted(selectedRace.date);
  const circuitId    = selectedRace.Circuit?.circuitId ?? "";
  const circuitStats = CIRCUIT_INFO[circuitId] ?? null;
  const completedCt  = races.filter(r => isCompleted(r.date)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        .race-row:hover { background: #15151a !important; }
      `}</style>

      <div style={styles.page}>

        {/* ── Page header ─────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.eyebrow}>Race Calendar</div>
            <div style={styles.pageTitle}>2025 Season</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={styles.statPill}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>{completedCt}</span>
              <span style={{ color: "#4a4a56" }}> / {races.length} Completed</span>
            </div>
            <div style={styles.roundBadge}>
              {races.length - completedCt} Remaining
            </div>
          </div>
        </div>

        {/* ── Main card ───────────────────────────────────────── */}
        <Card sx={{
          background: "#0e0e10",
          border: "1px solid #1f1f24",
          borderRadius: 2,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          height: "calc(100vh - 140px)",
        }}>

          {/* ── LEFT: Race list ─────────────────────────────── */}
          <div style={{
            borderRight: "1px solid #1f1f24",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            <TableContainer sx={{
              flex: 1,
              overflow: "auto",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { background: "#0e0e10" },
              "&::-webkit-scrollbar-thumb": { background: "#2a2a30", borderRadius: 2 },
            }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...muiTh, width: 40 }}>#</TableCell>
                    <TableCell sx={{ ...muiTh, width: 32 }}>  </TableCell>
                    <TableCell sx={muiTh}>Race</TableCell>
                    <TableCell sx={{ ...muiTh, textAlign: "right" }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {races.map((race) => {
                    const done     = isCompleted(race.date);
                    const next     = isNext(races, race);
                    const selected = selectedRace.round === race.round;
                    const country  = race.Circuit?.Location?.country ?? "";

                    return (
                      <TableRow
                        key={race.round}
                        onClick={() => setSelectedRace(race)}
                        sx={{
                          cursor: "pointer",
                          borderLeft: selected ? "2px solid #E8002D" : "2px solid transparent",
                          background: selected ? "#15151a" : "transparent",
                          "&:hover": { background: "#15151a" },
                          "&:last-child td": { border: 0 },
                        }}
                      >
                        {/* Round */}
                        <TableCell sx={{
                          ...muiTd,
                          fontWeight: 800,
                          fontSize: 15,
                          color: selected ? "#E8002D" : "#3a3a46",
                          width: 40,
                        }}>
                          {String(race.round).padStart(2, "0")}
                        </TableCell>

                        {/* Flag */}
                        <TableCell sx={{ ...muiTd, width: 32, px: "8px !important" }}>
                          <FlagIcon country={country} size={22} />
                        </TableCell>

                        {/* Race name + country */}
                        <TableCell sx={{ ...muiTd, py: "10px !important" }}>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700, fontSize: 13,
                            color: done ? "#5a5a66" : "#d8d8e0",
                            letterSpacing: "0.02em",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            maxWidth: 180,
                          }}>
                            {race.raceName}
                          </div>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 600, fontSize: 10,
                            color: "#3a3a46", letterSpacing: "0.06em",
                            marginTop: 2, textTransform: "uppercase",
                          }}>
                            {country}
                          </div>
                        </TableCell>

                        {/* Date + status */}
                        <TableCell sx={{ ...muiTd, textAlign: "right" }}>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 600, fontSize: 12, color: "#5a5a66",
                          }}>
                            {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700, fontSize: 10,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: done ? "#22c55e" : next ? "#E8002D" : "#3a3a46",
                            marginTop: 2,
                          }}>
                            {done ? "Done" : next ? "Next" : "Upcoming"}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* ── RIGHT: Selected race detail ──────────────────── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#111113",
          }}>

            {/* Detail header */}
            <div style={styles.detailHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 11,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#E8002D",
                }}>
                  Round {selectedRace.round}
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: completed ? "rgba(34,197,94,0.08)" : isNext(races, selectedRace) ? "rgba(232,0,45,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${completed ? "rgba(34,197,94,0.2)" : isNext(races, selectedRace) ? "rgba(232,0,45,0.2)" : "#2a2a30"}`,
                  color: completed ? "#22c55e" : isNext(races, selectedRace) ? "#E8002D" : "#5a5a66",
                }}>
                  {completed ? "Completed" : isNext(races, selectedRace) ? "Next Race" : "Upcoming"}
                </div>
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 24,
                color: "#f0f0f4", letterSpacing: "0.02em",
                marginTop: 6,
              }}>
                {selectedRace.raceName}
              </div>
            </div>

            {/* Circuit image placeholder */}
            <div style={{
              height: 180,
              background: "#0e0e10",
              borderBottom: "1px solid #1f1f24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Circuit SVG attempt */}
              <img
                src={`/circuits/${selectedRace.Circuit?.circuitId}.png`}
                alt={selectedRace.Circuit?.circuitName}
                style={{
                  maxHeight: 150, maxWidth: "85%",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1) opacity(0.15)",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Circuit name watermark */}
              <div style={{
                position: "absolute",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#2a2a30",
              }}>
                {selectedRace.Circuit?.circuitName}
              </div>
            </div>

            {/* Info grid */}
            <div style={{ padding: "20px 20px 0", flex: 1, overflow: "auto" }}>

              {/* Location row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <StatChip label="Country"  value={selectedRace.Circuit?.Location?.country  ?? "—"} />
                <StatChip label="City"     value={selectedRace.Circuit?.Location?.locality ?? "—"} />
              </div>

              {/* Date + time row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <StatChip label="Race Date" value={formatDate(selectedRace.date)} />
                <StatChip label="Race Time" value={selectedRace.time ? selectedRace.time.slice(0, 5) + " UTC" : "—"} />
              </div>

              {/* Circuit stats */}
              {circuitStats && (
                <div style={{ marginBottom: 12 }}>
                  <div style={styles.sectionDivLabel}>Circuit Stats</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    <StatChip label="Laps"      value={String(circuitStats.laps)}     />
                    <StatChip label="Length"    value={circuitStats.length}           />
                    <StatChip label="Turns"     value={String(circuitStats.turns)}    />
                    <StatChip label="DRS Zones" value={String(circuitStats.drsZones)} />
                  </div>
                </div>
              )}

              {/* Sessions schedule */}
              {selectedRace.FirstPractice && (
                <div style={{ marginBottom: 16 }}>
                  <div style={styles.sectionDivLabel}>Weekend Schedule</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "FP1",        data: selectedRace.FirstPractice    },
                      { label: "FP2",        data: selectedRace.SecondPractice   },
                      { label: "FP3",        data: selectedRace.ThirdPractice    },
                      { label: "Sprint",     data: selectedRace.Sprint           },
                      { label: "Qualifying", data: selectedRace.Qualifying       },
                      { label: "Race",       data: { date: selectedRace.date, time: selectedRace.time } },
                    ]
                      .filter(s => s.data)
                      .map((session) => {
                        const sessionDone = isCompleted(session.data.date);
                        return (
                          <div key={session.label} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "#0e0e10",
                            border: "1px solid #1f1f24",
                            borderRadius: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: sessionDone ? "#22c55e" : "#3a3a46",
                                flexShrink: 0,
                              }} />
                              <span style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontWeight: 700, fontSize: 13,
                                color: sessionDone ? "#5a5a66" : "#c0c0cc",
                                letterSpacing: "0.04em",
                              }}>
                                {session.label}
                              </span>
                            </div>
                            <span style={{
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontWeight: 600, fontSize: 12,
                              color: "#4a4a56",
                            }}>
                              {formatDate(session.data.date)}
                              {session.data.time && ` · ${session.data.time.slice(0, 5)} UTC`}
                            </span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

        </Card>
      </div>
    </>
  );
}

// ─── MUI sx shorthands ───────────────────────────────────────────

const muiTh = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 10, fontWeight: 600,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "#3a3a46", background: "#0e0e10",
  borderBottom: "1px solid #1a1a1e",
  padding: "6px 12px 8px",
};

const muiTd = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700, fontSize: 13,
  color: "#d8d8e0",
  borderBottom: "1px solid #161618",
  padding: "8px 12px",
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
    justifyContent: "space-between", marginBottom: 20,
  },
  eyebrow: {
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
  statPill: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 13, fontWeight: 600,
    letterSpacing: "0.06em",
    background: "#111113", border: "1px solid #1f1f24",
    borderRadius: 6, padding: "4px 12px",
  },
  roundBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12, fontWeight: 600,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "#6b6b78",
    background: "#1a1a1e", border: "1px solid #2a2a30",
    borderRadius: 6, padding: "4px 10px",
  },
  listHeader: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "8px 18px",
    borderBottom: "1px solid #1f1f24",
    background: "#0e0e10",
  },
  listHeaderLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, fontWeight: 600,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#3a3a46",
  },
  detailHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  statusBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    borderRadius: 4, padding: "2px 8px",
  },
  sectionDivLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#3a3a46", marginBottom: 8,
  },
};