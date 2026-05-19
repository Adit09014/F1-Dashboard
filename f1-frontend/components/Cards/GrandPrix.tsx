"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";
import { getCurrentSchedule, lastYearWinner } from "@/services/jolpica";

export default function GrandPrix() {
  const [nextRace, setNextRace] = useState<any>(null);
  const [lastWinner, setLastWinner] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getCurrentSchedule();
      setNextRace(data);
      const winner = await lastYearWinner(data);
      setLastWinner(winner);
    }
    fetchData();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
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
          <div style={styles.sectionLabel}>Grand Prix</div>
          <div style={styles.raceName}>{nextRace?.raceName ?? "—"}</div>
        </div>

        {/* Body */}
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "stretch",
            p: "0 !important",
            overflow: "hidden",
          }}
        >
          {/* Left: winner info */}
          <div style={styles.leftPanel}>
            <div style={styles.winnerLabel}>Last Year's Winner</div>

            <div style={styles.winnerName}>
              {lastWinner?.Driver?.familyName ?? "—"}
            </div>

            <div style={styles.constructorRow}>
              <div
                style={{
                  ...styles.constructorDot,
                  background: lastWinner ? "#E8002D" : "#2a2a30",
                }}
              />
              <span style={styles.constructorName}>
                {lastWinner?.Constructor?.name ?? "—"}
              </span>
            </div>

            <div style={styles.metaRow}>
              <div style={styles.metaBadge}>
                <span style={styles.metaLabel}>Round</span>
                <span style={styles.metaValue}>{nextRace?.round ?? "—"}</span>
              </div>
              <div style={styles.metaBadge}>
                <span style={styles.metaLabel}>Season</span>
                <span style={styles.metaValue}>{nextRace?.season ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={styles.vertDivider} />

          {/* Right: flag / image */}
          <div style={styles.rightPanel}>
            <img
              src={`/${nextRace?.country?.toLowerCase()}.svg`}
              alt={nextRace?.country ?? "flag"}
              style={styles.flag}
              onError={(e) => {
                // fallback: hide broken image
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div style={styles.countryName}>{nextRace?.country ?? "—"}</div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: "12px 20px",
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
    marginBottom: 2,
  },
  raceName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    letterSpacing: "0.03em",
    color: "#f0f0f4",
    lineHeight: 1.2,
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "16px 20px",
    gap: 4,
  },
  winnerLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginBottom: 4,
  },
  winnerName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 32,
    color: "#f0f0f4",
    letterSpacing: "0.01em",
    lineHeight: 1,
    marginBottom: 4,
  },
  constructorRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  constructorDot: {
    width: 3,
    height: 14,
    borderRadius: 2,
    flexShrink: 0,
  },
  constructorName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: "#7070a0",
    letterSpacing: "0.04em",
  },
  metaRow: {
    display: "flex",
    gap: 8,
  },
  metaBadge: {
    display: "flex",
    flexDirection: "column",
    background: "#111113",
    border: "1px solid #1f1f24",
    borderRadius: 6,
    padding: "4px 10px",
  },
  metaLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#4a4a56",
  },
  metaValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#c0c0cc",
  },
  vertDivider: {
    width: 1,
    background: "#1f1f24",
    alignSelf: "stretch",
    flexShrink: 0,
  },
  rightPanel: {
    width: "38%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 16px",
    background: "#0a0a0c",
  },
  flag: {
    maxHeight: 90,
    maxWidth: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
  },
  countryName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a4a56",
  },
};
