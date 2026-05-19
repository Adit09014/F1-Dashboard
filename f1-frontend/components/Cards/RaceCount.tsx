"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";
import { getCurrentSchedule } from "@/services/jolpica";

export default function NextRaceCountdown() {
  const [nextRace, setNextRace] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const data = await getCurrentSchedule();
      setNextRace(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!nextRace) return;
    const nextRaceDate = new Date(`${nextRace.date}T${nextRace.time}`);
    const interval = setInterval(() => {
      const distance = nextRaceDate.getTime() - new Date().getTime();
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  const units = [
    { label: "Days", value: timeLeft.days, accent: true },
    { label: "Hours", value: timeLeft.hours, accent: false },
    { label: "Minutes", value: timeLeft.minutes, accent: false },
    { label: "Seconds", value: timeLeft.seconds, accent: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        @keyframes f1tick {
          0%   { opacity: 1; }
          45%  { opacity: 1; }
          50%  { opacity: 0.3; }
          55%  { opacity: 1; }
          100% { opacity: 1; }
        }
        .f1-colon { animation: f1tick 1s ease-in-out infinite; }
      `}</style>

      <Card
        sx={{
          height: 220,
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
          <div style={styles.headerLeft}>
            <div style={styles.liveDot} />
            <div>
              <div style={styles.sectionLabel}>Next Session</div>
              <div style={styles.raceName}>{nextRace?.country ?? "—"}</div>
            </div>
          </div>
          <div style={styles.roundBadge}>{nextRace?.name ?? "—"}</div>
        </div>

        {/* Countdown */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            p: "0 20px !important",
            gap: 0,
          }}
        >
          {units.map((unit, i) => (
            <div key={unit.label} style={styles.unitRow}>
              <div style={styles.unitBlock}>
                <div
                  style={{
                    ...styles.unitValue,
                    color: unit.accent ? "#E8002D" : "#f0f0f4",
                  }}
                >
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div style={styles.unitLabel}>{unit.label}</div>
              </div>
              {i < units.length - 1 && (
                <div className="f1-colon" style={styles.colon}>
                  :
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#E8002D",
    animation: "f1pulse 1.4s ease-in-out infinite",
    flexShrink: 0,
  },
  sectionLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#E8002D",
  },
  raceName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    letterSpacing: "0.03em",
    color: "#f0f0f4",
    lineHeight: 1.2,
  },
  roundBadge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b6b78",
    background: "#1a1a1e",
    border: "1px solid #2a2a30",
    borderRadius: 6,
    padding: "3px 10px",
    whiteSpace: "nowrap",
  },
  unitRow: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  unitBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#111113",
    border: "1px solid #1f1f24",
    borderRadius: 10,
    padding: "10px 6px 8px",
  },
  unitValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 40,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  unitLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginTop: 4,
  },
  colon: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color: "#2a2a30",
    padding: "0 6px",
    marginBottom: 14,
    flexShrink: 0,
  },
};
