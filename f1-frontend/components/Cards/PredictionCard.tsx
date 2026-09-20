"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";
import { getSession } from "@/services/jolpica";

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

interface DriverPrediction {
  driver_number: number;
  code: string;
  name: string;
  team: string;
  team_key: string;
  grid: number;
  position: number;
  pre_race_win_prob: number;
  mid_race_win_prob: number;
}

export default function PredictionCard() {
  const [isRaceLive, setIsRaceLive] = useState<boolean>(false);
  const [lapNumber, setLapNumber] = useState<number>(25);
  const [totalLaps, setTotalLaps] = useState<number>(57);
  const [loading, setLoading] = useState<boolean>(true);
  const [predictions, setPredictions] = useState<{
    pre_race: DriverPrediction[];
    mid_race: DriverPrediction[];
  }>({ pre_race: [], mid_race: [] });

  // Check if race is live
  useEffect(() => {
    async function checkSession() {
      try {
        const sess = await getSession();
        setIsRaceLive(sess?.status === "Live");
      } catch {
        setIsRaceLive(false);
      }
    }
    checkSession();
  }, []);

  // Fetch predictions from model API
  useEffect(() => {
    async function fetchPredictions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/predict?lap=${lapNumber}&total=${totalLaps}`);
        const data = await res.json();
        if (data.status === "success" && data.predictions) {
          setPredictions(data.predictions);
        }
      } catch (err) {
        console.error("Failed to fetch predictions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [lapNumber, totalLaps]);

  const activeList = isRaceLive ? predictions.mid_race : predictions.pre_race;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        @keyframes f1pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pred-live-dot { animation: f1pulse 1.4s ease-in-out infinite; }
        .pred-scroll::-webkit-scrollbar { width: 3px; }
        .pred-scroll::-webkit-scrollbar-track { background: transparent; }
        .pred-scroll::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 2px; }
      `}</style>

      <Card
        sx={{
          height: 440,
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isRaceLive && <div className="pred-live-dot" style={styles.liveDot} />}
            <div>
              <div style={styles.sectionLabel}>
                {isRaceLive ? "Live Race Predictions" : "Race Win Predictor"}
              </div>
              <div style={styles.raceName}>
                {isRaceLive ? "On Track Now" : "Next Grand Prix"}
              </div>
            </div>
          </div>
          <div style={styles.roundBadge}>
            {isRaceLive ? "LIVE" : "PRE-RACE"}
          </div>
        </div>

        {/* Sub-header: Model info */}
        <div style={styles.subHeader}>
          <span style={styles.subLabel}>XGBoost ML Engine</span>
          <span style={styles.subDot} />
          <span style={styles.subLabel}>
            {isRaceLive ? "Mid-Race Telemetry Model" : "Qualifying Grid Model"}
          </span>
          <span style={styles.subDot} />
          <span style={{ ...styles.subLabel, color: "#E8002D" }}>
            {isRaceLive ? "97.9% ROC-AUC" : "91.2% ROC-AUC"}
          </span>
        </div>

        {/* Driver Leaderboard */}
        <CardContent
          className="pred-scroll"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: "12px 16px !important",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {loading && activeList.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={styles.skeletonRow} />
              ))
            : activeList.map((driver, index) => {
                const prob = isRaceLive
                  ? driver.mid_race_win_prob
                  : driver.pre_race_win_prob;
                const teamColor = TEAM_COLORS[driver.team_key] || "#E8002D";
                const rank = index + 1;
                const isTop = rank <= 3;

                return (
                  <div key={driver.driver_number} style={styles.driverRow}>
                    {/* Team color stripe */}
                    <div
                      style={{
                        ...styles.teamStripe,
                        backgroundColor: teamColor,
                      }}
                    />

                    {/* Position */}
                    <div
                      style={{
                        ...styles.positionText,
                        color:
                          rank === 1
                            ? "#E8C14A"
                            : rank === 2
                            ? "#A8B8C8"
                            : rank === 3
                            ? "#CD8B56"
                            : "#3a3a46",
                      }}
                    >
                      P{rank}
                    </div>

                    {/* Driver code + last name */}
                    <div style={styles.driverInfo}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={styles.driverCode}>{driver.code}</span>
                        <span style={styles.driverLastName}>
                          {driver.name.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                      <div style={styles.driverTeam}>{driver.team}</div>
                    </div>

                    {/* Grid position pill */}
                    <div style={styles.gridPill}>P{driver.grid}</div>

                    {/* Probability bar + value */}
                    <div style={styles.probSection}>
                      <div style={styles.barTrack}>
                        <div
                          style={{
                            ...styles.barFill,
                            width: `${Math.min(100, Math.max(3, prob))}%`,
                            background: isTop
                              ? `linear-gradient(90deg, ${teamColor}, #E8002D)`
                              : "#2a2a30",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          ...styles.probValue,
                          color: prob > 20 ? "#f0f0f4" : "#5a5a66",
                        }}
                      >
                        {prob.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
        </CardContent>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerItem}>
            <div style={styles.footerLabel}>Model</div>
            <div style={styles.footerValue}>
              {isRaceLive ? "Mid-Race" : "Pre-Race"}
            </div>
          </div>
          <div style={styles.footerDot} />
          <div style={styles.footerItem}>
            <div style={styles.footerLabel}>Features</div>
            <div style={styles.footerValue}>{isRaceLive ? "10" : "4"}</div>
          </div>
          <div style={styles.footerDot} />
          <div style={styles.footerItem}>
            <div style={styles.footerLabel}>Season</div>
            <div style={styles.footerValue}>2026</div>
          </div>
        </div>
      </Card>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#E8002D",
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
  raceName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    letterSpacing: "0.03em",
    color: "#f0f0f4",
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
  subHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#0e0e10",
    flexShrink: 0,
  },
  subLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4a4a56",
  },
  subDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "#2a2a30",
    display: "inline-block",
  },
  skeletonRow: {
    height: 44,
    borderRadius: 8,
    background: "#111113",
    border: "1px solid #1f1f24",
    marginBottom: 2,
  },
  driverRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#111113",
    border: "1px solid #1f1f24",
    borderRadius: 8,
    padding: "8px 12px 8px 0",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  teamStripe: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: "0 2px 2px 0",
    flexShrink: 0,
  },
  positionText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: "0.04em",
    minWidth: 24,
    textAlign: "center",
    flexShrink: 0,
  },
  driverInfo: {
    flex: "0 0 auto",
    minWidth: 100,
  },
  driverCode: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    color: "#f0f0f4",
    letterSpacing: "0.04em",
  },
  driverLastName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 12,
    color: "#5a5a66",
    letterSpacing: "0.02em",
  },
  driverTeam: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#3a3a46",
    marginTop: 1,
  },
  gridPill: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#4a4a56",
    background: "#1a1a1e",
    border: "1px solid #2a2a30",
    borderRadius: 4,
    padding: "1px 6px",
    flexShrink: 0,
  },
  probSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  barTrack: {
    flex: 1,
    height: 4,
    background: "#1f1f24",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.5s ease",
  },
  probValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: "0.02em",
    flexShrink: 0,
    minWidth: 42,
    textAlign: "right",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "10px 22px",
    background: "#111113",
    borderTop: "1px solid #1f1f24",
    flexShrink: 0,
  },
  footerItem: {
    textAlign: "center",
  },
  footerLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginBottom: 2,
  },
  footerValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: "#c0c0cc",
    letterSpacing: "0.03em",
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#2a2a30",
  },
};
