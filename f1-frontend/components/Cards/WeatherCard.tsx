"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@mui/material";

import { getWeather } from "@/services/weather";
import { getCurrentSchedule } from "@/services/jolpica";

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
} from "lucide-react";

function getWeatherIcon(code: number) {
  const size = 36;
  switch (code) {
    case 0:
      return <Sun size={size} />;
    case 1:
    case 2:
      return <CloudSun size={size} />;
    case 3:
      return <Cloud size={size} />;
    case 45:
    case 48:
      return <CloudFog size={size} />;
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
    case 80:
      return <CloudRain size={size} />;
    case 71:
      return <Snowflake size={size} />;
    case 95:
      return <CloudLightning size={size} />;
    default:
      return <Cloud size={size} />;
  }
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 65) return "Rainy";
  if (code === 71) return "Snow";
  if (code === 95) return "Thunderstorm";
  return "Cloudy";
}

function getWeatherAccent(code: number): string {
  if (code === 0) return "#f59e0b";
  if (code <= 2) return "#fb923c";
  if (code <= 3) return "#94a3b8";
  if (code <= 48) return "#7dd3fc";
  if (code <= 65) return "#60a5fa";
  if (code === 71) return "#bae6fd";
  if (code === 95) return "#a78bfa";
  return "#94a3b8";
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<any>(null);
  const [nextRace, setNextRace] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getCurrentSchedule();
      setNextRace(data);
      const condi = await getWeather(data.lat, data.long);
      setWeather(condi);
    }
    fetchData();
  }, []);

  const weatherCode = weather?.weather_code ?? 0;
  const accent = getWeatherAccent(weatherCode);
  const weatherLabel = getWeatherLabel(weatherCode);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
      `}</style>

      <Card
        sx={{
          height: 440,
          background: "#0e0e10",
          border: "1px solid #818181",
          overflow: "hidden",
          fontFamily: "'Barlow', sans-serif",
          color: "#e8e8ec",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.sectionLabel}>Weather Conditions</div>
            <div style={styles.raceName}>{nextRace?.raceName ?? "—"}</div>
          </div>
          <div style={{ ...styles.roundBadge }}>{nextRace?.circuit ?? "—"}</div>
        </div>

        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            p: "0 !important",
            overflow: "hidden",
          }}
        >
          {/* Main temp block */}
          <div style={styles.mainBlock}>
            {/* Icon + temp */}
            <div style={styles.tempRow}>
              <div
                style={{
                  ...styles.iconWrap,
                  color: accent,
                  background: `${accent}18`,
                  border: `1px solid ${accent}30`,
                }}
              >
                {getWeatherIcon(weatherCode)}
              </div>
              <div>
                <div style={styles.tempValue}>
                  {weather?.temperature_2m ?? "—"}
                  <span style={styles.tempUnit}>°C</span>
                </div>
                <div style={{ ...styles.weatherLabel, color: accent }}>
                  {weatherLabel}
                </div>
              </div>
            </div>

            {/* Temp bar */}
            <div style={styles.tempBarTrack}>
              <div
                style={{
                  ...styles.tempBarFill,
                  width: `${Math.min(100, Math.max(0, (((weather?.temperature_2m ?? 20) + 10) / 55) * 100))}%`,
                  background: accent,
                }}
              />
            </div>
            <div style={styles.tempBarLabels}>
              <span>−10°C</span>
              <span>Track temp</span>
              <span>45°C</span>
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Stats row */}
          <div style={styles.statsRow}>
            {/* Wind */}
            <div style={styles.statItem}>
              <div
                style={{
                  ...styles.statIconWrap,
                  color: "#60a5fa",
                  background: "#172033",
                  border: "1px solid #1e3a5f",
                }}
              >
                <Wind size={18} />
              </div>
              <div>
                <div style={styles.statLabel}>Wind Speed</div>
                <div style={styles.statValue}>
                  {weather?.wind_speed_10m ?? "—"}
                  <span style={styles.statUnit}> km/h</span>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div style={styles.statDivider} />

            {/* Humidity */}
            <div style={styles.statItem}>
              <div
                style={{
                  ...styles.statIconWrap,
                  color: "#22d3ee",
                  background: "#0f2a30",
                  border: "1px solid #164e63",
                }}
              >
                <Droplets size={18} />
              </div>
              <div>
                <div style={styles.statLabel}>Humidity</div>
                <div style={styles.statValue}>
                  {weather?.relative_humidity_2m ?? "—"}
                  <span style={styles.statUnit}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.footerItem}>
              <div style={styles.footerLabel}>Session</div>
              <div style={styles.footerValue}>
                {nextRace?.session ?? "Race Weekend"}
              </div>
            </div>
            <div style={styles.footerDot} />
            <div style={styles.footerItem}>
              <div style={styles.footerLabel}>Round</div>
              <div style={styles.footerValue}>{nextRace?.round ?? "—"}</div>
            </div>
            <div style={styles.footerDot} />
            <div style={styles.footerItem}>
              <div style={styles.footerLabel}>Season</div>
              <div style={styles.footerValue}>{nextRace?.season ?? "2025"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

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
    whiteSpace: "nowrap" as const,
    marginTop: 2,
  },
  mainBlock: {
    padding: "22px 22px 18px",
    flexShrink: 0,
  },
  tempRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 20,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 68,
    borderRadius: 16,
    flexShrink: 0,
  },
  tempValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 52,
    lineHeight: 1,
    color: "#f0f0f4",
    letterSpacing: "-0.02em",
  },
  tempUnit: {
    fontSize: 28,
    fontWeight: 600,
    color: "#5a5a66",
    marginLeft: 2,
  },
  weatherLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: 4,
  },
  tempBarTrack: {
    height: 4,
    background: "#1f1f24",
    borderRadius: 2,
    overflow: "hidden",
  },
  tempBarFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.6s ease",
  },
  tempBarLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "#3a3a46",
    marginTop: 4,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    background: "#1f1f24",
    flexShrink: 0,
  },
  statsRow: {
    display: "flex",
    alignItems: "stretch",
    padding: "18px 22px",
    gap: 0,
    flexShrink: 0,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  statDivider: {
    width: 1,
    background: "#1f1f24",
    margin: "0 22px",
    alignSelf: "stretch",
  },
  statIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    flexShrink: 0,
  },
  statLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5a5a66",
    marginBottom: 2,
  },
  statValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    color: "#e0e0ec",
    lineHeight: 1,
  },
  statUnit: {
    fontWeight: 600,
    fontSize: 14,
    color: "#5a5a66",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "14px 22px",
    marginTop: "auto",
    background: "#111113",
    borderTop: "1px solid #1f1f24",
  },
  footerItem: {
    textAlign: "center" as const,
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
