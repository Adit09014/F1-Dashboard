"use client";

import { Card, Chip, Typography } from "@mui/material";
import { Flag, Clock3, MapPin } from "lucide-react";

export default function RaceCenterHeader({
  session,
}: {
  session: any;
}) {
  const getStatusColor = () => {
    switch (session?.status) {
      case "LIVE":
        return "#E10600";
      case "QUALI_DONE":
        return "#8B5CF6";
      case "PRACTICE":
        return "#2563EB";
      case "UPCOMING":
        return "#16A34A";
      default:
        return "#6B7280";
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        p: 3,
        bgcolor: "#111318",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left */}
        <div>
          <Typography
            sx={{
              color: "#9CA3AF",
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Race Center
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 1,
              fontWeight: 700,
              color: "white",
            }}
          >
            {session?.raceName}
          </Typography>

          <div className="mt-3 flex gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <Typography>{session?.circuit}</Typography>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Flag size={16} />
              <Typography>{session?.country}</Typography>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Clock3 size={16} />
              <Typography>
                {session?.date} {session?.time}
              </Typography>
            </div>
          </div>
        </div>

        {/* Right */}
        <Chip
          label={session?.status}
          sx={{
            bgcolor: getStatusColor(),
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            px: 1,
          }}
        />
      </div>
    </Card>
  );
}