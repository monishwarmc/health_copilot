"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useAuth } from "@/context/AuthContext";
import { getWeightStats } from "@/services/weight.service";
import { WeightStats } from "@/types/weight";

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<WeightStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWeightStats = async () => {
      try {
        const response = await getWeightStats();

        if (mounted) {
          setStats(response.data);
        }
      } catch {
        if (mounted) {
          setStats(null);
        }
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    };

    loadWeightStats();

    return () => {
      mounted = false;
    };
  }, []);

  const firstName =
    user?.full_name?.trim()?.split(" ")[0] || "there";

  const hasWeightData =
    stats != null &&
    stats.current_weight != null;

  const progress =
    stats?.goal_progress_percent != null
      ? Math.max(
          0,
          Math.min(100, stats.goal_progress_percent)
        )
      : 0;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
      }}
    >
      <Stack spacing={{ xs: 2.5, sm: 3.5 }}>

        {/* =========================================================
            HERO
        ========================================================= */}

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            p: {
              xs: 2.5,
              sm: 4,
              md: 5,
            },
            background:
              "linear-gradient(135deg, rgba(33,150,243,0.16), rgba(124,77,255,0.10))",
            border: "1px solid",
            borderColor:
              "rgba(33,150,243,0.15)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: {
                xs: 180,
                sm: 280,
              },
              height: {
                xs: 180,
                sm: 280,
              },
              borderRadius: "50%",
              right: {
                xs: -80,
                sm: -100,
              },
              top: {
                xs: -100,
                sm: -140,
              },
              bgcolor: "primary.main",
              opacity: 0.10,
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                mb: 0.75,
              }}
            >
              HEALTH COPILOT
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 850,
                letterSpacing: "-0.03em",
                fontSize: {
                  xs: "1.7rem",
                  sm: "2.2rem",
                  md: "2.6rem",
                },
              }}
            >
              Welcome back, {firstName} 👋
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                maxWidth: 650,
                lineHeight: 1.7,
              }}
            >
              Keep building healthier habits. Your
              personal health dashboard gives you a
              simple view of your progress.
            </Typography>
          </Box>
        </Box>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}

        <Grid
          container
          spacing={{
            xs: 1.5,
            sm: 2,
          }}
        >

          {/* =====================================================
              NUTRITION
          ===================================================== */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.08)",
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
                <Stack spacing={1.5}>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor:
                        "rgba(76,175,80,0.10)",
                      color: "success.main",
                    }}
                  >
                    <RestaurantOutlinedIcon />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Nutrition
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Track your meals, calories,
                    nutrition and daily food intake.
                  </Typography>

                  <Button
                    href="/nutrition"
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Open Nutrition
                  </Button>

                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* =====================================================
              WORKOUT
          ===================================================== */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.08)",
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
                <Stack spacing={1.5}>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor:
                        "rgba(255,152,0,0.10)",
                      color: "warning.main",
                    }}
                  >
                    <FitnessCenterOutlinedIcon />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Workout
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Workout tracking is coming
                    soon.
                  </Typography>

                  <Button
                    disabled
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Coming soon
                  </Button>

                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* =====================================================
              AI CHAT
          ===================================================== */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: "divider",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.08)",
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
                <Stack spacing={1.5}>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor:
                        "rgba(124,77,255,0.10)",
                      color: "secondary.main",
                    }}
                  >
                    <ChatOutlinedIcon />
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    AI Copilot
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Talk to your AI health
                    assistant.
                  </Typography>

                  <Button
                    href="/chat"
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Open Chat
                  </Button>

                </Stack>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* =========================================================
            WEIGHT PROGRESS
        ========================================================= */}

        <Card
          elevation={0}
          sx={{
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            position: "relative",
          }}
        >

          <Box
            sx={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              right: -120,
              top: -120,
              bgcolor: "primary.main",
              opacity: 0.06,
              filter: "blur(45px)",
              pointerEvents: "none",
            }}
          />

          <CardContent
            sx={{
              position: "relative",
              zIndex: 1,
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },
              },
            }}
          >

            <Stack spacing={3}>

              {/* Header */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  justifyContent: "space-between",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                }}
              >

                <Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <MonitorWeightOutlinedIcon
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 850,
                      }}
                    >
                      Weight Progress
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Track your journey toward your
                    goal.
                  </Typography>

                </Box>

                <Button
                  href="/weight"
                  variant="outlined"
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  sx={{
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Weight
                </Button>

              </Stack>

              {/* Loading */}

              {loadingStats ? (
                <Box
                  sx={{
                    minHeight: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              ) : !hasWeightData ? (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <Box
                  sx={{
                    minHeight: {
                      xs: 240,
                      sm: 260,
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                  }}
                >

                  <Stack
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      maxWidth: 500,
                    }}
                  >

                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor:
                          "rgba(33,150,243,0.10)",
                        color: "primary.main",
                      }}
                    >
                      <MonitorWeightOutlinedIcon
                        sx={{
                          fontSize: 32,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 850,
                      }}
                    >
                      Start tracking your progress
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                      }}
                    >
                      Add your first weight
                      measurement to start seeing
                      your progress here.
                    </Typography>

                    <Button
                      href="/weight"
                      variant="contained"
                      sx={{
                        mt: 1,
                        borderRadius: 2.5,
                        px: 3,
                        py: 1.1,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      Add Weight
                    </Button>

                  </Stack>
                </Box>

              ) : (

                /* =================================================
                   WEIGHT DATA
                ================================================= */

                <Stack spacing={3}>

                  {/* Stats */}

                  <Grid
                    container
                    spacing={1.5}
                  >

                    {/* Current */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          height: "100%",
                          borderRadius: 3,
                          bgcolor:
                            "action.hover",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Current Weight
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            mt: 0.75,
                            fontWeight: 850,
                            lineHeight: 1.2,
                          }}
                        >
                          {stats?.current_weight !=
                          null
                            ? stats.current_weight.toFixed(
                                1
                              )
                            : "--"}

                          <Typography
                            component="span"
                            sx={{
                              ml: 0.75,
                              fontSize: {
                                xs: "0.9rem",
                                sm: "1rem",
                              },
                              fontWeight: 700,
                              color:
                                "text.secondary",
                            }}
                          >
                            kg
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Starting */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          height: "100%",
                          borderRadius: 3,
                          bgcolor:
                            "action.hover",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Starting Weight
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            mt: 0.75,
                            fontWeight: 850,
                            lineHeight: 1.2,
                          }}
                        >
                          {stats?.starting_weight !=
                          null
                            ? stats.starting_weight.toFixed(
                                1
                              )
                            : "--"}

                          <Typography
                            component="span"
                            sx={{
                              ml: 0.75,
                              fontSize: {
                                xs: "0.9rem",
                                sm: "1rem",
                              },
                              fontWeight: 700,
                              color:
                                "text.secondary",
                            }}
                          >
                            kg
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Goal */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          height: "100%",
                          borderRadius: 3,
                          bgcolor:
                            "action.hover",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Target Weight
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            mt: 0.75,
                            fontWeight: 850,
                            lineHeight: 1.2,
                          }}
                        >
                          {stats?.target_weight !=
                          null
                            ? stats.target_weight.toFixed(
                                1
                              )
                            : "--"}

                          <Typography
                            component="span"
                            sx={{
                              ml: 0.75,
                              fontSize: {
                                xs: "0.9rem",
                                sm: "1rem",
                              },
                              fontWeight: 700,
                              color:
                                "text.secondary",
                            }}
                          >
                            kg
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>

                  </Grid>

                  {/* Progress */}

                  {stats?.goal_progress_percent !=
                    null && (
                    <Box>

                      <Stack
                        direction="row"
                        sx={{
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Goal Progress
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 850,
                            color:
                              "primary.main",
                          }}
                        >
                          {progress.toFixed(0)}%
                        </Typography>

                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 9,
                          borderRadius: 10,
                          bgcolor:
                            "action.hover",
                          "& .MuiLinearProgress-bar":
                            {
                              borderRadius: 10,
                              transition:
                                "transform 0.8s ease",
                            },
                        }}
                      />

                    </Box>
                  )}

                  {/* Change */}

                  {stats?.weight_change != null && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor:
                          stats.weight_change <= 0
                            ? "rgba(76,175,80,0.08)"
                            : "rgba(255,152,0,0.08)",
                      }}
                    >

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Overall change
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          mt: 0.5,
                          fontWeight: 800,
                        }}
                      >
                        {stats.weight_change > 0
                          ? "+"
                          : ""}
                        {stats.weight_change.toFixed(
                          1
                        )}{" "}
                        kg
                      </Typography>

                    </Box>
                  )}

                </Stack>
              )}

            </Stack>

          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}