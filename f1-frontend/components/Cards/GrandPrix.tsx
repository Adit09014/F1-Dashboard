"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, ImageList, Typography } from "@mui/material";

import { getCurrentSchedule } from "@/services/jolpica";
import { lastYearWinner } from "@/services/jolpica";

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
    <Card sx={{ height: 220 }}>
      <CardContent sx={{ height: "100%" }}>
        <div className="flex h-full">
          {/* Left Content */}
          <div className="flex w-[60%] flex-col justify-between">
            <div>
              <Typography
                variant="body2"
                sx={{
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Grand Prix
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginTop: 1,
                }}
              >
                {nextRace?.raceName}
              </Typography>

              <Typography
                sx={{
                  marginTop: 2,
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#9CA3AF",
                }}
              >
                Last Year Winner
              </Typography>
              <Typography
                sx={{
                  marginTop: 0.5,
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {lastWinner?.Driver?.familyName}
              </Typography>
              <Typography
                sx={{
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                {lastWinner?.Constructor?.name}
              </Typography>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex w-[40%] items-center justify-center">
            <img
              src="/canada.svg"
              alt="canada"
              className="max-h-[120px] object-contain"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
