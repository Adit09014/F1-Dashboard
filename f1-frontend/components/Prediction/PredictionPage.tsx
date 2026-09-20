"use client";

import { useEffect, useState } from "react";
import { getSession, getQualiResult, getCurrentSchedule } from "@/services/jolpica";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface PredictionPayload {
  status: string;
  session: { name: string; lap_number: number; total_laps: number; pct_completed: number };
  models: {
    pre_race: { name: string; features: number; roc_auc: number };
    mid_race: { name: string; features: number; roc_auc: number };
  };
  predictions: { pre_race: DriverPrediction[]; mid_race: DriverPrediction[] };
}

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

const FEATURE_LABELS: Record<string, string> = {
  position: "Current Track Position",
  grid: "Qualifying Grid Position",
  lap_number: "Current Lap",
  lap_remaining: "Laps Remaining",
  pct_race_completed: "% Race Completed",
  positions_gained: "Positions Gained/Lost",
  gain_per_lap: "Required Gain Rate / Lap",
  avg_circuit_points: "Avg Points at This Circuit",
  constructor_pts_per_race: "Constructor Pts / Race",
  dnf_last5: "DNFs in Last 5 Races",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PredictionPage() {
  const [isRaceLive, setIsRaceLive] = useState(false);
  const [lapNumber, setLapNumber] = useState(25);
  const [totalLaps, setTotalLaps] = useState(57);
  const [data, setData] = useState<PredictionPayload | null>(null);
  const [nextRace, setNextRace] = useState<any>(null);
  const [qualiResults, setQualiResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<DriverPrediction | null>(null);

  // Check session & race data
  useEffect(() => {
    async function init() {
      try {
        const [sess, schedule] = await Promise.all([getSession(), getCurrentSchedule()]);
        setNextRace(schedule);

        if (sess?.status === "Live") {
          setIsRaceLive(true);
        } else if (sess?.raceRound) {
          setIsRaceLive(false);
          const quali = await getQualiResult(sess.raceRound);
          setQualiResults(quali ?? []);
        } else {
          setIsRaceLive(false);
        }
      } catch {
        setIsRaceLive(false);
      }
    }
    init();
  }, []);

  // Fetch predictions
  useEffect(() => {
    async function fetchPredictions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/predict?lap=${lapNumber}&total=${totalLaps}`);
        const json = await res.json();
        if (json.status === "success") {
          setData(json);
          if (!selectedDriver) {
            const list = json.predictions.pre_race as DriverPrediction[];
            setSelectedDriver(list[0] ?? null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [lapNumber, totalLaps]);

  const activeList: DriverPrediction[] = isRaceLive
    ? (data?.predictions.mid_race ?? [])
    : (data?.predictions.pre_race ?? []);

  const activeModel = isRaceLive ? data?.models.mid_race : data?.models.pre_race;

  const topDriver = activeList[0] ?? null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        @keyframes f1pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        .pred-live-dot { animation: f1pulse 1.4s ease-in-out infinite; }
        .pred-scroll::-webkit-scrollbar { width: 3px; }
        .pred-scroll::-webkit-scrollbar-track { background: transparent; }
        .pred-scroll::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 2px; }
        .driver-row-btn:hover { background: #16161a !important; }
      `}</style>

      <div style={styles.page}>

        {/* ── Page Header ──────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.pageLabel}>
              {isRaceLive ? "Live Race • Mid-Race Model" : "Upcoming Race • Pre-Race Model"}
            </div>
            <div style={styles.pageTitle}>Race Winner Predictor</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Session Status Badge */}
            <div style={{
              ...styles.badge,
              background: isRaceLive ? "rgba(232,0,45,0.12)" : "#1a1a1e",
              border: isRaceLive ? "1px solid rgba(232,0,45,0.35)" : "1px solid #2a2a30",
              color: isRaceLive ? "#E8002D" : "#6b6b78",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {isRaceLive && <div className="pred-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8002D" }} />}
              {isRaceLive ? "LIVE ON TRACK" : "UPCOMING RACE"}
            </div>

            {/* Next race name */}
            {nextRace && (
              <div style={styles.badge}>{nextRace.raceName ?? "—"}</div>
            )}
          </div>
        </div>

        {/* ── Model Stats Bar ───────────────────────────────── */}
        <div style={styles.statsBar}>
          {[
            { label: "Model", value: isRaceLive ? "Mid-Race XGBoost" : "Pre-Race XGBoost" },
            { label: "Input Features", value: isRaceLive ? "10" : "4" },
            { label: "ROC-AUC", value: isRaceLive ? "0.9793" : "0.912" },
            { label: "Top-1 Accuracy", value: isRaceLive ? "72.76%" : "68%" },
            { label: "Top-3 Accuracy", value: isRaceLive ? "96.34%" : "91%" },
            { label: "Training Data", value: "2023 – 2024" },
          ].map((s) => (
            <div key={s.label} style={styles.statCell}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ─────────────────────────────────────── */}
        <div style={styles.mainGrid}>

          {/* ─── Left: Leaderboard ────────────────────────── */}
          <div style={styles.leaderboardPanel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelTitle}>Win Probability Ranking</div>
              <div style={styles.panelSub}>Sorted by model confidence</div>
            </div>

            <div className="pred-scroll" style={styles.leaderboardScroll}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={styles.skeletonRow} />
                  ))
                : activeList.map((driver, i) => {
                    const prob = isRaceLive ? driver.mid_race_win_prob : driver.pre_race_win_prob;
                    const color = TEAM_COLORS[driver.team_key] ?? "#E8002D";
                    const rank = i + 1;
                    const isSelected = selectedDriver?.driver_number === driver.driver_number;

                    return (
                      <button
                        key={driver.driver_number}
                        className="driver-row-btn"
                        onClick={() => setSelectedDriver(driver)}
                        style={{
                          ...styles.driverRow,
                          background: isSelected ? "#18181d" : "#111113",
                          border: isSelected ? `1px solid ${color}40` : "1px solid #1f1f24",
                          width: "100%", textAlign: "left", cursor: "pointer",
                        }}
                      >
                        {/* Team stripe */}
                        <div style={{ ...styles.stripe, backgroundColor: color }} />

                        {/* Rank */}
                        <div style={{
                          ...styles.rankText,
                          color: rank === 1 ? "#E8C14A" : rank === 2 ? "#A8B8C8" : rank === 3 ? "#CD8B56" : "#3a3a46",
                        }}>
                          P{rank}
                        </div>

                        {/* Driver info */}
                        <div style={{ minWidth: 130 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={styles.driverCode}>{driver.code}</span>
                            <span style={styles.driverSurname}>{driver.name.split(" ").slice(1).join(" ")}</span>
                          </div>
                          <div style={styles.driverTeam}>{driver.team}</div>
                        </div>

                        {/* Grid pill */}
                        <div style={styles.gridPill}>Grid P{driver.grid}</div>

                        {/* Bar + prob */}
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={styles.barTrack}>
                            <div style={{
                              ...styles.barFill,
                              width: `${Math.min(100, Math.max(2, prob))}%`,
                              background: `linear-gradient(90deg, ${color}, #E8002D)`,
                            }} />
                          </div>
                          <div style={{
                            ...styles.probText,
                            color: prob > 20 ? "#f0f0f4" : "#4a4a56",
                          }}>
                            {prob.toFixed(1)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* ─── Right: Detail Panel ──────────────────────── */}
          <div style={styles.detailColumn}>

            {/* Driver Detail Card */}
            {selectedDriver && (() => {
              const prob = isRaceLive ? selectedDriver.mid_race_win_prob : selectedDriver.pre_race_win_prob;
              const color = TEAM_COLORS[selectedDriver.team_key] ?? "#E8002D";
              const rank = activeList.findIndex((d) => d.driver_number === selectedDriver.driver_number) + 1;

              return (
                <div style={{ ...styles.detailCard, borderTop: `3px solid ${color}` }}>
                  <div style={styles.panelHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ ...styles.teamDot, backgroundColor: color }} />
                      <div>
                        <div style={styles.panelTitle}>{selectedDriver.name}</div>
                        <div style={styles.panelSub}>{selectedDriver.team} • Grid P{selectedDriver.grid}</div>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800, fontSize: 32,
                      color: prob > 20 ? "#f0f0f4" : "#5a5a66",
                    }}>
                      {prob.toFixed(1)}%
                    </div>
                  </div>

                  <div style={styles.divider} />

                  {/* Comparison: Pre-Race vs Mid-Race */}
                  <div style={styles.probCompare}>
                    <div style={styles.probCompareItem}>
                      <div style={styles.statLabel}>Pre-Race Odds</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 22, color: "#f0f0f4", marginTop: 4 }}>
                        {selectedDriver.pre_race_win_prob.toFixed(1)}%
                      </div>
                      <div style={{ height: 4, background: "#1f1f24", borderRadius: 2, marginTop: 8 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "#3671C6", width: `${Math.min(100, selectedDriver.pre_race_win_prob)}%` }} />
                      </div>
                      <div style={{ ...styles.statLabel, marginTop: 4 }}>Grid & Form Model</div>
                    </div>

                    <div style={styles.vsText}>VS</div>

                    <div style={styles.probCompareItem}>
                      <div style={styles.statLabel}>Mid-Race Odds</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 22, color: "#f0f0f4", marginTop: 4 }}>
                        {selectedDriver.mid_race_win_prob.toFixed(1)}%
                      </div>
                      <div style={{ height: 4, background: "#1f1f24", borderRadius: 2, marginTop: 8 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "#E8002D", width: `${Math.min(100, selectedDriver.mid_race_win_prob)}%` }} />
                      </div>
                      <div style={{ ...styles.statLabel, marginTop: 4 }}>Telemetry Model (L{lapNumber})</div>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  {/* Driver Stats Grid */}
                  <div style={styles.driverStatsGrid}>
                    {[
                      { label: "Grid Position", value: `P${selectedDriver.grid}` },
                      { label: "Predicted Rank", value: `P${rank}` },
                      { label: "Pre-Race Win Prob", value: `${selectedDriver.pre_race_win_prob.toFixed(1)}%` },
                      { label: "Mid-Race Win Prob", value: `${selectedDriver.mid_race_win_prob.toFixed(1)}%` },
                    ].map((s) => (
                      <div key={s.label} style={styles.driverStatCell}>
                        <div style={styles.statLabel}>{s.label}</div>
                        <div style={{ ...styles.statValue, fontSize: 18 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Model Features Card */}
            <div style={styles.detailCard}>
              <div style={styles.panelHeader}>
                <div>
                  <div style={styles.panelTitle}>
                    {isRaceLive ? "Mid-Race Model Features" : "Pre-Race Model Features"}
                  </div>
                  <div style={styles.panelSub}>
                    Inputs used by the XGBoost classifier
                  </div>
                </div>
              </div>
              <div style={styles.divider} />

              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 20px" }}>
                {(isRaceLive
                  ? ["position", "grid", "lap_number", "lap_remaining", "pct_race_completed", "positions_gained", "gain_per_lap", "avg_circuit_points", "constructor_pts_per_race", "dnf_last5"]
                  : ["avg_circuit_points", "constructor_pts_per_race", "grid", "dnf_last5"]
                ).map((feat, idx) => {
                  const importances: Record<string, number> = isRaceLive
                    ? { gain_per_lap: 65.6, position: 17.1, avg_circuit_points: 6.1, constructor_pts_per_race: 5.6, grid: 1.8, dnf_last5: 1.7, positions_gained: 0.7, lap_number: 0.7, pct_race_completed: 0.4, lap_remaining: 0.3 }
                    : { avg_circuit_points: 38, constructor_pts_per_race: 32, grid: 22, dnf_last5: 8 };
                  const pct = importances[feat] ?? 0;
                  return (
                    <div key={feat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 600, color: "#8a8a96", letterSpacing: "0.04em" }}>
                          {FEATURE_LABELS[feat] ?? feat}
                        </span>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 800, color: pct > 30 ? "#E8002D" : "#5a5a66" }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 3, background: "#1f1f24", borderRadius: 2 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: pct > 30 ? "#E8002D" : "#2a2a30", width: `${Math.min(100, pct * 1.5)}%`, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Lap Slider — only visible when race is live */}
            {isRaceLive && (
              <div style={styles.detailCard}>
                <div style={styles.panelHeader}>
                  <div>
                    <div style={styles.panelTitle}>Race Progress Simulator</div>
                    <div style={styles.panelSub}>Adjust lap to see how predictions evolve</div>
                  </div>
                  <div style={styles.badge}>Lap {lapNumber} / {totalLaps}</div>
                </div>
                <div style={{ padding: "0 20px 16px" }}>
                  <input
                    type="range"
                    min={1}
                    max={totalLaps}
                    value={lapNumber}
                    onChange={(e) => setLapNumber(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#E8002D" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ ...styles.statLabel }}>Lap 1</span>
                    <span style={{ ...styles.statLabel }}>Lap {totalLaps}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Qualifying Grid Card (if available) */}
            {!isRaceLive && qualiResults.length > 0 && (
              <div style={styles.detailCard}>
                <div style={styles.panelHeader}>
                  <div>
                    <div style={styles.panelTitle}>Qualifying Starting Grid</div>
                    <div style={styles.panelSub}>Official Q3 results for {nextRace?.raceName ?? "Next Race"}</div>
                  </div>
                </div>
                <div style={styles.divider} />
                <div className="pred-scroll" style={{ maxHeight: 220, overflowY: "auto", padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {qualiResults.slice(0, 10).map((q: any) => (
                    <div key={q.position} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ ...styles.rankText, color: q.position <= 3 ? "#E8C14A" : "#3a3a46", minWidth: 24 }}>
                        P{q.position}
                      </span>
                      <span style={styles.driverCode}>{q.Driver?.code ?? "—"}</span>
                      <span style={{ ...styles.driverSurname, flex: 1 }}>{q.Driver?.familyName ?? "—"}</span>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, color: "#5a5a66" }}>
                        {q.Q3 ?? q.Q2 ?? q.Q1 ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0c",
    fontFamily: "'Barlow', sans-serif",
    color: "#e8e8ec",
    padding: "28px 28px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  pageLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#E8002D",
    marginBottom: 5,
  },
  pageTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 30,
    letterSpacing: "0.02em",
    color: "#f0f0f4",
  },
  badge: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b6b78",
    background: "#1a1a1e",
    border: "1px solid #2a2a30",
    borderRadius: 6,
    padding: "4px 10px",
    whiteSpace: "nowrap",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    background: "#111113",
    border: "1px solid #1f1f24",
    borderRadius: 10,
    overflow: "hidden",
  },
  statCell: {
    padding: "12px 18px",
    borderRight: "1px solid #1f1f24",
  },
  statLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginBottom: 4,
  },
  statValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    color: "#f0f0f4",
    letterSpacing: "0.02em",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: 16,
    flex: 1,
  },
  leaderboardPanel: {
    background: "#0e0e10",
    border: "1px solid #1f1f24",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1f1f24",
    background: "#111113",
    flexShrink: 0,
  },
  panelTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    color: "#f0f0f4",
    letterSpacing: "0.02em",
  },
  panelSub: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4a4a56",
    marginTop: 2,
  },
  leaderboardScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  skeletonRow: {
    height: 52,
    borderRadius: 8,
    background: "#111113",
    border: "1px solid #1f1f24",
    flexShrink: 0,
  },
  driverRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px 10px 0",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  stripe: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: "0 2px 2px 0",
    flexShrink: 0,
  },
  rankText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    minWidth: 26,
    textAlign: "center",
    flexShrink: 0,
  },
  driverCode: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 16,
    color: "#f0f0f4",
    letterSpacing: "0.04em",
  },
  driverSurname: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: "#5a5a66",
  },
  driverTeam: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#3a3a46",
    marginTop: 2,
  },
  gridPill: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    color: "#4a4a56",
    background: "#1a1a1e",
    border: "1px solid #2a2a30",
    borderRadius: 4,
    padding: "2px 7px",
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 5,
    background: "#1f1f24",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.5s ease",
  },
  probText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
    minWidth: 48,
    textAlign: "right",
  },
  detailColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    overflowY: "auto",
  },
  detailCard: {
    background: "#0e0e10",
    border: "1px solid #1f1f24",
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: "#1f1f24",
  },
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  probCompare: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
  },
  probCompareItem: {
    flex: 1,
  },
  vsText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 13,
    color: "#3a3a46",
    letterSpacing: "0.1em",
    flexShrink: 0,
  },
  driverStatsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderTop: "1px solid #1f1f24",
  },
  driverStatCell: {
    padding: "14px 20px",
    borderRight: "1px solid #1f1f24",
    borderBottom: "1px solid #1f1f24",
  },
};
