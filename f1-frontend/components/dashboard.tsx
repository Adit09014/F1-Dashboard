"use client";

import { Card, CardContent, Grid, Typography } from "@mui/material";
import ConstructorStandingsCard from "./Cards/Constructor";
import DriverStadingsCard from "./Cards/DriverStanding";
import NextRaceCountdown from "./Cards/RaceCount";
import GrandPrix from "./Cards/GrandPrix";
import WeatherCard from "./Cards/WeatherCard";
import LiveCard from "./Cards/LiveCard";

export default function DashboardPage() {
  const cards = [
    {
      title: "Current Lap",
      value: "42",
    },
    {
      title: "Fastest Lap",
      value: "1:21.442",
    },
    {
      title: "Track Temp",
      value: "38°C",
    },
    {
      title: "Wind Speed",
      value: "12 km/h",
    },
    {
      title: "DRS Zones",
      value: "3",
    },
    {
      title: "Race Distance",
      value: "260 KM",
    },
    {
      title: "Tyre Wear",
      value: "Medium",
    },
    {
      title: "Safety Car",
      value: "No",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-white/10 bg-[#0B0D17]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center text-xl font-bold text-red-500">
          Home
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10">
            Login
          </button>

          <button className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
            Signup
          </button>
        </div>
      </nav>

      {/* Cards Section */}
      <div className="flex gap-2">
        {/* Left Section */}
        <div className="flex-1">
          <Grid container spacing={1}>
            <Grid size={6}>
              <NextRaceCountdown />
            </Grid>

            <Grid size={6}>
              <GrandPrix />
            </Grid>
            <Grid size={6}>
              <DriverStadingsCard />
            </Grid>
            <Grid size={6}>
              <ConstructorStandingsCard />
            </Grid>
          </Grid>
        </div>

        {/* Right Section */}
        <div className="flex-1 ">
          <Grid container spacing={1}>
            <Grid size={6}>
              <WeatherCard />
            </Grid>

            <Grid size={6}>
              <Card sx={{ height: 440, bgcolor: "black" }}>
                <CardContent>Prediction</CardContent>
              </Card>
            </Grid>
            <Grid size={12}>
              <LiveCard />
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}
