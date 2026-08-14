"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import { useAuth } from "@/context/AuthContext";

import {
  getWeights,
  getWeightStats,
  type Weight,
  type WeightStats,
} from "@/services/weight.service";

import WeightChart from "@/components/weight/WeightChart";

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<WeightStats | null>(null);
  const [weights, setWeights] = useState<Weight[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsResponse, weightsResponse] =
          await Promise.all([
            getWeightStats(),
            getWeights(1, 100, "asc"),
          ]);

        if (!mounted) return;

        setStats(statsResponse.data);
        setWeights(weightsResponse.data.items);
      } catch (error) {
        if (!mounted) return;

        console.error(error);
        setError(
          "Unable to load your weight information."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const latestWeight = useMemo(() => {
    if (!weights.length) return null;

    return [...weights].sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() -
        new Date(a.recorded_at).getTime()
    )[0];
  }, [weights]);

  const progress = Math.min(
    Math.max(stats?.goal_progress_percent ?? 0, 0),
    100
  );

  const weightChange = stats?.weight_change ?? 0;

  const formattedWeightChange =
    Math.abs(weightChange).toFixed(1);

  const isWeightLoss =
    weightChange < 0;

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.95rem",
            }}
          >
            Loading your dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
          lg: 4,
        },
        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <Stack
          spacing={0.7}
          sx={{
            alignItems: {
              xs: "flex-start",
              md: "flex-start",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.25rem",
              },
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Good to see you,
            {user?.full_name
              ? ` ${user.full_name.split(" ")[0]}`
              : ""}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: "0.9rem",
                sm: "0.95rem",
              },
            }}
          >
            Here is your health progress at a glance.
          </Typography>
        </Stack>

        {/* ========================================================= */}
        {/* ERROR */}
        {/* ========================================================= */}

        {error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* ========================================================= */}
        {/* WEIGHT OVERVIEW */}
        {/* ========================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* Current Weight */}
          <StatCard
            icon={<MonitorWeightOutlinedIcon />}
            label="Current Weight"
            value={stats?.current_weight}
            suffix="kg"
            description={
              latestWeight
                ? `Recorded ${formatDate(
                    latestWeight.recorded_at
                  )}`
                : "No measurement yet"
            }
          />

          {/* Starting Weight */}
          <StatCard
            icon={<TimelineOutlinedIcon />}
            label="Starting Weight"
            value={stats?.starting_weight}
            suffix="kg"
            description="Your recorded starting point"
          />

          {/* Target Weight */}
          <StatCard
            icon={<FlagOutlinedIcon />}
            label="Target Weight"
            value={stats?.target_weight}
            suffix="kg"
            description="Your current goal"
          />

          {/* Weight Change */}
          <StatCard
            icon={<TrendingDownOutlinedIcon />}
            label="Weight Change"
            value={formattedWeightChange}
            suffix="kg"
            description={
              weightChange === 0
                ? "No change yet"
                : isWeightLoss
                  ? "Progress since starting"
                  : "Increase since starting"
            }
            positive={
              weightChange < 0
            }
          />
        </Box>

        {/* ========================================================= */}
        {/* MAIN GRID */}
        {/* ========================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.65fr) minmax(300px, 0.75fr)",
            },
            gap: 2.5,
            alignItems: "stretch",
          }}
        >
          {/* ======================================================= */}
          {/* WEIGHT CHART */}
          {/* ======================================================= */}

          <WeightChart weights={weights} />

          {/* ======================================================= */}
          {/* GOAL CARD */}
          {/* ======================================================= */}

          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2.5,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Goal Progress
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Your journey toward your target
                    weight.
                  </Typography>
                </Stack>

                {/* Progress percentage */}
                <Stack
                  spacing={1}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "3rem",
                        sm: "3.5rem",
                      },
                      lineHeight: 1,
                      fontWeight: 800,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {progress.toFixed(0)}
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.5,
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "text.secondary",
                      }}
                    >
                      %
                    </Typography>
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    completed
                  </Typography>
                </Stack>

                {/* Progress bar */}
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 10,
                      backgroundColor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 10,
                      },
                    }}
                  />
                </Box>

                <Divider />

                {/* Goal numbers */}
                <Stack spacing={2}>
                  <GoalRow
                    label="Starting"
                    value={stats?.starting_weight}
                  />

                  <GoalRow
                    label="Current"
                    value={stats?.current_weight}
                    emphasized
                  />

                  <GoalRow
                    label="Target"
                    value={stats?.target_weight}
                  />

                  <GoalRow
                    label="Remaining"
                    value={stats?.remaining_to_goal}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* ========================================================= */}
        {/* RECENT ACTIVITY */}
        {/* ========================================================= */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
                },
              },
            }}
          >
            <Stack spacing={2.5}>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                sx={{
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Latest Measurement
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Your most recent weight record.
                  </Typography>
                </Stack>

                {latestWeight && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <CalendarTodayOutlinedIcon
                      sx={{
                        fontSize: 17,
                        color: "text.secondary",
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDate(
                        latestWeight.recorded_at
                      )}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Divider />

              {!latestWeight ? (
                <Box
                  sx={{
                    py: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      No measurements yet
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Add your first weight measurement
                      to start tracking your progress.
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <ActivityValue
                    label="Weight"
                    value={
                      latestWeight.weight_kg.toFixed(
                        1
                      )
                    }
                    suffix="kg"
                  />

                  <ActivityValue
                    label="Recorded"
                    value={formatDate(
                      latestWeight.recorded_at
                    )}
                  />

                  <ActivityValue
                    label="Note"
                    value={
                      latestWeight.notes ||
                      "No notes"
                    }
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textAlign: "center",
            display: "block",
            pt: 1,
          }}
        >
          Keep building healthy habits, one day at a
          time.
        </Typography>
      </Stack>
    </Box>
  );
}

/* ============================================================= */
/* STAT CARD */
/* ============================================================= */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value?: number | string | null;
  suffix?: string;
  description: string;
  positive?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  description,
  positive,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: {
            sm: "translateY(-3px)",
          },
          boxShadow:
            "0 14px 35px rgba(0,0,0,0.07)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              sm: 2.5,
            },
          },
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Stack spacing={0.7}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>

            {/* IMPORTANT:
                number and kg are separate so they never overlap */}
            <Stack
              direction="row"
              spacing={0.8}
              sx={{
                alignItems: "baseline",
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "2rem",
                    sm: "2.2rem",
                  },
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                {value === null ||
                value === undefined ||
                value === ""
                  ? "—"
                  : typeof value === "number"
                    ? value.toFixed(1)
                    : value}
              </Typography>

              {suffix && (
                <Typography
                  sx={{
                    fontSize: {
                      xs: "0.9rem",
                      sm: "1rem",
                    },
                    lineHeight: 1,
                    fontWeight: 700,
                    color: "text.secondary",
                  }}
                >
                  {suffix}
                </Typography>
              )}
            </Stack>

            <Typography
              variant="caption"
              color={
                positive
                  ? "success.main"
                  : "text.secondary"
              }
              sx={{
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ============================================================= */
/* GOAL ROW */
/* ============================================================= */

interface GoalRowProps {
  label: string;
  value?: number | null;
  emphasized?: boolean;
}

function GoalRow({
  label,
  value,
  emphasized = false,
}: GoalRowProps) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="body2"
        color={
          emphasized
            ? "text.primary"
            : "text.secondary"
        }
        sx={{
          fontWeight: emphasized ? 700 : 500,
        }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "baseline",
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          {value === null ||
          value === undefined
            ? "—"
            : value.toFixed(1)}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
          }}
        >
          kg
        </Typography>
      </Stack>
    </Stack>
  );
}

/* ============================================================= */
/* ACTIVITY VALUE */
/* ============================================================= */

interface ActivityValueProps {
  label: string;
  value: string;
  suffix?: string;
}

function ActivityValue({
  label,
  value,
  suffix,
}: ActivityValueProps) {
  return (
    <Stack
      spacing={0.7}
      sx={{
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "baseline",
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 750,
            fontSize: "1rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>

        {suffix && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {suffix}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}