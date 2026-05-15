"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

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
      const now = new Date().getTime();

      const distance = nextRaceDate.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  return (
    <Card
      sx={{
        height: 220,
        background: "linear-gradient(135deg,#111827,#1F2937)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        color: "white",
      }}
    >
      <CardContent>
        <Typography
          variant="body2"
          sx={{
            color: "#9CA3AF",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Next Session
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            marginTop: 1,
          }}
        >
          {nextRace?.country}
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#9CA3AF",
          }}
        >
          {nextRace?.name}
        </Typography>

        <div className="mt-8 grid grid-cols-4 gap-3">
          <div className="rounded-2xl bg-black/20 p-3 text-center">
            <h2 className="text-3xl font-bold text-red-500">{timeLeft.days}</h2>

            <p className="mt-1 text-xs text-gray-400">Days</p>
          </div>

          <div className="rounded-2xl bg-black/20 p-3 text-center">
            <h2 className="text-3xl font-bold text-white">{timeLeft.hours}</h2>

            <p className="mt-1 text-xs text-gray-400">Hours</p>
          </div>

          <div className="rounded-2xl bg-black/20 p-3 text-center">
            <h2 className="text-3xl font-bold text-white">
              {timeLeft.minutes}
            </h2>

            <p className="mt-1 text-xs text-gray-400">Minutes</p>
          </div>

          <div className="rounded-2xl bg-black/20 p-3 text-center">
            <h2 className="text-3xl font-bold text-white">
              {timeLeft.seconds}
            </h2>

            <p className="mt-1 text-xs text-gray-400">Seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
