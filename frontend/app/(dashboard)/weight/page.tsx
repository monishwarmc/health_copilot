"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import FlagIcon from "@mui/icons-material/Flag";
import HistoryIcon from "@mui/icons-material/History";

import WeightChart from "@/components/weight/WeightChart";

import {
  createWeight,
  deleteWeight,
  getWeightStats,
  getWeights,
  updateWeight,
  type Weight,
  type WeightStats,
} from "@/services/weight.service";

export default function WeightPage() {
  /* ============================================================
     STATE
  ============================================================ */

  const [weights, setWeights] = useState<Weight[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [weightValue, setWeightValue] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedAt, setRecordedAt] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [totalPages, setTotalPages] = useState(1);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  const loadData = async () => {
    try {
      setLoading(true);

      const [weightsResponse, statsResponse] = await Promise.all([
        getWeights(page, limit, sort),
        getWeightStats(),
      ]);

      setWeights(weightsResponse.data.items);
      setTotalPages(Math.max(weightsResponse.data.pages, 1));

      setStats(statsResponse.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load weight data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, sort]);

  /* ============================================================
     FORM
  ============================================================ */

  const resetForm = () => {
    setEditingId(null);
    setWeightValue("");
    setNotes("");
    setRecordedAt(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async () => {
    const parsedWeight = Number(weightValue);

    if (!weightValue || Number.isNaN(parsedWeight)) {
      toast.error("Please enter a valid weight");
      return;
    }

    if (parsedWeight <= 0 || parsedWeight > 500) {
      toast.error("Please enter a realistic weight");
      return;
    }

    if (!recordedAt) {
      toast.error("Please select a date");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateWeight(editingId, {
          weight_kg: parsedWeight,
          notes: notes.trim() || null,
          recorded_at: recordedAt,
        });

        toast.success("Weight updated successfully");
      } else {
        await createWeight({
          weight_kg: parsedWeight,
          notes: notes.trim() || null,
          recorded_at: recordedAt,
        });

        toast.success("Weight recorded successfully");
      }

      resetForm();

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        editingId
          ? "Failed to update weight"
          : "Failed to record weight"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit = (weight: Weight) => {
    setEditingId(weight.id);

    setWeightValue(String(weight.weight_kg));

    setNotes(weight.notes ?? "");

    setRecordedAt(
      new Date(weight.recorded_at)
        .toISOString()
        .split("T")[0]
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this weight entry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteWeight(id);

      toast.success("Weight entry deleted");

      /*
       * If the current page becomes empty after deletion,
       * move back one page.
       */
      if (weights.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadData();
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete weight");
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================
     TREND
  ============================================================ */

  const trend = useMemo(() => {
    if (!stats) {
      return "neutral";
    }

    if (stats.weight_change < 0) {
      return "down";
    }

    if (stats.weight_change > 0) {
      return "up";
    }

    return "neutral";
  }, [stats]);

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.25rem",
              },
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            Weight
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: {
                xs: "0.9rem",
                sm: "1rem",
              },
            }}
          >
            Track your progress and stay consistent.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          sx={{
            borderRadius: 3,
            px: 2.5,
            py: 1.2,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Add Weight
        </Button>
      </Stack>

      {/* ======================================================
          STATS
      ====================================================== */}

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
        {/* Current */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <MonitorWeightIcon />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Current
                </Typography>
              </Stack>

              <Box>
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {stats
                    ? `${stats.current_weight.toFixed(1)} kg`
                    : "--"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Latest measurement
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Starting */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <HistoryIcon />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Starting
                </Typography>
              </Stack>

              <Box>
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {stats
                    ? `${stats.starting_weight.toFixed(1)} kg`
                    : "--"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your starting weight
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Goal */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  <FlagIcon />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Target
                </Typography>
              </Stack>

              <Box>
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {stats
                    ? `${stats.target_weight.toFixed(1)} kg`
                    : "--"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your goal
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Change */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      trend === "down"
                        ? "success.main"
                        : trend === "up"
                          ? "error.main"
                          : "action.hover",
                    color:
                      trend === "neutral"
                        ? "text.primary"
                        : "white",
                  }}
                >
                  {trend === "down" ? (
                    <TrendingDownIcon />
                  ) : (
                    <TrendingUpIcon />
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Change
                </Typography>
              </Stack>

              <Box>
                <Typography
                  sx={{
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {stats
                    ? `${stats.weight_change > 0 ? "+" : ""}${stats.weight_change.toFixed(1)} kg`
                    : "--"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Since starting
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      {stats && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
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
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Goal Progress
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {Math.round(
                    stats.goal_progress_percent
                  )}
                  %
                </Typography>
              </Stack>

              <Box
                sx={{
                  height: 10,
                  borderRadius: 10,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(
                      Math.max(
                        stats.goal_progress_percent,
                        0
                      ),
                      100
                    )}%`,
                    height: "100%",
                    borderRadius: 10,
                    bgcolor: "primary.main",
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {stats.remaining_to_goal > 0
                  ? `${stats.remaining_to_goal.toFixed(1)} kg remaining to reach your target.`
                  : "You've reached your target weight."}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          ADD / EDIT FORM
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
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
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {editingId
                    ? "Edit Measurement"
                    : "Record Weight"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Keep your measurements consistent for
                  better progress tracking.
                </Typography>
              </Box>

              {editingId && (
                <IconButton
                  onClick={resetForm}
                  aria-label="Cancel editing"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Weight"
                type="number"
                value={weightValue}
                onChange={(event) =>
                  setWeightValue(event.target.value)
                }
                fullWidth
                required
                placeholder="70.5"
                sx={{
                  "& input": {
                    fontWeight: 600,
                  },
                }}
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 500,
                    step: 0.1,
                  },
                }}
              />

              <TextField
                label="Date"
                type="date"
                value={recordedAt}
                onChange={(event) =>
                  setRecordedAt(event.target.value)
                }
                fullWidth
                required
                sx={{
                  "& input": {
                    fontWeight: 600,
                  },
                }}
              />

              <TextField
                label="Notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                fullWidth
                placeholder="Morning weight"
                sx={{
                  "& input": {
                    fontWeight: 600,
                  },
                }}
              />
            </Box>

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
                ) : editingId ? (
                  <EditIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                alignSelf: {
                  xs: "stretch",
                  sm: "flex-start",
                },
                borderRadius: 3,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Weight"
                  : "Record Weight"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          CHART
      ====================================================== */}

      <Box sx={{ mb: 3 }}>
        <WeightChart weights={weights} />
      </Box>

      {/* ======================================================
          HISTORY
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: 0,
          }}
        >
          {/* Header */}

          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              sx={{
                justifyContent: "space-between",
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
                  {stats?.entries ?? 0} total measurements
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                {/* Sort */}

                <Select
                  size="small"
                  value={sort}
                  onChange={(event) => {
                    setSort(
                      event.target.value as
                        | "asc"
                        | "desc"
                    );
                    setPage(1);
                  }}
                  sx={{
                    minWidth: 130,
                    borderRadius: 2.5,
                  }}
                >
                  <MenuItem value="desc">
                    Newest
                  </MenuItem>

                  <MenuItem value="asc">
                    Oldest
                  </MenuItem>
                </Select>

                {/* Page size */}

                <Select
                  size="small"
                  value={limit}
                  onChange={(event) => {
                    setLimit(
                      Number(event.target.value)
                    );
                    setPage(1);
                  }}
                  sx={{
                    minWidth: 90,
                    borderRadius: 2.5,
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Loading */}

          {loading && (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* Empty */}

          {!loading && weights.length === 0 && (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
              }}
            >
              <Stack
                spacing={1}
                sx={{
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <MonitorWeightIcon
                  sx={{
                    fontSize: 48,
                    color: "text.disabled",
                  }}
                />

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
                  Record your first weight to start
                  tracking your progress.
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Entries */}

          {!loading && weights.length > 0 && (
            <Stack divider={<Divider />}>
              {weights.map((weight) => (
                <Box
                  key={weight.id}
                  sx={{
                    px: {
                      xs: 2,
                      sm: 3,
                    },
                    py: 2,
                    transition:
                      "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    {/* Weight */}

                    <Box
                      sx={{
                        width: {
                          xs: 70,
                          sm: 100,
                        },
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: {
                            xs: "1rem",
                            sm: "1.15rem",
                          },
                        }}
                      >
                        {weight.weight_kg.toFixed(1)}
                        {" kg"}
                      </Typography>
                    </Box>

                    {/* Details */}

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {formatDate(
                          weight.recorded_at
                        )}
                      </Typography>

                      {weight.notes && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {weight.notes}
                        </Typography>
                      )}
                    </Box>

                    {/* Actions */}

                    <Stack
                      direction="row"
                      spacing={0.5}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() =>
                            handleEdit(weight)
                          }
                          size="small"
                          sx={{
                            borderRadius: 2,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            onClick={() =>
                              handleDelete(weight.id)
                            }
                            disabled={
                              deletingId ===
                              weight.id
                            }
                            size="small"
                            sx={{
                              borderRadius: 2,
                              color: "error.main",
                            }}
                          >
                            {deletingId ===
                            weight.id ? (
                              <CircularProgress
                                size={18}
                              />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {/* Pagination */}

          {!loading &&
            weights.length > 0 &&
            totalPages > 1 && (
              <>
                <Divider />

                <Box
                  sx={{
                    p: {
                      xs: 2,
                      sm: 3,
                    },
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Pagination
                    page={page}
                    count={totalPages}
                    onChange={(_, value) =>
                      setPage(value)
                    }
                    color="primary"
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              </>
            )}
        </CardContent>
      </Card>

      {/* ======================================================
          ERROR / INFO
      ====================================================== */}

      {stats && stats.entries === 0 && (
        <Alert
          severity="info"
          sx={{
            mt: 2,
            borderRadius: 3,
          }}
        >
          Start recording your weight regularly to
          build a useful progress history.
        </Alert>
      )}
    </Box>
  );
}