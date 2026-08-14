"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScaleIcon from "@mui/icons-material/Scale";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagIcon from "@mui/icons-material/Flag";

import toast from "react-hot-toast";

import {
  createWeight,
  deleteWeight,
  getWeightStats,
  getWeights,
  updateWeight,
  type Weight,
  type WeightStats,
} from "@/services/weight.service";

import WeightChart from "@/components/weight/WeightChart";

interface WeightForm {
  weight_kg: string;
  notes: string;
  recorded_at: string;
}

const initialForm: WeightForm = {
  weight_kg: "",
  notes: "",
  recorded_at: new Date().toISOString().slice(0, 16),
};

export default function WeightPage() {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] =
    useState<WeightForm>(initialForm);

  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [sort, setSort] =
    useState<"asc" | "desc">("desc");

  const [totalPages, setTotalPages] = useState(1);

  const hasData = weights.length > 0;

  const loadWeights = async () => {
    try {
      setLoading(true);

      const [weightsResponse, statsResponse] =
        await Promise.all([
          getWeights(page, limit, sort),
          getWeightStats(),
        ]);

      setWeights(
        weightsResponse.data.items ?? []
      );

      setTotalPages(
        weightsResponse.data.pages ?? 1
      );

      setStats(statsResponse.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load weight data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeights();
  }, [page, limit, sort]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      recorded_at: new Date()
        .toISOString()
        .slice(0, 16),
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const weight = Number(form.weight_kg);

    if (!form.weight_kg) {
      toast.error("Please enter your weight.");
      return;
    }

    if (
      Number.isNaN(weight) ||
      weight <= 0 ||
      weight > 500
    ) {
      toast.error(
        "Please enter a valid weight."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        weight_kg: weight,
        notes:
          form.notes.trim() || null,
        recorded_at: new Date(
          form.recorded_at
        ).toISOString(),
      };

      if (editingId) {
        await updateWeight(
          editingId,
          payload
        );

        toast.success(
          "Weight updated successfully."
        );
      } else {
        await createWeight(payload);

        toast.success(
          "Weight added successfully."
        );
      }

      resetForm();

      await loadWeights();
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to save weight."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (weight: Weight) => {
    setEditingId(weight.id);

    setForm({
      weight_kg: String(
        weight.weight_kg
      ),
      notes: weight.notes ?? "",
      recorded_at: new Date(
        weight.recorded_at
      )
        .toISOString()
        .slice(0, 16),
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this weight entry?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteWeight(id);

      toast.success(
        "Weight entry deleted."
      );

      await loadWeights();
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to delete weight entry."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formattedLatestDate = useMemo(() => {
    if (!stats?.latest_recorded_at) {
      return null;
    }

    return new Date(
      stats.latest_recorded_at
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [stats]);

  const currentWeight =
    typeof stats?.current_weight ===
    "number"
      ? stats.current_weight
      : null;

  const startingWeight =
    typeof stats?.starting_weight ===
    "number"
      ? stats.starting_weight
      : null;

  const targetWeight =
    typeof stats?.target_weight ===
    "number"
      ? stats.target_weight
      : null;

  const weightChange =
    typeof stats?.weight_change ===
    "number"
      ? stats.weight_change
      : null;

  const remainingToGoal =
    typeof stats?.remaining_to_goal ===
    "number"
      ? stats.remaining_to_goal
      : null;

  const progress =
    typeof stats?.goal_progress_percent ===
    "number"
      ? Math.max(
          0,
          Math.min(
            100,
            stats.goal_progress_percent
          )
        )
      : 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* HEADER */}
      <Stack
        sx={{
          gap: 2,
          mb: 4,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent: {
            xs: "flex-start",
            sm: "space-between",
          },
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Weight
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Track your progress and stay
            focused on your goal.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            setShowForm((value) => !value)
          }
          sx={{
            minHeight: 46,
            borderRadius: 3,
            fontWeight: 700,
            px: 2.5,
            boxShadow:
              "0 8px 24px rgba(33,150,243,0.20)",
          }}
        >
          {showForm
            ? "Close"
            : "Add Weight"}
        </Button>
      </Stack>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor:
              "rgba(33,150,243,0.18)",
            background:
              "linear-gradient(145deg, rgba(33,150,243,0.07), transparent)",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {editingId
                    ? "Edit Weight"
                    : "Record Weight"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Enter your measurement below.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Weight"
                  type="number"
                  value={form.weight_kg}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      weight_kg:
                        e.target.value,
                    }))
                  }
                  fullWidth
                  required
                  placeholder="e.g. 82.5"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: 500,
                      step: 0.1,
                    },
                  }}
                />

                <TextField
                  label="Recorded At"
                  type="datetime-local"
                  value={form.recorded_at}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      recorded_at:
                        e.target.value,
                    }))
                  }
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>

              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    notes: e.target.value,
                  }))
                }
                fullWidth
                multiline
                minRows={3}
                placeholder="Optional notes..."
              />

              <Stack
                sx={{
                  gap: 1.5,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={saving}
                  startIcon={
                    saving ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <ScaleIcon />
                    )
                  }
                  sx={{
                    minHeight: 46,
                    borderRadius: 3,
                    fontWeight: 700,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Weight"
                    : "Save Weight"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={saving}
                  sx={{
                    minHeight: 46,
                    borderRadius: 3,
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* LOADING */}
      {loading && (
        <Box
          sx={{
            py: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* NO DATA */}
      {!loading && !hasData && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            py: {
              xs: 7,
              sm: 10,
            },
            px: 3,
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  "rgba(33,150,243,0.10)",
                color: "primary.main",
              }}
            >
              <ScaleIcon
                sx={{
                  fontSize: 36,
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
              }}
            >
              Start tracking your weight
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 500,
                lineHeight: 1.7,
              }}
            >
              You don't have any weight
              measurements yet. Add your first
              measurement to start seeing your
              progress and weight trend.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                setShowForm(true)
              }
              sx={{
                mt: 1,
                borderRadius: 3,
                px: 3,
                minHeight: 46,
                fontWeight: 700,
              }}
            >
              Add First Weight
            </Button>
          </Stack>
        </Card>
      )}

      {/* DATA */}
      {!loading && hasData && (
        <>
          {/* STAT CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            {/* CURRENT */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor:
                  "rgba(33,150,243,0.16)",
                background:
                  "linear-gradient(145deg, rgba(33,150,243,0.10), transparent)",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Current Weight
                    </Typography>

                    <ScaleIcon
                      sx={{
                        color:
                          "primary.main",
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {currentWeight !==
                    null
                      ? `${currentWeight.toFixed(
                          1
                        )} kg`
                      : "--"}
                  </Typography>

                  {formattedLatestDate && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Updated{" "}
                      {formattedLatestDate}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* CHANGE */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Weight Change
                    </Typography>

                    {weightChange !==
                      null &&
                    weightChange <= 0 ? (
                      <TrendingDownIcon
                        sx={{
                          color:
                            "success.main",
                        }}
                      />
                    ) : (
                      <TrendingUpIcon
                        sx={{
                          color:
                            "warning.main",
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {weightChange !==
                    null
                      ? `${
                          weightChange > 0
                            ? "+"
                            : ""
                        }${weightChange.toFixed(
                          1
                        )} kg`
                      : "--"}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Since your first
                    measurement
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* GOAL */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Target Weight
                    </Typography>

                    <FlagIcon
                      sx={{
                        color:
                          "secondary.main",
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {targetWeight !==
                    null
                      ? `${targetWeight.toFixed(
                          1
                        )} kg`
                      : "--"}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Your goal
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* REMAINING */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Remaining to Goal
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {remainingToGoal !==
                    null
                      ? `${Math.abs(
                          remainingToGoal
                        ).toFixed(
                          1
                        )} kg`
                      : "--"}
                  </Typography>

                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 10,
                      bgcolor:
                        "action.hover",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${progress}%`,
                        height: "100%",
                        borderRadius: 10,
                        bgcolor:
                          "primary.main",
                        transition:
                          "width 0.6s ease",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {progress.toFixed(0)}%
                    goal progress
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* CHART */}
          <Box sx={{ mb: 3 }}>
            <WeightChart
              weights={weights}
            />
          </Box>

          {/* HISTORY */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
              }}
            >
              <Stack spacing={3}>
                {/* HISTORY HEADER */}
                <Stack
                  sx={{
                    gap: 2,
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    justifyContent:
                      "space-between",
                    alignItems: {
                      xs: "stretch",
                      sm: "center",
                    },
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
                    >
                      Your recorded
                      measurements
                    </Typography>
                  </Box>

                  <TextField
                    select
                    label="Sort"
                    value={sort}
                    onChange={(e) => {
                      setSort(
                        e.target.value as
                          | "asc"
                          | "desc"
                      );
                      setPage(1);
                    }}
                    size="small"
                    sx={{
                      minWidth: 150,
                    }}
                  >
                    <MenuItem value="desc">
                      Newest first
                    </MenuItem>

                    <MenuItem value="asc">
                      Oldest first
                    </MenuItem>
                  </TextField>
                </Stack>

                <Divider />

                {/* ENTRIES */}
                <Stack spacing={1}>
                  {weights.map(
                    (weight) => (
                      <Box
                        key={weight.id}
                        sx={{
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 2,
                          p: {
                            xs: 1.5,
                            sm: 2,
                          },
                          borderRadius: 3,
                          transition:
                            "background-color 0.2s ease",
                          "&:hover": {
                            bgcolor:
                              "action.hover",
                          },
                        }}
                      >
                        <Stack
                          sx={{
                            minWidth: 0,
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize:
                                "1.05rem",
                            }}
                          >
                            {Number(
                              weight.weight_kg
                            ).toFixed(
                              1
                            )}{" "}
                            kg
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {new Date(
                              weight.recorded_at
                            ).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </Typography>

                          {weight.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                              }}
                            >
                              {weight.notes}
                            </Typography>
                          )}
                        </Stack>

                        <Stack
                          sx={{
                            flexDirection:
                              "row",
                            alignItems:
                              "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconButton
                            aria-label="Edit weight"
                            onClick={() =>
                              handleEdit(
                                weight
                              )
                            }
                            disabled={
                              deletingId !==
                              null
                            }
                            sx={{
                              color:
                                "primary.main",
                            }}
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            aria-label="Delete weight"
                            onClick={() =>
                              handleDelete(
                                weight.id
                              )
                            }
                            disabled={
                              deletingId ===
                              weight.id
                            }
                            sx={{
                              color:
                                "error.main",
                            }}
                          >
                            {deletingId ===
                            weight.id ? (
                              <CircularProgress
                                size={20}
                                color="inherit"
                              />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>
                    )
                  )}
                </Stack>

                {/* PAGINATION */}
                <Stack
                  sx={{
                    gap: 2,
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    alignItems: {
                      xs: "stretch",
                      sm: "center",
                    },
                    justifyContent:
                      "space-between",
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Entries per page"
                    value={limit}
                    onChange={(e) => {
                      setLimit(
                        Number(
                          e.target.value
                        )
                      );
                      setPage(1);
                    }}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: 170,
                      },
                    }}
                  >
                    <MenuItem value={5}>
                      5
                    </MenuItem>

                    <MenuItem value={10}>
                      10
                    </MenuItem>

                    <MenuItem value={25}>
                      25
                    </MenuItem>

                    <MenuItem value={50}>
                      50
                    </MenuItem>

                    <MenuItem value={100}>
                      100
                    </MenuItem>
                  </TextField>

                  {totalPages > 1 && (
                    <Pagination
                      page={page}
                      count={totalPages}
                      onChange={(
                        _event,
                        value
                      ) =>
                        setPage(value)
                      }
                      color="primary"
                      shape="rounded"
                      siblingCount={1}
                      boundaryCount={1}
                    />
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}