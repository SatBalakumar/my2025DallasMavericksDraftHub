// src/components/ScoutBoard.jsx
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

// Map URL param to ranking field label
const SCOUT_MAP = {
  espn: "ESPN Rank",
  samvecenie: "Sam Vecenie Rank",
  kevinoconnor: "Kevin O'Connor Rank",
  kyleboone: "Kyle Boone Rank",
  garyparrish: "Gary Parrish Rank",
};

export default function ScoutBoard({ data }) {
  const { scoutKey } = useParams();
  const scoutLabel = SCOUT_MAP[scoutKey] || "";

  // Build, compute avg, diff, and sort by the selected scout's rank
  const rows = useMemo(() => {
    const { bio, scoutRankings } = data;
    return bio
        .map((p) => {
        const rankObj = scoutRankings.find((r) => r.playerId === p.playerId) || {};
        // compute overall average across all scouts for this player
        const { playerId, ...allRanks } = rankObj;
        const scores = Object.values(allRanks).filter((v) => typeof v === "number");
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        const rank = rankObj[scoutLabel] ?? null;
        const diff = avg != null && rank != null ? avg - rank : 0;
        return { playerId: p.playerId, name: p.name, rank, avg, diff };
        })
        .filter((p) => p.rank != null && p.avg != null)
        .sort((a, b) => a.rank - b.rank);
    }, [data, scoutLabel]);

  return (
    <Box sx={{ p: 3, background: "linear-gradient(270deg, #002B5E 0%, #B8C4CA 100%)" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#00223E", fontWeight: "bold" }}>
        {scoutLabel.replace(" Rank", "")}’s Rankings
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
                <TableRow>
                <TableCell>Player</TableCell>
                <TableCell align="center">Scout Ranking</TableCell>
                <TableCell align="center">Diff</TableCell>
                <TableCell align="center">Average Ranking</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((p) => (
                <TableRow key={p.playerId} hover>
                    {/* Player Name */}
                    <TableCell>
                    <Link
                        to={`/player/${p.playerId}`}
                        style={{
                        textDecoration: "none",
                        color: "#0053BC",
                        fontWeight: 500,
                        }}
                    >
                        {p.name}
                    </Link>
                    </TableCell>
                    {/* Scout Ranking */}
                    <TableCell align="center">{p.rank}</TableCell>
                    {/* Diff column */}
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {p.diff > 0 ? (
                        <ArrowUpward fontSize="small" color="success" />
                    ) : p.diff < 0 ? (
                        <ArrowDownward fontSize="small" color="error" />
                    ) : null}
                    {p.diff !== 0 && (() => {
                        const mag = Math.abs(p.diff);
                        // anything between 0 and 1 becomes 1, otherwise round normally
                        const display = mag > 0 && mag < 1 ? 1 : Math.round(mag);
                        return (
                          <Box component="span" sx={{ ml: 0.5 }}>
                            {display}
                          </Box>
                        );
                      })()}
                    </TableCell>
                    {/* Average Ranking */}
                    <TableCell align="center">{p.avg.toFixed(1)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
