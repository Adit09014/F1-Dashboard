"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getDriverStandings } from "@/services/jolpica";

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

export default function DriverStandingsCard() {
  const [driver, setDriver] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getDriverStandings();
      setDriver(data);
    }
    fetchData();
  }, []);

  const maxPoints = driver[0]?.points ? Number(driver[0].points) : 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
      `}</style>

      <Card
        sx={{
          height: 660,
          background: "#0e0e10",
          border: "1px solid #818181",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Barlow', sans-serif",
          color: "#e8e8ec",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.sectionLabel}>Season Standings</div>
            <div style={styles.title}>Driver Championship</div>
          </div>
          <div style={styles.roundBadge}>2025</div>
        </div>

        {/* Table */}
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
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...muiTh, width: 48 }}>Pos</TableCell>
                <TableCell sx={muiTh}>Driver</TableCell>
                <TableCell sx={{ ...muiTh, textAlign: "right", width: 72 }}>
                  Pts
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {driver.map((drv, index) => {
                const pos = Number(drv.position);
                const posColor = POSITION_COLORS[pos] ?? "#5a5a66";
                const teamColor =
                  TEAM_COLORS[drv.Constructors?.[0]?.constructorId] ?? "#444";
                const pts = Number(drv.points);
                const barWidth = Math.round((pts / maxPoints) * 100);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      borderBottom: "1px solid #161618",
                      "&:hover": { background: "#15151a" },
                      "&:last-child td": { border: 0 },
                    }}
                  >
                    {/* Position */}
                    <TableCell
                      sx={{
                        ...muiTd,
                        fontWeight: 800,
                        fontSize: 16,
                        color: posColor,
                        width: 48,
                      }}
                    >
                      {pos}
                    </TableCell>

                    {/* Driver */}
                    <TableCell sx={{ ...muiTd, py: "10px !important" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 3,
                            height: 18,
                            borderRadius: 2,
                            background: teamColor,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <span style={styles.driverName}>
                            {drv.Driver.familyName}
                          </span>
                          <span style={styles.driverGiven}>
                            {" "}
                            {drv.Driver.givenName}
                          </span>
                        </div>
                        {pos <= 3 && (
                          <span
                            style={{
                              ...styles.medalBadge,
                              background: `${posColor}18`,
                              border: `1px solid ${posColor}40`,
                              color: posColor,
                            }}
                          >
                            {pos === 1 ? "LEADER" : `P${pos}`}
                          </span>
                        )}
                      </div>

                      {/* Constructor + bar */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={styles.constructorName}>
                          {drv.Constructors?.[0]?.name ?? "—"}
                        </span>
                        <div style={{ flex: 1, ...styles.barTrack }}>
                          <div
                            style={{
                              ...styles.barFill,
                              width: `${barWidth}%`,
                              background: teamColor,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Points */}
                    <TableCell
                      sx={{
                        ...muiTd,
                        textAlign: "right",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color:
                          pos === 1
                            ? "#E8C14A"
                            : pos === 2
                              ? "#A8B8C8"
                              : pos === 3
                                ? "#CD8B56"
                                : "#7070a0",
                        width: 72,
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

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>{driver.length} Drivers</span>
          <span style={styles.footerText}>
            Leader:{" "}
            <span style={{ color: "#E8C14A", fontWeight: 700 }}>
              {driver[0]?.Driver?.familyName}
            </span>
            {" · "}
            {driver[0]?.points} pts
          </span>
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
  padding: "6px 16px 10px",
};

const muiTd = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: "#d8d8e0",
  borderBottom: "1px solid #161618",
  padding: "8px 16px",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  sectionLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#E8002D",
    marginBottom: 3,
  },
  title: {
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
  driverName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    letterSpacing: "0.02em",
    color: "#d8d8e0",
  },
  driverGiven: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: "#5a5a66",
  },
  constructorName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.06em",
    color: "#4a4a56",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  },
  medalBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    borderRadius: 4,
    padding: "1px 6px",
  },
  barTrack: {
    height: 3,
    background: "#1f1f24",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    opacity: 0.6,
    transition: "width 0.5s ease",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    borderTop: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  footerText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#4a4a56",
  },
};
