"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import getErrorMessage from "@/lib/error";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import CloseIcon from "@mui/icons-material/Close";

import {
  Weight,
  WeightStats,
  WeightListResponse,
} from "@/types/weight";

/* =========================================================
   TYPES
========================================================= */

interface WeightFormData {
  weight_kg: string;
  notes: string;
  recorded_at: string;
}

interface ProfileResponse {
  full_name: string;
  email: string;
  profile_picture: string | null;
  gender: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  target_weight_kg: number | null;
  activity_level: string | null;
  goal: string | null;
  diet_preference: string | null;
  medical_conditions: string | null;
  food_allergies: string | null;
  bio: string | null;
}

/* =========================================================
   HELPERS
========================================================= */

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(
  dateString: string | null | undefined
): string {
  if (!dateString) {
    return "-";
  }

  const dateOnly = dateString.substring(0, 10);

  const parts = dateOnly.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  const [year, month, day] = parts;

  return `${day}/${month}/${year}`;
}

function getProgress(
  current: number | null,
  target: number | null,
  starting: number | null
): number {
  if (
    current === null ||
    target === null ||
    starting === null ||
    starting === target
  ) {
    return 0;
  }

  const totalDistance = Math.abs(starting - target);
  const currentDistance = Math.abs(current - target);

  if (totalDistance === 0) {
    return 100;
  }

  const progress =
    ((totalDistance - currentDistance) / totalDistance) *
    100;

  return Math.max(0, Math.min(100, progress));
}

/* =========================================================
   PAGE
========================================================= */

export default function WeightPage() {
  /* -------------------------------------------------------
     WEIGHT DATA
  ------------------------------------------------------- */

  const [weights, setWeights] = useState<Weight[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);

  /* -------------------------------------------------------
     PROFILE
  ------------------------------------------------------- */

  const [profile, setProfile] =
    useState<ProfileResponse | null>(null);

  const [targetWeight, setTargetWeight] =
    useState<number | null>(null);

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTarget, setSavingTarget] = useState(false);

  /* -------------------------------------------------------
     ALERTS
  ------------------------------------------------------- */

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* -------------------------------------------------------
     WEIGHT DIALOG
  ------------------------------------------------------- */

  const [weightDialogOpen, setWeightDialogOpen] =
    useState(false);

  const [editingWeight, setEditingWeight] =
    useState<Weight | null>(null);

  const [form, setForm] = useState<WeightFormData>({
    weight_kg: "",
    notes: "",
    recorded_at: getTodayDate(),
  });

  /* -------------------------------------------------------
     TARGET DIALOG
  ------------------------------------------------------- */

  const [targetDialogOpen, setTargetDialogOpen] =
    useState(false);

  const [targetInput, setTargetInput] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        weightsResponse,
        statsResponse,
        profileResponse,
      ] = await Promise.all([
        api.get<WeightListResponse>("/weights", {
          params: {
            page: 1,
            limit: 100,
            sort: "desc",
          },
        }),

        api.get<WeightStats>("/weights/stats"),

        api.get<ProfileResponse>("/profile"),
      ]);

      setWeights(weightsResponse.data.items);

      setStats(statsResponse.data);

      setProfile(profileResponse.data);

      setTargetWeight(
        profileResponse.data.target_weight_kg
      );
    } catch (error) {
      console.error(
        "Failed to load weight data:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "LOAD DATA STATUS:",
          error.response?.status
        );

        console.error(
          "LOAD DATA RESPONSE:",
          error.response?.data
        );
      }

      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     TARGET WEIGHT
  ========================================================= */

  const openTargetDialog = () => {
    setTargetInput(
      targetWeight !== null
        ? String(targetWeight)
        : ""
    );

    setError(null);
    setSuccess(null);

    setTargetDialogOpen(true);
  };

  const closeTargetDialog = () => {
    if (savingTarget) {
      return;
    }

    setTargetDialogOpen(false);
  };

  const saveTargetWeight = async () => {
    const value = targetInput.trim();

    if (!value) {
      setError("Please enter a target weight.");
      return;
    }

    const parsedTarget = Number(value);

    if (!Number.isFinite(parsedTarget)) {
      setError("Please enter a valid target weight.");
      return;
    }

    if (parsedTarget <= 0) {
      setError(
        "Target weight must be greater than 0."
      );
      return;
    }

    if (parsedTarget > 500) {
      setError(
        "Please enter a realistic target weight."
      );
      return;
    }

    try {
      setSavingTarget(true);
      setError(null);
      setSuccess(null);

      const response =
        await api.patch<ProfileResponse>(
          "/profile",
          {
            target_weight_kg: parsedTarget,
          }
        );

      setProfile(response.data);

      setTargetWeight(
        response.data.target_weight_kg
      );

      const statsResponse =
        await api.get<WeightStats>(
          "/weights/stats"
        );

      setStats(statsResponse.data);

      setTargetDialogOpen(false);

      setSuccess(
        "Target weight updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save target weight:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "TARGET STATUS:",
          error.response?.status
        );

        console.error(
          "TARGET RESPONSE:",
          error.response?.data
        );
      }

      setError(
        getErrorMessage(error)
      );
    } finally {
      setSavingTarget(false);
    }
  };

  /* =========================================================
     WEIGHT DIALOG
  ========================================================= */

  const openAddWeightDialog = () => {
    setEditingWeight(null);

    setForm({
      weight_kg: "",
      notes: "",
      recorded_at: getTodayDate(),
    });

    setError(null);
    setSuccess(null);

    setWeightDialogOpen(true);
  };

  const openEditWeightDialog = (
    weight: Weight
  ) => {
    setEditingWeight(weight);

    setForm({
      weight_kg: String(weight.weight_kg),
      notes: weight.notes ?? "",
      recorded_at: weight.recorded_at
        ? weight.recorded_at.substring(0, 10)
        : getTodayDate(),
    });

    setError(null);
    setSuccess(null);

    setWeightDialogOpen(true);
  };

  const closeWeightDialog = () => {
    if (saving) {
      return;
    }

    setWeightDialogOpen(false);
  };

  /* =========================================================
     SAVE WEIGHT
  ========================================================= */

  const saveWeight = async () => {
    const value = form.weight_kg.trim();

    /* -------------------------------------------------------
       VALIDATE WEIGHT
    ------------------------------------------------------- */

    if (!value) {
      setError("Please enter your weight.");
      return;
    }

    const parsedWeight = Number(value);

    if (!Number.isFinite(parsedWeight)) {
      setError("Please enter a valid weight.");
      return;
    }

    if (parsedWeight <= 0) {
      setError(
        "Weight must be greater than 0 kg."
      );
      return;
    }

    if (parsedWeight > 500) {
      setError(
        "Please enter a realistic weight."
      );
      return;
    }

    /* -------------------------------------------------------
       VALIDATE DATE
    ------------------------------------------------------- */

    if (!form.recorded_at) {
      setError("Please select a date.");
      return;
    }

    /* -------------------------------------------------------
       CREATE PAYLOAD
    ------------------------------------------------------- */

    const payload: {
      weight_kg: number;
      notes: string | null;
      recorded_at: string;
    } = {
      weight_kg: parsedWeight,
      notes: form.notes.trim() || null,
      recorded_at: form.recorded_at.substring(0, 10),
    };

    /* -------------------------------------------------------
       DEBUG REQUEST
    ------------------------------------------------------- */

    console.log(
      "================================="
    );

    console.log(
      editingWeight
        ? "PATCH /weights"
        : "POST /weights"
    );

    console.log(
      "Payload:",
      payload
    );

    console.log(
      "JSON:",
      JSON.stringify(payload)
    );

    console.log(
      "================================="
    );

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      /* -----------------------------------------------------
         UPDATE EXISTING WEIGHT
      ----------------------------------------------------- */

      if (editingWeight) {
        const response =
          await api.patch<Weight>(
            `/weights/${editingWeight.id}`,
            payload
          );

        console.log(
          "Weight update response:",
          response.data
        );

        setSuccess(
          "Weight entry updated successfully."
        );
      }

      /* -----------------------------------------------------
         CREATE NEW WEIGHT
      ----------------------------------------------------- */

      else {
        const response =
          await api.post<Weight>(
            "/weights",
            payload
          );

        console.log(
          "Weight create response:",
          response.data
        );

        setSuccess(
          "Weight recorded successfully."
        );
      }

      /* -----------------------------------------------------
         CLOSE DIALOG
      ----------------------------------------------------- */

      setWeightDialogOpen(false);

      /* -----------------------------------------------------
         RELOAD DATA
      ----------------------------------------------------- */

      await loadData();

    } catch (error: unknown) {

      console.error(
        "================================="
      );

      console.error(
        "FAILED TO SAVE WEIGHT"
      );

      console.error(
        "================================="
      );

      console.error(
        "Original error:",
        error
      );

      /* -----------------------------------------------------
         AXIOS ERROR DETAILS
      ----------------------------------------------------- */

      if (axios.isAxiosError(error)) {

        console.error(
          "HTTP STATUS:",
          error.response?.status
        );

        console.error(
          "RESPONSE DATA:",
          error.response?.data
        );

        console.error(
          "REQUEST URL:",
          error.config?.url
        );

        console.error(
          "REQUEST METHOD:",
          error.config?.method
        );

        console.error(
          "REQUEST BODY:",
          error.config?.data
        );

        console.error(
          "REQUEST HEADERS:",
          error.config?.headers
        );

        /* ---------------------------------------------------
           FASTAPI ERROR
        --------------------------------------------------- */

        const responseData =
          error.response?.data;

        if (
          responseData &&
          typeof responseData === "object" &&
          "detail" in responseData
        ) {

          const detail =
            (
              responseData as {
                detail?: unknown;
              }
            ).detail;

          console.error(
            "FASTAPI DETAIL:",
            detail
          );

          /* -------------------------------------------------
             FASTAPI VALIDATION ERRORS
          ------------------------------------------------- */

          if (Array.isArray(detail)) {

            const messages = detail
              .map((item) => {

                if (
                  item &&
                  typeof item === "object" &&
                  "msg" in item
                ) {
                  return String(
                    (
                      item as {
                        msg: unknown;
                      }
                    ).msg
                  );
                }

                return String(item);
              })
              .join(", ");

            setError(messages);
          }

          /* -------------------------------------------------
             FASTAPI STRING ERROR
          ------------------------------------------------- */

          else if (
            typeof detail === "string"
          ) {
            setError(detail);
          }

          /* -------------------------------------------------
             UNKNOWN FASTAPI DETAIL
          ------------------------------------------------- */

          else {
            setError(
              "The server rejected the weight data."
            );
          }
        }

        /* ---------------------------------------------------
           NO FASTAPI DETAIL
        --------------------------------------------------- */

        else {
          setError(
            getErrorMessage(error)
          );
        }
      }

      /* -----------------------------------------------------
         NON-AXIOS ERROR
      ----------------------------------------------------- */

      else {
        setError(
          getErrorMessage(error)
        );
      }

    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE WEIGHT
  ========================================================= */

  const deleteWeight = async (
    weight: Weight
  ) => {
    const confirmed = window.confirm(
      `Delete the ${weight.weight_kg} kg entry recorded on ${formatDate(
        weight.recorded_at
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await api.delete(
        `/weights/${weight.id}`
      );

      setSuccess(
        "Weight entry deleted successfully."
      );

      await loadData();

    } catch (error) {
      console.error(
        "Failed to delete weight:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "DELETE STATUS:",
          error.response?.status
        );

        console.error(
          "DELETE RESPONSE:",
          error.response?.data
        );
      }

      setError(
        getErrorMessage(error)
      );
    }
  };

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const currentWeight =
    stats?.current_weight ?? null;

  const startingWeight =
    stats?.starting_weight ?? null;

  const actualTargetWeight =
    stats?.target_weight ??
    targetWeight ??
    null;

  const weightChange =
    stats?.weight_change ?? 0;

  const remainingToGoal =
    stats?.remaining_to_goal ??
    (
      currentWeight !== null &&
      actualTargetWeight !== null
        ? Math.abs(
            currentWeight -
              actualTargetWeight
          )
        : null
    );

  const progress = useMemo(() => {
    if (
      stats?.goal_progress_percent !== null &&
      stats?.goal_progress_percent !== undefined
    ) {
      return Math.max(
        0,
        Math.min(
          100,
          stats.goal_progress_percent
        )
      );
    }

    return getProgress(
      currentWeight,
      actualTargetWeight,
      startingWeight
    );
  }, [
    stats?.goal_progress_percent,
    currentWeight,
    actualTargetWeight,
    startingWeight,
  ]);

  const trendIsDown =
    weightChange < 0;

  const trendIsUp =
    weightChange > 0;

  /* =========================================================
     LOADING
  ========================================================= */

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

          <Typography color="text.secondary">
            Loading weight data...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        px: {
          xs: 2,
          md: 3,
        },
        py: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Weight
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Track your weight and progress
            toward your goal.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddWeightDialog}
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
          }}
        >
          Add Weight
        </Button>
      </Stack>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() =>
            setSuccess(null)
          }
        >
          {success}
        </Alert>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        {/* CURRENT */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Current Weight
                  </Typography>

                  <MonitorWeightIcon color="primary" />
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {currentWeight !== null
                    ? `${currentWeight} kg`
                    : "--"}
                </Typography>

                {stats?.latest_recorded_at && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Last recorded{" "}
                    {formatDate(
                      stats.latest_recorded_at
                    )}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* STARTING */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Starting Weight
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {startingWeight !== null
                    ? `${startingWeight} kg`
                    : "--"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {stats?.entries ?? 0}{" "}
                  recorded{" "}
                  {stats?.entries === 1
                    ? "entry"
                    : "entries"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* CHANGE */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Weight Change
                  </Typography>

                  {trendIsDown ? (
                    <TrendingDownIcon color="success" />
                  ) : trendIsUp ? (
                    <TrendingUpIcon color="error" />
                  ) : (
                    <MonitorWeightIcon color="disabled" />
                  )}
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: trendIsDown
                      ? "success.main"
                      : trendIsUp
                      ? "error.main"
                      : "text.primary",
                  }}
                >
                  {weightChange > 0
                    ? "+"
                    : ""}
                  {weightChange.toFixed(1)} kg
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Since your first entry
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* TARGET */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Target Weight
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={
                      openTargetDialog
                    }
                    aria-label="Edit target weight"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {actualTargetWeight !== null
                    ? `${actualTargetWeight} kg`
                    : "--"}
                </Typography>

                <Button
                  size="small"
                  variant="text"
                  startIcon={<FlagIcon />}
                  onClick={
                    openTargetDialog
                  }
                  sx={{
                    alignSelf:
                      "flex-start",
                    px: 0,
                    minWidth: 0,
                  }}
                >
                  Edit target
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =====================================================
          GOAL PROGRESS
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Stack spacing={2.5}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              sx={{
                justifyContent:
                  "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
              spacing={1}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Goal Progress
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {actualTargetWeight !== null
                    ? `Target: ${actualTargetWeight} kg`
                    : "Set a target weight to track your goal."}
                </Typography>
              </Box>

              <Chip
                label={`${progress.toFixed(0)}%`}
                color="primary"
                sx={{
                  fontWeight: 800,
                }}
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 10,
              }}
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              sx={{
                justifyContent:
                  "space-between",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Current:{" "}
                <strong>
                  {currentWeight !== null
                    ? `${currentWeight} kg`
                    : "--"}
                </strong>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Remaining:{" "}
                <strong>
                  {remainingToGoal !== null
                    ? `${remainingToGoal.toFixed(
                        1
                      )} kg`
                    : "--"}
                </strong>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Target:{" "}
                <strong>
                  {actualTargetWeight !== null
                    ? `${actualTargetWeight} kg`
                    : "--"}
                </strong>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* =====================================================
          WEIGHT HISTORY
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: 0,
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Weight History
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Your recorded weight entries.
                </Typography>
              </Box>

              <Chip
                label={`${weights.length} ${
                  weights.length === 1
                    ? "entry"
                    : "entries"
                }`}
                variant="outlined"
              />
            </Stack>
          </Box>

          <Divider />

          {weights.length === 0 ? (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign: "center",
              }}
            >
              <MonitorWeightIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 2,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                No weight entries yet
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 3,
                }}
              >
                Add your first weight
                measurement to start tracking
                your progress.
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={
                  openAddWeightDialog
                }
              >
                Add Weight
              </Button>
            </Box>
          ) : (
            <Box>
              {weights.map(
                (
                  weight,
                  index
                ) => (
                  <Box
                    key={weight.id}
                  >
                    <Box
                      sx={{
                        px: {
                          xs: 2,
                          md: 3,
                        },
                        py: 2,
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: 2,
                        transition:
                          "background-color 0.2s",
                        "&:hover": {
                          backgroundColor:
                            "action.hover",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          minWidth: 0,
                          alignItems:
                            "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius:
                              "50%",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            backgroundColor:
                              "action.selected",
                            flexShrink: 0,
                          }}
                        >
                          <MonitorWeightIcon color="primary" />
                        </Box>

                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 800,
                            }}
                          >
                            {
                              weight.weight_kg
                            }{" "}
                            kg
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {formatDate(
                              weight.recorded_at
                            )}
                          </Typography>

                          {weight.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                                maxWidth: {
                                  xs: 150,
                                  sm: 350,
                                  md: 500,
                                },
                              }}
                            >
                              {
                                weight.notes
                              }
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          flexShrink: 0,
                        }}
                      >
                        <IconButton
                          onClick={() =>
                            openEditWeightDialog(
                              weight
                            )
                          }
                          aria-label="Edit weight"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            deleteWeight(
                              weight
                            )
                          }
                          aria-label="Delete weight"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>

                    {index <
                      weights.length -
                        1 && (
                      <Divider />
                    )}
                  </Box>
                )
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          ADD / EDIT WEIGHT DIALOG
      ===================================================== */}

      <Dialog
        open={weightDialogOpen}
        onClose={closeWeightDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              {editingWeight
                ? "Edit Weight"
                : "Add Weight"}
            </Typography>

            <IconButton
              onClick={
                closeWeightDialog
              }
              disabled={saving}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{
              pt: 1,
            }}
          >
            <TextField
              label="Weight"
              type="number"
              value={form.weight_kg}
              onChange={(event) =>
                setForm(
                  (
                    previous
                  ) => ({
                    ...previous,
                    weight_kg:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
              required
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
                input: {
                  endAdornment: (
                    <Typography
                      color="text.secondary"
                      sx={{
                        ml: 1,
                      }}
                    >
                      kg
                    </Typography>
                  ),
                },
              }}
            />

            <TextField
              label="Date"
              type="date"
              value={
                form.recorded_at
              }
              onChange={(event) =>
                setForm(
                  (
                    previous
                  ) => ({
                    ...previous,
                    recorded_at:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
              required
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Notes"
              value={form.notes}
              onChange={(event) =>
                setForm(
                  (
                    previous
                  ) => ({
                    ...previous,
                    notes:
                      event.target
                        .value,
                  })
                )
              }
              fullWidth
              multiline
              minRows={3}
              placeholder="Optional notes..."
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Date is saved as YYYY-MM-DD.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              closeWeightDialog
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveWeight
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                />
              ) : editingWeight ? (
                <EditIcon />
              ) : (
                <AddIcon />
              )
            }
          >
            {saving
              ? "Saving..."
              : editingWeight
              ? "Update Weight"
              : "Save Weight"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          TARGET WEIGHT DIALOG
      ===================================================== */}

      <Dialog
        open={targetDialogOpen}
        onClose={
          closeTargetDialog
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              Target Weight
            </Typography>

            <IconButton
              onClick={
                closeTargetDialog
              }
              disabled={
                savingTarget
              }
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Set the weight you want to
              reach. This value is stored in
              your profile and is used to
              calculate your weight progress.
            </Typography>

            <TextField
              label="Target weight"
              type="number"
              value={
                targetInput
              }
              onChange={(event) =>
                setTargetInput(
                  event.target
                    .value
                )
              }
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
                input: {
                  endAdornment: (
                    <Typography
                      color="text.secondary"
                      sx={{
                        ml: 1,
                      }}
                    >
                      kg
                    </Typography>
                  ),
                },
              }}
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  saveTargetWeight();
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              closeTargetDialog
            }
            disabled={
              savingTarget
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveTargetWeight
            }
            disabled={
              savingTarget
            }
            startIcon={
              savingTarget ? (
                <CircularProgress
                  size={18}
                />
              ) : (
                <FlagIcon />
              )
            }
          >
            {savingTarget
              ? "Saving..."
              : "Save Target"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}