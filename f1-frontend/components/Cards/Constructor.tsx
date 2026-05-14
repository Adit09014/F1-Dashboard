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

import { getConstructorStandings } from "@/services/jolpica";

export default function ConstructorStandingsCard() {
  const [constructors, setConstructors] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getConstructorStandings();
      setConstructors(data);
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
            {constructors.map((team, index) => (
              <TableRow key={index}>
                <TableCell>{team.position}</TableCell>

                <TableCell>{team.Constructor.name}</TableCell>

                <TableCell>{team.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
