"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <Box
        component="header"
        sx={{
          position: "relative",
          zIndex: 10,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 1.5,
              sm: 2,
              md: 2.5,
            },
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Logo */}

            <Logo />

            {/* Actions */}

            <Stack
              direction="row"
              spacing={{
                xs: 1,
                sm: 1.5,
              }}
            >
              <Button
                href="/login"
                variant="outlined"
                size="small"
                endIcon={<LoginIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: {
                    xs: 1.5,
                    sm: 2,
                  },
                  py: 1,

                  fontWeight: 700,

                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                }}
              >
                Login
              </Button>

              <Button
                href="/register"
                variant="contained"
                size="small"
                endIcon={
                  <PersonAddAltIcon />
                }
                sx={{
                  borderRadius: 2.5,
                  px: {
                    xs: 1.5,
                    sm: 2,
                  },
                  py: 1,

                  fontWeight: 700,

                  boxShadow:
                    "0 8px 25px rgba(33,150,243,0.22)",
                }}
              >
                Register
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <Box
        component="main"
        sx={{
          position: "relative",
        }}
      >
        {/* Background glow */}

        <Box
          sx={{
            position: "absolute",
            width: {
              xs: 300,
              md: 600,
            },

            height: {
              xs: 300,
              md: 600,
            },

            top: {
              xs: -100,
              md: -180,
            },

            left: "50%",

            transform:
              "translateX(-50%)",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(33,150,243,0.16) 0%, rgba(33,150,243,0.05) 40%, transparent 70%)",

            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,

            pt: {
              xs: 8,
              sm: 11,
              md: 14,
            },

            pb: {
              xs: 8,
              sm: 10,
              md: 12,
            },
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Badge */}

            <Chip
              icon={
                <AutoAwesomeRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              }
              label="Your intelligent health companion"
              sx={{
                mb: 3,

                px: 1,

                height: 34,

                borderRadius: 5,

                fontWeight: 700,

                bgcolor:
                  "rgba(33,150,243,0.08)",

                border: "1px solid",

                borderColor:
                  "rgba(33,150,243,0.18)",

                color: "primary.main",

                "& .MuiChip-icon": {
                  color: "primary.main",
                },
              }}
            />

            {/* Heading */}

            <Typography
              component="h1"
              sx={{
                maxWidth: 950,

                fontSize: {
                  xs: "2.5rem",
                  sm: "3.6rem",
                  md: "5rem",
                },

                lineHeight: {
                  xs: 1.08,
                  md: 1.02,
                },

                fontWeight: 900,

                letterSpacing: {
                  xs: "-0.04em",
                  md: "-0.055em",
                },
              }}
            >
              Take control of your
              <Box
                component="span"
                sx={{
                  display: "block",

                  background:
                    "linear-gradient(90deg, #2196f3, #7c4dff)",

                  backgroundClip:
                    "text",

                  WebkitBackgroundClip:
                    "text",

                  WebkitTextFillColor:
                    "transparent",
                }}
              >
                health journey.
              </Box>
            </Typography>

            {/* Description */}

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 700,

                mt: 3,

                lineHeight: 1.7,

                fontWeight: 400,

                fontSize: {
                  xs: "1rem",
                  sm: "1.15rem",
                  md: "1.25rem",
                },
              }}
            >
              Health Copilot brings your nutrition,
              weight, workouts and AI health
              assistance together in one intelligent
              dashboard.
            </Typography>

            {/* CTA */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
              sx={{
                mt: 4,

                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              <Button
                href="/register"
                variant="contained"
                size="large"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 190,
                  },

                  borderRadius: 3,

                  px: 3,

                  py: 1.5,

                  fontWeight: 800,

                  fontSize: "1rem",

                  boxShadow:
                    "0 12px 35px rgba(33,150,243,0.28)",

                  "&:hover": {
                    transform:
                      "translateY(-2px)",

                    boxShadow:
                      "0 16px 40px rgba(33,150,243,0.35)",
                  },

                  transition:
                    "all 0.25s ease",
                }}
              >
                Get started
              </Button>

              <Button
                href="/login"
                variant="outlined"
                size="large"
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 150,
                  },

                  borderRadius: 3,

                  px: 3,

                  py: 1.5,

                  fontWeight: 700,
                }}
              >
                Sign in
              </Button>
            </Stack>
          </Stack>

          {/* ===================================================== */}
          {/* DASHBOARD PREVIEW */}
          {/* ===================================================== */}

          <Box
            sx={{
              mt: {
                xs: 7,
                md: 10,
              },

              maxWidth: 1050,

              mx: "auto",

              position: "relative",
            }}
          >
            {/* Glow */}

            <Box
              sx={{
                position: "absolute",

                inset: "10% 5% -10%",

                borderRadius: 8,

                background:
                  "rgba(33,150,243,0.16)",

                filter: "blur(70px)",

                opacity: 0.5,

                pointerEvents: "none",
              }}
            />

            <Paper
              elevation={0}
              sx={{
                position: "relative",

                overflow: "hidden",

                borderRadius: {
                  xs: 3,
                  md: 5,
                },

                border: "1px solid",

                borderColor:
                  "rgba(33,150,243,0.18)",

                background:
                  "linear-gradient(145deg, rgba(33,150,243,0.08), rgba(255,255,255,0.02))",

                backdropFilter:
                  "blur(20px)",

                p: {
                  xs: 2,
                  sm: 3,
                  md: 4,
                },

                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.12)",
              }}
            >
              {/* Fake dashboard top */}

              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent:
                    "space-between",

                  mb: 3,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  {[1, 2, 3].map(
                    (item) => (
                      <Box
                        key={item}
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius:
                            "50%",

                          bgcolor:
                            item === 1
                              ? "error.main"
                              : item === 2
                                ? "warning.main"
                                : "success.main",
                        }}
                      />
                    )
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  HEALTH COPILOT
                </Typography>
              </Stack>

              {/* Dashboard cards */}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },

                  gap: 2,
                }}
              >
                <PreviewCard
                  icon={
                    <RestaurantOutlinedIcon />
                  }
                  title="Nutrition"
                  value="1,840"
                  unit="kcal"
                />

                <PreviewCard
                  icon={
                    <MonitorWeightOutlinedIcon />
                  }
                  title="Weight"
                  value="72.4"
                  unit="kg"
                />

                <PreviewCard
                  icon={
                    <FitnessCenterOutlinedIcon />
                  }
                  title="Activity"
                  value="8,240"
                  unit="steps"
                />

                <PreviewCard
                  icon={
                    <ChatOutlinedIcon />
                  }
                  title="AI Copilot"
                  value="Ready"
                  unit=""
                />
              </Box>

              {/* Graph */}

              <Box
                sx={{
                  mt: 2,

                  height: {
                    xs: 150,
                    sm: 190,
                    md: 220,
                  },

                  borderRadius: 3,

                  bgcolor:
                    "rgba(33,150,243,0.035)",

                  border: "1px solid",

                  borderColor:
                    "divider",

                  position: "relative",

                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position:
                      "absolute",

                    left: 0,
                    right: 0,
                    bottom: "28%",

                    height: 2,

                    background:
                      "linear-gradient(90deg, transparent, #2196f3, #7c4dff, transparent)",

                    boxShadow:
                      "0 0 15px rgba(33,150,243,0.6)",

                    transform:
                      "rotate(-4deg)",
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    position:
                      "absolute",

                    top: 18,
                    left: 18,

                    fontWeight: 700,
                  }}
                >
                  Health progress
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>

        {/* ======================================================= */}
        {/* FEATURES */}
        {/* ======================================================= */}

        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              py: {
                xs: 7,
                md: 10,
              },
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                textAlign: "center",
                mb: 5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  letterSpacing:
                    "-0.035em",
                }}
              >
                Everything you need
                in one place.
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,

                  maxWidth: 600,

                  lineHeight: 1.7,
                }}
              >
                Track your progress, understand
                your habits and make better health
                decisions with a single intelligent
                platform.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },

                gap: 2,
              }}
            >
              <FeatureCard
                icon={
                  <RestaurantOutlinedIcon />
                }
                title="Nutrition"
                description="Keep track of your daily nutrition and understand what you're putting into your body."
              />

              <FeatureCard
                icon={
                  <MonitorWeightOutlinedIcon />
                }
                title="Weight tracking"
                description="Record your progress and visualize how your weight changes over time."
              />

              <FeatureCard
                icon={
                  <FitnessCenterOutlinedIcon />
                }
                title="Workouts"
                description="Keep your fitness routine organized and stay consistent with your goals."
              />

              <FeatureCard
                icon={
                  <ChatOutlinedIcon />
                }
                title="AI Copilot"
                description="Get intelligent assistance to help you understand and improve your health journey."
              />
            </Box>
          </Container>
        </Box>

        {/* ======================================================= */}
        {/* FINAL CTA */}
        {/* ======================================================= */}

        <Container
          maxWidth="md"
          sx={{
            py: {
              xs: 8,
              md: 12,
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 4,
                sm: 6,
              },

              borderRadius: {
                xs: 4,
                md: 6,
              },

              textAlign: "center",

              border: "1px solid",

              borderColor:
                "rgba(33,150,243,0.18)",

              background:
                "linear-gradient(135deg, rgba(33,150,243,0.10), rgba(124,77,255,0.08))",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 850,
                letterSpacing:
                  "-0.035em",
              }}
            >
              Your health.
              <br />
              Your data.
              <br />
              Your copilot.
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              Start building a clearer picture of
              your health today.
            </Typography>

            <Button
              href="/register"
              variant="contained"
              size="large"
              endIcon={
                <ArrowForwardRoundedIcon />
              }
              sx={{
                mt: 3,

                borderRadius: 3,

                px: 4,

                py: 1.5,

                fontWeight: 800,

                boxShadow:
                  "0 12px 35px rgba(33,150,243,0.25)",
              }}
            >
              Create your account
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              justifyContent:
                "space-between",
              alignItems: {
                xs: "center",
                sm: "center",
              },

              textAlign: {
                xs: "center",
                sm: "left",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              © {new Date().getFullYear()}{" "}
              Health Copilot
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 16,
                  color:
                    "success.main",
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Built for your health journey
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

/* =============================================================== */
/* PREVIEW CARD */
/* =============================================================== */

function PreviewCard({
  icon,
  title,
  value,
  unit,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,

        borderRadius: 3,

        border: "1px solid",

        borderColor:
          "rgba(33,150,243,0.10)",

        bgcolor:
          "background.paper",

        transition:
          "transform 0.25s ease, box-shadow 0.25s ease",

        "&:hover": {
          transform:
            "translateY(-3px)",

          boxShadow:
            "0 12px 30px rgba(33,150,243,0.10)",
        },
      }}
    >
      <Stack
        spacing={1.5}
      >
        <Box
          sx={{
            width: 38,
            height: 38,

            borderRadius: 2,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            color: "primary.main",

            bgcolor:
              "rgba(33,150,243,0.08)",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: "baseline",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
            }}
          >
            {value}
          </Typography>

          {unit && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {unit}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

/* =============================================================== */
/* FEATURE CARD */
/* =============================================================== */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2.5,
          md: 3,
        },

        height: "100%",

        borderRadius: 4,

        border: "1px solid",

        borderColor:
          "divider",

        transition:
          "all 0.25s ease",

        "&:hover": {
          transform:
            "translateY(-5px)",

          borderColor:
            "rgba(33,150,243,0.30)",

          boxShadow:
            "0 18px 45px rgba(33,150,243,0.10)",
        },
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,

            borderRadius: 3,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            color: "primary.main",

            bgcolor:
              "rgba(33,150,243,0.08)",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 750,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
      </Stack>
    </Paper>
  );
}