"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
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



function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <Typography
        sx={{
          fontSize: 11,
          color: "#5a5a66",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 20,
          fontWeight: 700,
          color: "#f0f0f4",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {value}
      </Typography>
    </div>
  );
}

export default function DriverStandingsCard() {
  const [driver, setDriver] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  

  useEffect(() => {
    async function fetchData() {
      const data = await getDriverStandings();
      setDriver(data);
      setSelectedDriver(data[0]);
    }
    fetchData();
  }, []);

  const maxPoints = driver[0]?.points ? Number(driver[0].points) : 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
      `}</style>

      {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.sectionLabel}>Season Standings</div>
            <div style={styles.title}>Driver Championship</div>
          </div>
          <div style={styles.roundBadge}>2025</div>
        </div>

      <Card
        sx={{
          height: "840px",
          background: "#0e0e10",
          border: "1px solid #818181",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Barlow', sans-serif",
          color: "#e8e8ec",
        }}
      >

        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                flex: 1,
                overflow: "hidden",
            }}
        >

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
                    onClick={() => setSelectedDriver(drv)}
                    key={index}
                    sx={{
                        cursor: "pointer",
                        background:
                            selectedDriver?.Driver.driverId === drv.Driver.driverId
                                ? "#18181e"
                                : "transparent",

                        "&:hover": {
                            background: "#15151a",
                        },
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

        <div
  style={{
    borderLeft: "1px solid #1f1f24",
    background: "#111113",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  {/* Driver Banner */}
  <div
    style={{
      position: "relative",
      padding: "24px 20px",
      background: `linear-gradient(135deg,#111113 55%,${
        TEAM_COLORS[selectedDriver?.Constructors?.[0]?.constructorId] ?? "#222"
      }22)`,
      borderBottom: "1px solid #1f1f24",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Image
      src={`/${selectedDriver?.Driver.familyName}.webp`}
      alt={selectedDriver?.Driver.familyName}
      width={170}
      height={170}
      style={{
        objectFit: "contain",
      }}
    />

    <Typography
      sx={{
        mt: 1,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 30,
        color: "#f0f0f4",
        lineHeight: 1,
      }}
    >
      {selectedDriver?.Driver.givenName}
    </Typography>

    <Typography
      sx={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 34,
        color: "#fff",
        lineHeight: 1,
      }}
    >
      {selectedDriver?.Driver.familyName}
    </Typography>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
      }}
    >
      <div
        style={{
          width: 4,
          height: 22,
          borderRadius: 2,
          background:
            TEAM_COLORS[
              selectedDriver?.Constructors?.[0]?.constructorId
            ] ?? "#444",
        }}
      />

      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: "#d8d8e0",
        }}
      >
        {selectedDriver?.Constructors?.[0]?.name}
      </Typography>
    </div>
  </div>

  {/* Driver Stats */}
  <div
    style={{
      flex: 1,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        rowGap: 18,
        columnGap: 16,
      }}
    >
      <Stat
        label="POSITION"
        value={`P${selectedDriver?.position}`}
      />

      <Stat
        label="POINTS"
        value={selectedDriver?.points}
      />

      <Stat
        label="NUMBER"
        value={selectedDriver?.Driver?.permanentNumber ?? "--"}
      />

      <Stat
        label="NATIONALITY"
        value={selectedDriver?.Driver?.nationality}
      />
    </div>

    <div style={{ marginTop: 28 }}>
      <Typography
        sx={{
          fontSize: 12,
          color: "#5a5a66",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        Championship Progress
      </Typography>

      <div
        style={{
          height: 8,
          background: "#1f1f24",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${
              (Number(selectedDriver?.points) / maxPoints) * 100
            }%`,
            height: "100%",
            background:
              TEAM_COLORS[
                selectedDriver?.Constructors?.[0]?.constructorId
              ] ?? "#444",
            borderRadius: 5,
          }}
        />
      </div>

      <Typography
        sx={{
          mt: 1,
          color: "#cfcfd4",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {selectedDriver?.points} pts
      </Typography>
    </div>
  </div>
</div>  

        </div>

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
