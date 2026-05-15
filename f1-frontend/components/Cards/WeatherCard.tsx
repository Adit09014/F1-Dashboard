"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

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
  switch (code) {
    case 0:
      return <Sun size={42} />;

    case 1:
      return <CloudSun size={42} />;

    case 2:
      return <CloudSun size={42} />;

    case 3:
      return <Cloud size={42} />;

    case 45:
    case 48:
      return <CloudFog size={42} />;

    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
    case 80:
      return <CloudRain size={42} />;

    case 71:
      return <Snowflake size={42} />;

    case 95:
      return <CloudLightning size={42} />;

    default:
      return <Cloud size={42} />;
  }
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

  return (
    <Card sx={{ height: 440 }}>
      <CardContent sx={{ height: "100%", padding: 3 }}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div>
            <Typography
              variant="body2"
              sx={{
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              Weather Conditions
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                marginTop: 1,
              }}
            >
              {nextRace?.raceName}
            </Typography>
          </div>

          {/* Main Weather */}
          <div className="mt-8 flex items-center justify-between rounded-3xl bg-white/5 p-6">
            <div className="flex items-center gap-4">
              <div className="text-orange-400">
                {getWeatherIcon(weather?.weather_code)}
              </div>

              <div>
                <Typography
                  sx={{
                    fontSize: 36,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {weather?.temperature_2m}°C
                </Typography>

                <Typography
                  sx={{
                    color: "#9CA3AF",
                    marginTop: 0.5,
                  }}
                >
                  Track Conditions
                </Typography>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* Wind */}
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                  <Wind size={24} />
                </div>

                <div>
                  <Typography
                    sx={{
                      color: "#9CA3AF",
                      fontSize: 13,
                    }}
                  >
                    Wind Speed
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {weather?.wind_speed_10m} km/h
                  </Typography>
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <Droplets size={24} />
                </div>

                <div>
                  <Typography
                    sx={{
                      color: "#9CA3AF",
                      fontSize: 13,
                    }}
                  >
                    Humidity
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {weather?.relative_humidity_2m}%
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
            <Typography
              sx={{
                color: "#9CA3AF",
                fontSize: 14,
              }}
            >
              Circuit
            </Typography>

            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              {nextRace?.circuit}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
