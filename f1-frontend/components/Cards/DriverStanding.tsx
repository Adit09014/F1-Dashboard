"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { getDriverStandings } from "@/services/jolpica";

export default function DriverStadingsCard() {
  const [driver, setDriver] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getDriverStandings();
      setDriver(data);
    }

    fetchData();
  }, []);

  return (
    <div>
      <TableContainer component={Paper} sx={{ height: 660 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pos.</TableCell>
              <TableCell>Constructor</TableCell>
              <TableCell>Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {driver.map((drv, index) => (
              <TableRow key={index}>
                <TableCell>{drv.position}</TableCell>

                <TableCell>{drv.Driver.familyName}</TableCell>

                <TableCell>{drv.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
