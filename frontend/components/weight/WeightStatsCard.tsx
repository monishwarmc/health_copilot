"use client";

import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

interface WeightStats {
  current_weight: number;
  starting_weight: number;
  target_weight: number;
  weight_change: number;
  remaining_to_goal: number;
  goal_progress_percent: number;
  entries: number;
  latest_recorded_at: string;
}

interface WeightStatsCardProps {
  stats: WeightStats;
}

export default function WeightStatsCard({
  stats,
}: WeightStatsCardProps) {
  const progress = Math.min(
    Math.max(stats.goal_progress_percent, 0),
    100
  );

  const isWeightLoss =
    stats.starting_weight > stats.target_weight;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack spacing={0.5}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              Weight Progress
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.25rem",
                },
                lineHeight: 1,
              }}
            >
              {stats.current_weight.toFixed(1)}
              <Typography
                component="span"
                sx={{
                  ml: 0.75,
                  fontSize: {
                    xs: "1.1rem",
                    sm: "1.3rem",
                  },
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                kg
              </Typography>
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Current weight
            </Typography>
          </Stack>

          {/* Goal progress */}
          <Stack spacing={1}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Goal progress
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontWeight: 700 }}
              >
                {progress.toFixed(0)}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 9,
                borderRadius: 5,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                },
              }}
            />

            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Start: {stats.starting_weight.toFixed(1)} kg
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Goal: {stats.target_weight.toFixed(1)} kg
              </Typography>
            </Stack>
          </Stack>

          {/* Statistics */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: 1.5,
            }}
          >
            <StatItem
              label="Change"
              value={`${stats.weight_change > 0 ? "+" : ""}${stats.weight_change.toFixed(1)} kg`}
            />

            <StatItem
              label="Remaining"
              value={`${Math.max(stats.remaining_to_goal, 0).toFixed(1)} kg`}
            />

            <StatItem
              label="Target"
              value={`${stats.target_weight.toFixed(1)} kg`}
            />

            <StatItem
              label="Entries"
              value={stats.entries.toString()}
            />
          </Box>

          {/* Latest measurement */}
          {stats.latest_recorded_at && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Last recorded:{" "}
              {new Date(
                stats.latest_recorded_at
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({
  label,
  value,
}: StatItemProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        bgcolor: "action.hover",
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}