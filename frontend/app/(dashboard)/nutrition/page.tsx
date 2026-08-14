"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import toast from "react-hot-toast";

import {
  createNutrition,
  deleteNutrition,
  getNutrition,
  searchFood,
  updateNutrition,
  type FoodSearchItem,
  type NutritionItem,
  type MealType,
} from "@/services/nutrition.service";

import getErrorMessage from "@/lib/error";

/* ============================================================================
 * Types
 * ========================================================================== */

type Unit = "g" | "kg";

/* ============================================================================
 * Helpers
 * ========================================================================== */

function round(
  value: number,
  decimals = 1
): number {
  const multiplier = Math.pow(
    10,
    decimals
  );

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
}

function formatNumber(
  value: number
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}

function today(): string {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function formatDate(
  date: string
): string {
  if (!date) {
    return "";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/*
 * Converts the stored recorded_at date
 * into a useful day label.
 *
 * Example:
 * 2026-08-15 -> Today
 * 2026-08-14 -> Yesterday
 * older       -> 13 Aug 2026
 */
function getDayLabel(
  date: string
): string {
  if (!date) {
    return "Unknown date";
  }

  const current = today();

  if (date === current) {
    return "Today";
  }

  const yesterdayDate = new Date(
    `${current}T00:00:00`
  );

  yesterdayDate.setDate(
    yesterdayDate.getDate() - 1
  );

  const yesterday =
    yesterdayDate
      .toISOString()
      .split("T")[0];

  if (date === yesterday) {
    return "Yesterday";
  }

  return formatDate(date);
}

function normalizeFoodName(
  name: string
): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/*
 * Groups nutrition entries by the date
 * on which the food was eaten.
 */
function groupEntriesByDate(
  entries: NutritionItem[]
): Record<string, NutritionItem[]> {
  return entries.reduce<
    Record<string, NutritionItem[]>
  >(
    (groups, entry) => {
      const date =
        entry.recorded_at;

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(entry);

      return groups;
    },
    {}
  );
}

/* ============================================================================
 * Frontend nutrition calculation
 * ========================================================================== */

function calculateNutrition(
  food: FoodSearchItem,
  quantityInGrams: number
) {
  const multiplier =
    quantityInGrams / 100;

  return {
    calories:
      Number(
        food.calories_per_100g ?? 0
      ) * multiplier,

    protein_g:
      Number(
        food.protein_g_per_100g ?? 0
      ) * multiplier,

    carbs_g:
      Number(
        food.carbs_g_per_100g ?? 0
      ) * multiplier,

    fat_g:
      Number(
        food.fat_g_per_100g ?? 0
      ) * multiplier,

    fiber_g:
      Number(
        food.fiber_g_per_100g ?? 0
      ) * multiplier,
  };
}

/* ============================================================================
 * Page
 * ========================================================================== */

export default function NutritionPage() {
  /* --------------------------------------------------------------------------
   * Search
   * ------------------------------------------------------------------------ */

  const [search, setSearch] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<FoodSearchItem[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  /* --------------------------------------------------------------------------
   * Selected food
   * ------------------------------------------------------------------------ */

  const [selectedFood, setSelectedFood] =
    useState<FoodSearchItem | null>(
      null
    );

  /* --------------------------------------------------------------------------
   * Form
   * ------------------------------------------------------------------------ */

  const [quantity, setQuantity] =
    useState("100");

  const [unit, setUnit] =
    useState<Unit>("g");

  const [mealType, setMealType] =
    useState<MealType>("breakfast");

  const [notes, setNotes] =
    useState("");

  /*
   * Date on which the food was actually eaten.
   */
  const [recordedAt, setRecordedAt] =
    useState(today());

  /* --------------------------------------------------------------------------
   * Entries
   * ------------------------------------------------------------------------ */

  const [entries, setEntries] =
    useState<NutritionItem[]>([]);

  const [entriesLoading, setEntriesLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* --------------------------------------------------------------------------
   * Delete
   * ------------------------------------------------------------------------ */

  const [deleteLoading, setDeleteLoading] =
    useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [entryToDelete, setEntryToDelete] =
    useState<NutritionItem | null>(
      null
    );

  /* --------------------------------------------------------------------------
   * Edit
   * ------------------------------------------------------------------------ */

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingQuantity, setEditingQuantity] =
    useState("");

  const [editingMealType, setEditingMealType] =
    useState<MealType>("breakfast");

  const [editingNotes, setEditingNotes] =
    useState("");

  const [editingRecordedAt, setEditingRecordedAt] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  /* ==========================================================================
   * Quantity in grams
   * ======================================================================== */

  const quantityInGrams = useMemo(() => {
    const value = Number(quantity);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return 0;
    }

    if (unit === "kg") {
      return value * 1000;
    }

    return value;
  }, [quantity, unit]);

  /* ==========================================================================
   * Nutrition preview
   * ======================================================================== */

  const calculatedNutrition =
    useMemo(() => {
      if (
        !selectedFood ||
        quantityInGrams <= 0
      ) {
        return null;
      }

      return calculateNutrition(
        selectedFood,
        quantityInGrams
      );
    }, [
      selectedFood,
      quantityInGrams,
    ]);

  /* ==========================================================================
   * Load nutrition entries
   * ======================================================================== */

  const loadEntries = useCallback(
    async () => {
      try {
        setEntriesLoading(true);

        const response =
          await getNutrition(
            1,
            100,
            "desc"
          );

        /*
         * Sort by the date the food was eaten.
         *
         * This is important because the backend returns
         * nutrition entries, while the UI should display
         * them as a chronological food log.
         */
        const sortedEntries = [
          ...response.data.items,
        ].sort(
          (a, b) =>
            new Date(
              `${b.recorded_at}T00:00:00`
            ).getTime() -
            new Date(
              `${a.recorded_at}T00:00:00`
            ).getTime()
        );

        setEntries(
          sortedEntries
        );
      } catch (error) {
        console.error(
          "Failed to load nutrition:",
          error
        );

        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setEntriesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  /* ==========================================================================
   * Search food
   * ======================================================================== */

  const handleSearch = async () => {
    const query =
      search.trim();

    if (query.length < 2) {
      setSearchResults([]);

      setSearchError(
        "Enter at least 2 characters."
      );

      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const response =
        await searchFood(query);

      const foods =
        response.data?.items ?? [];

      /*
       * Remove duplicate food names.
       */
      const seen =
        new Set<string>();

      const uniqueFoods =
        foods.filter((food) => {
          const key =
            normalizeFoodName(
              food.name
            );

          if (
            !key ||
            seen.has(key)
          ) {
            return false;
          }

          seen.add(key);

          return true;
        });

      setSearchResults(
        uniqueFoods
      );

      if (
        uniqueFoods.length === 0
      ) {
        setSearchError(
          "No food found."
        );
      }
    } catch (error) {
      console.error(
        "Food search failed:",
        error
      );

      setSearchResults([]);

      setSearchError(
        getErrorMessage(error)
      );
    } finally {
      setSearchLoading(false);
    }
  };

  /* ==========================================================================
   * Search Enter
   * ======================================================================== */

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      void handleSearch();
    }
  };

  /* ==========================================================================
   * Select food
   * ======================================================================== */

  const handleSelectFood = (
    food: FoodSearchItem
  ) => {
    setSelectedFood(food);

    setQuantity("100");

    setUnit("g");

    setSearch(food.name);

    setSearchResults([]);

    setSearchError("");
  };

  /* ==========================================================================
   * Clear food
   * ======================================================================== */

  const handleClearFood = () => {
    setSelectedFood(null);

    setSearch("");

    setQuantity("100");

    setUnit("g");

    setSearchResults([]);

    setSearchError("");
  };

  /* ==========================================================================
   * Save nutrition
   * ======================================================================== */

  const handleSave = async () => {
    if (!selectedFood) {
      toast.error(
        "Select a food first."
      );

      return;
    }

    if (
      quantityInGrams <= 0
    ) {
      toast.error(
        "Enter a valid quantity."
      );

      return;
    }

    if (
      !calculatedNutrition
    ) {
      toast.error(
        "Nutrition could not be calculated."
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * Current backend contract requires:
       *
       * food_id
       * quantity
       * unit
       * meal_type
       * calories
       * protein_g
       * carbs_g
       * fat_g
       * fiber_g
       * notes
       * recorded_at
       */
      await createNutrition({
        food_id:
          selectedFood.id,

        quantity:
          Number(quantity),

        unit,

        meal_type:
          mealType,

        calories:
          calculatedNutrition.calories,

        protein_g:
          calculatedNutrition.protein_g,

        carbs_g:
          calculatedNutrition.carbs_g,

        fat_g:
          calculatedNutrition.fat_g,

        fiber_g:
          calculatedNutrition.fiber_g,

        notes:
          notes.trim() || null,

        /*
         * This is the day the food
         * was eaten.
         */
        recorded_at:
          recordedAt || null,
      });

      toast.success(
        "Food added successfully."
      );

      /* Reset */

      setSelectedFood(null);

      setSearch("");

      setQuantity("100");

      setUnit("g");

      setMealType(
        "breakfast"
      );

      setNotes("");

      setRecordedAt(
        today()
      );

      setSearchResults([]);

      setSearchError("");

      await loadEntries();
    } catch (error) {
      console.error(
        "Failed to save nutrition:",
        error
      );

      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
   * Delete request
   * ======================================================================== */

  const handleDeleteRequest = (
    entry: NutritionItem
  ) => {
    setEntryToDelete(entry);

    setDeleteDialogOpen(true);
  };

  /* ==========================================================================
   * Cancel delete
   * ======================================================================== */

  const handleDeleteCancel = () => {
    if (
      deleteLoading !== null
    ) {
      return;
    }

    setDeleteDialogOpen(false);

    setEntryToDelete(null);
  };

  /* ==========================================================================
   * Confirm delete
   * ======================================================================== */

  const handleDeleteConfirm =
    async () => {
      if (!entryToDelete) {
        return;
      }

      const id =
        entryToDelete.id;

      try {
        setDeleteLoading(id);

        /*
         * DELETE /nutrition/{nutrition_id}
         */
        await deleteNutrition(
          id
        );

        /*
         * Immediately remove from UI.
         */
        setEntries(
          (previous) =>
            previous.filter(
              (entry) =>
                entry.id !== id
            )
        );

        toast.success(
          "Food entry deleted."
        );

        setDeleteDialogOpen(
          false
        );

        setEntryToDelete(null);
      } catch (error) {
        console.error(
          "Failed to delete nutrition:",
          error
        );

        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setDeleteLoading(null);
      }
    };

  /* ==========================================================================
   * Start editing
   * ======================================================================== */

  const handleStartEdit = (
    entry: NutritionItem
  ) => {
    setEditingId(entry.id);

    setEditingQuantity(
      String(entry.quantity)
    );

    setEditingMealType(
      entry.meal_type
    );

    setEditingNotes(
      entry.notes ?? ""
    );

    setEditingRecordedAt(
      entry.recorded_at
    );
  };

  /* ==========================================================================
   * Cancel editing
   * ======================================================================== */

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditingQuantity("");

    setEditingNotes("");

    setEditingRecordedAt("");

    setEditingMealType(
      "breakfast"
    );
  };

  /* ==========================================================================
   * Update nutrition
   * ======================================================================== */

  const handleUpdate = async (
    entry: NutritionItem
  ) => {
    const numericQuantity =
      Number(
        editingQuantity
      );

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity <= 0
    ) {
      toast.error(
        "Enter a valid quantity."
      );

      return;
    }

    try {
      setUpdating(true);

      /*
       * Keep the stored nutrition snapshot
       * unchanged while editing metadata.
       */
      const response =
        await updateNutrition(
          entry.id,
          {
            quantity:
              numericQuantity,

            unit:
              entry.unit,

            meal_type:
              editingMealType,

            calories:
              entry.calories,

            protein_g:
              entry.protein_g,

            carbs_g:
              entry.carbs_g,

            fat_g:
              entry.fat_g,

            fiber_g:
              entry.fiber_g,

            notes:
              editingNotes.trim() ||
              null,

            /*
             * This can move the entry
             * to another day.
             */
            recorded_at:
              editingRecordedAt ||
              null,
          }
        );

      setEntries(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              entry.id
                ? response.data
                : item
          )
      );

      toast.success(
        "Food entry updated."
      );

      handleCancelEdit();
    } catch (error) {
      console.error(
        "Failed to update nutrition:",
        error
      );

      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setUpdating(false);
    }
  };

  /* ==========================================================================
   * Group food log by eaten date
   * ======================================================================== */

  const groupedEntries =
    useMemo(() => {
      const groups =
        groupEntriesByDate(
          entries
        );

      /*
       * Sort dates newest -> oldest.
       */
      return Object.entries(
        groups
      ).sort(
        ([dateA], [dateB]) =>
          new Date(
            `${dateB}T00:00:00`
          ).getTime() -
          new Date(
            `${dateA}T00:00:00`
          ).getTime()
      );
    }, [entries]);

  /* ==========================================================================
   * Render
   * ======================================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      {/* =====================================================================
          HEADER
          =================================================================== */}

      <Stack
        spacing={1}
        sx={{ mb: 4 }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems:
              "center",
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              bgcolor:
                "rgba(34,197,94,0.12)",
              color:
                "primary.main",
            }}
          >
            <RestaurantIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Nutrition
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Search for what you
              ate, choose the
              quantity, and track
              your nutrition.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* =====================================================================
          MAIN GRID
          =================================================================== */}

      <Grid
        container
        spacing={3}
      >
        {/* ===================================================================
            ADD FOOD
            ================================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 7,
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
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
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Add food
                </Typography>

                {/* Search */}

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1.5}
                >
                  <TextField
                    label="What did you eat?"
                    placeholder="e.g. chicken breast"
                    value={search}
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target
                          .value;

                      setSearch(value);

                      if (
                        selectedFood &&
                        value !==
                          selectedFood.name
                      ) {
                        setSelectedFood(
                          null
                        );
                      }
                    }}
                    onKeyDown={
                      handleSearchKeyDown
                    }
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment:
                          searchLoading ? (
                            <CircularProgress
                              size={20}
                            />
                          ) : (
                            <IconButton
                              onClick={() =>
                                void handleSearch()
                              }
                              edge="end"
                              aria-label="Search food"
                            >
                              <SearchIcon />
                            </IconButton>
                          ),
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={() =>
                      void handleSearch()
                    }
                    disabled={
                      searchLoading ||
                      search.trim()
                        .length < 2
                    }
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 120,
                      },
                    }}
                  >
                    Search
                  </Button>
                </Stack>

                {/* Search error */}

                {searchError && (
                  <Alert severity="error">
                    {searchError}
                  </Alert>
                )}

                {/* Search results */}

                {searchResults.length >
                  0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      overflow:
                        "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor:
                          "action.hover",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Select a food
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Select the
                        matching food
                        from the
                        nutrition
                        database.
                      </Typography>
                    </Box>

                    <Stack
                      divider={
                        <Divider />
                      }
                    >
                      {searchResults.map(
                        (food) => (
                          <Button
                            key={
                              food.id
                            }
                            onClick={() =>
                              handleSelectFood(
                                food
                              )
                            }
                            sx={{
                              px: 2,
                              py: 1.5,
                              justifyContent:
                                "flex-start",
                              textAlign:
                                "left",
                              color:
                                "text.primary",
                              textTransform:
                                "none",
                              borderRadius:
                                0,
                              "&:hover":
                                {
                                  bgcolor:
                                    "action.hover",
                                },
                            }}
                          >
                            <Box
                              sx={{
                                width:
                                  "100%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 600,
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    food.name
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {
                                    food.source
                                  }
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  flexShrink:
                                    0,
                                  textAlign:
                                    "right",
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius:
                                    2,
                                  bgcolor:
                                    "rgba(34,197,94,0.10)",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      "primary.main",
                                  }}
                                >
                                  {formatNumber(
                                    round(
                                      Number(
                                        food.calories_per_100g
                                      )
                                    )
                                  )}{" "}
                                  kcal
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  per
                                  100g
                                </Typography>
                              </Box>
                            </Box>
                          </Button>
                        )
                      )}
                    </Stack>
                  </Card>
                )}

                {/* Selected food */}

                {selectedFood && (
                  <>
                    <Card
                      sx={{
                        borderRadius: 3,
                        bgcolor:
                          "rgba(34,197,94,0.07)",
                        border:
                          "1px solid",
                        borderColor:
                          "rgba(34,197,94,0.25)",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            alignItems:
                              "center",
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {
                                selectedFood.name
                              }
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {
                                selectedFood.source
                              }{" "}
                              ·{" "}
                              {formatNumber(
                                round(
                                  Number(
                                    selectedFood.calories_per_100g
                                  )
                                )
                              )}{" "}
                              kcal /
                              100g
                            </Typography>
                          </Box>

                          <IconButton
                            onClick={
                              handleClearFood
                            }
                            aria-label="Clear selected food"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Quantity */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={2}
                    >
                      <TextField
                        label="Quantity"
                        type="number"
                        value={
                          quantity
                        }
                        onChange={(
                          event
                        ) =>
                          setQuantity(
                            event.target
                              .value
                          )
                        }
                        fullWidth
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: "any",
                          },
                        }}
                      />

                      <FormControl
                        sx={{
                          minWidth: {
                            xs: "100%",
                            sm: 130,
                          },
                        }}
                      >
                        <InputLabel>
                          Unit
                        </InputLabel>

                        <Select
                          value={
                            unit
                          }
                          label="Unit"
                          onChange={(
                            event
                          ) =>
                            setUnit(
                              event.target
                                .value as Unit
                            )
                          }
                        >
                          <MenuItem value="g">
                            grams (g)
                          </MenuItem>

                          <MenuItem value="kg">
                            kilograms
                            (kg)
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Quantity conversion */}

                    {quantityInGrams >
                      0 &&
                      unit ===
                        "kg" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: -2,
                          }}
                        >
                          Equivalent
                          quantity:{" "}
                          {formatNumber(
                            quantityInGrams
                          )}
                          g
                        </Typography>
                      )}

                    {/* Meal */}

                    <FormControl
                      fullWidth
                    >
                      <InputLabel>
                        Meal
                      </InputLabel>

                      <Select
                        value={
                          mealType
                        }
                        label="Meal"
                        onChange={(
                          event
                        ) =>
                          setMealType(
                            event.target
                              .value as MealType
                          )
                        }
                      >
                        <MenuItem value="breakfast">
                          Breakfast
                        </MenuItem>

                        <MenuItem value="lunch">
                          Lunch
                        </MenuItem>

                        <MenuItem value="dinner">
                          Dinner
                        </MenuItem>

                        <MenuItem value="snack">
                          Snack
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* ========================================================
                        DAY EATEN
                        ====================================================== */}

                    <TextField
                      label="Day eaten"
                      type="date"
                      value={
                        recordedAt
                      }
                      onChange={(
                        event
                      ) =>
                        setRecordedAt(
                          event.target
                            .value
                        )
                      }
                      fullWidth
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: -2,
                      }}
                    >
                      Select the day
                      on which you
                      actually ate
                      this food.
                    </Typography>

                    {/* Notes */}

                    <TextField
                      label="Notes (optional)"
                      placeholder="e.g. grilled, homemade..."
                      value={notes}
                      onChange={(
                        event
                      ) =>
                        setNotes(
                          event.target
                            .value
                        )
                      }
                      multiline
                      minRows={2}
                      fullWidth
                    />

                    {/* Nutrition preview */}

                    {calculatedNutrition && (
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              mb: 2,
                            }}
                          >
                            Nutrition
                            for{" "}
                            {formatNumber(
                              quantityInGrams
                            )}
                            g
                          </Typography>

                          <Grid
                            container
                            spacing={1.5}
                          >
                            <Grid
                              size={{
                                xs: 6,
                                sm: 3,
                              }}
                            >
                              <NutritionValue
                                label="Calories"
                                value={`${formatNumber(
                                  round(
                                    calculatedNutrition.calories
                                  )
                                )} kcal`}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 6,
                                sm: 3,
                              }}
                            >
                              <NutritionValue
                                label="Protein"
                                value={`${formatNumber(
                                  round(
                                    calculatedNutrition.protein_g
                                  )
                                )} g`}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 6,
                                sm: 3,
                              }}
                            >
                              <NutritionValue
                                label="Carbs"
                                value={`${formatNumber(
                                  round(
                                    calculatedNutrition.carbs_g
                                  )
                                )} g`}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 6,
                                sm: 3,
                              }}
                            >
                              <NutritionValue
                                label="Fat"
                                value={`${formatNumber(
                                  round(
                                    calculatedNutrition.fat_g
                                  )
                                )} g`}
                              />
                            </Grid>

                            <Grid
                              size={{
                                xs: 6,
                                sm: 3,
                              }}
                            >
                              <NutritionValue
                                label="Fiber"
                                value={`${formatNumber(
                                  round(
                                    calculatedNutrition.fiber_g
                                  )
                                )} g`}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    {/* Save */}

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        saving ? (
                          <CircularProgress
                            size={20}
                            color="inherit"
                          />
                        ) : (
                          <AddIcon />
                        )
                      }
                      onClick={() =>
                        void handleSave()
                      }
                      disabled={
                        saving ||
                        !selectedFood ||
                        quantityInGrams <=
                          0
                      }
                      fullWidth
                    >
                      {saving
                        ? "Saving..."
                        : "Add Food"}
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ===================================================================
            FOOD LOG
            ================================================================= */}

        <Grid
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
              height: "100%",
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
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Food log
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Track what you
                  ate each day.
                </Typography>

                <Divider />

                {entriesLoading ? (
                  <Stack
                    sx={{
                      alignItems:
                        "center",
                      py: 5,
                    }}
                  >
                    <CircularProgress />
                  </Stack>
                ) : entries.length ===
                  0 ? (
                  <Box
                    sx={{
                      py: 5,
                      textAlign:
                        "center",
                    }}
                  >
                    <RestaurantIcon
                      sx={{
                        fontSize: 42,
                        color:
                          "text.disabled",
                        mb: 1,
                      }}
                    />

                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      No food logged
                      yet
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Search for a food
                      above to start
                      tracking your
                      meals.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {groupedEntries.map(
                      ([
                        date,
                        dayEntries,
                      ]) => (
                        <Box
                          key={date}
                        >
                          {/* =================================================
                              DAY HEADER
                              =============================================== */}

                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems:
                                "baseline",
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {getDayLabel(
                                date
                              )}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                dayEntries.length
                              }{" "}
                              {dayEntries.length ===
                              1
                                ? "entry"
                                : "entries"}
                            </Typography>
                          </Stack>

                          {/* =================================================
                              ENTRIES FOR THIS DAY
                              =============================================== */}

                          <Stack
                            spacing={1.5}
                          >
                            {dayEntries.map(
                              (
                                entry
                              ) => (
                                <FoodLogItem
                                  key={
                                    entry.id
                                  }
                                  entry={
                                    entry
                                  }
                                  deleting={
                                    deleteLoading ===
                                    entry.id
                                  }
                                  editing={
                                    editingId ===
                                    entry.id
                                  }
                                  updating={
                                    updating &&
                                    editingId ===
                                      entry.id
                                  }
                                  editingQuantity={
                                    editingQuantity
                                  }
                                  editingMealType={
                                    editingMealType
                                  }
                                  editingNotes={
                                    editingNotes
                                  }
                                  editingRecordedAt={
                                    editingRecordedAt
                                  }
                                  onDelete={() =>
                                    handleDeleteRequest(
                                      entry
                                    )
                                  }
                                  onEdit={() =>
                                    handleStartEdit(
                                      entry
                                    )
                                  }
                                  onCancelEdit={
                                    handleCancelEdit
                                  }
                                  onSaveEdit={() =>
                                    void handleUpdate(
                                      entry
                                    )
                                  }
                                  onQuantityChange={
                                    setEditingQuantity
                                  }
                                  onMealTypeChange={
                                    setEditingMealType
                                  }
                                  onNotesChange={
                                    setEditingNotes
                                  }
                                  onRecordedAtChange={
                                    setEditingRecordedAt
                                  }
                                />
                              )
                            )}
                          </Stack>
                        </Box>
                      )
                    )}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =====================================================================
          DELETE CONFIRMATION DIALOG

          No window.confirm().
          =================================================================== */}

      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={
          handleDeleteCancel
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Delete food entry?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want
            to delete{" "}
            <strong>
              {entryToDelete?.food_name}
            </strong>
            ?

            <br />

            This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              handleDeleteCancel
            }
            disabled={
              deleteLoading !==
              null
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() =>
              void handleDeleteConfirm()
            }
            disabled={
              deleteLoading !==
              null
            }
            startIcon={
              deleteLoading !==
              null ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteLoading !==
            null
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ============================================================================
 * Nutrition value
 * ========================================================================== */

function NutritionValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor:
          "action.hover",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* ============================================================================
 * Food log item
 * ========================================================================== */

function FoodLogItem({
  entry,
  deleting,
  editing,
  updating,
  editingQuantity,
  editingMealType,
  editingNotes,
  editingRecordedAt,
  onDelete,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onQuantityChange,
  onMealTypeChange,
  onNotesChange,
  onRecordedAtChange,
}: {
  entry: NutritionItem;

  deleting: boolean;

  editing: boolean;

  updating: boolean;

  editingQuantity: string;

  editingMealType: MealType;

  editingNotes: string;

  editingRecordedAt: string;

  onDelete: () => void;

  onEdit: () => void;

  onCancelEdit: () => void;

  onSaveEdit: () => void;

  onQuantityChange: (
    value: string
  ) => void;

  onMealTypeChange: (
    value: MealType
  ) => void;

  onNotesChange: (
    value: string
  ) => void;

  onRecordedAtChange: (
    value: string
  ) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        {editing ? (
          <Stack spacing={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
              }}
            >
              Edit{" "}
              {entry.food_name}
            </Typography>

            <TextField
              label="Quantity"
              type="number"
              value={
                editingQuantity
              }
              onChange={(event) =>
                onQuantityChange(
                  event.target.value
                )
              }
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: "any",
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>
                Meal
              </InputLabel>

              <Select
                value={
                  editingMealType
                }
                label="Meal"
                onChange={(event) =>
                  onMealTypeChange(
                    event.target
                      .value as MealType
                  )
                }
              >
                <MenuItem value="breakfast">
                  Breakfast
                </MenuItem>

                <MenuItem value="lunch">
                  Lunch
                </MenuItem>

                <MenuItem value="dinner">
                  Dinner
                </MenuItem>

                <MenuItem value="snack">
                  Snack
                </MenuItem>
              </Select>
            </FormControl>

            {/* Edit eaten day */}

            <TextField
              label="Day eaten"
              type="date"
              value={
                editingRecordedAt
              }
              onChange={(event) =>
                onRecordedAtChange(
                  event.target.value
                )
              }
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Notes"
              value={
                editingNotes
              }
              onChange={(event) =>
                onNotesChange(
                  event.target.value
                )
              }
              multiline
              minRows={2}
              fullWidth
            />

            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent:
                  "flex-end",
              }}
            >
              <Button
                onClick={
                  onCancelEdit
                }
                disabled={
                  updating
                }
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={
                  onSaveEdit
                }
                disabled={
                  updating
                }
                startIcon={
                  updating ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : null
                }
              >
                {updating
                  ? "Saving..."
                  : "Save"}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems:
                "flex-start",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {
                  entry.food_name
                }
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textTransform:
                    "capitalize",
                }}
              >
                {
                  entry.quantity
                }{" "}
                {
                  entry.unit
                }{" "}
                ·{" "}
                {
                  entry.meal_type
                }
              </Typography>

              {/* Eaten date */}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  display:
                    "block",
                }}
              >
                Ate on{" "}
                {formatDate(
                  entry.recorded_at
                )}
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  mt: 1,
                  flexWrap:
                    "wrap",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatNumber(
                    round(
                      Number(
                        entry.calories
                      )
                    )
                  )}{" "}
                  kcal
                </Typography>

                <Typography
                  variant="caption"
                >
                  P{" "}
                  {formatNumber(
                    round(
                      Number(
                        entry.protein_g
                      )
                    )
                  )}
                  g
                </Typography>

                <Typography
                  variant="caption"
                >
                  C{" "}
                  {formatNumber(
                    round(
                      Number(
                        entry.carbs_g
                      )
                    )
                  )}
                  g
                </Typography>

                <Typography
                  variant="caption"
                >
                  F{" "}
                  {formatNumber(
                    round(
                      Number(
                        entry.fat_g
                      )
                    )
                  )}
                  g
                </Typography>

                <Typography
                  variant="caption"
                >
                  Fiber{" "}
                  {formatNumber(
                    round(
                      Number(
                        entry.fiber_g
                      )
                    )
                  )}
                  g
                </Typography>
              </Stack>

              {entry.source && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display:
                      "block",
                  }}
                >
                  Source:{" "}
                  {
                    entry.source
                  }
                </Typography>
              )}

              {entry.notes && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display:
                      "block",
                    fontStyle:
                      "italic",
                  }}
                >
                  {entry.notes}
                </Typography>
              )}
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
            >
              {/* Edit */}

              <IconButton
                color="primary"
                onClick={
                  onEdit
                }
                disabled={
                  deleting
                }
                aria-label="Edit food entry"
              >
                <EditOutlinedIcon />
              </IconButton>

              {/* Delete */}


              <IconButton
                color="error"
                onClick={
                  onDelete
                }
                disabled={
                  deleting
                }
                aria-label="Delete food entry"
              >
                {deleting ? (
                  <CircularProgress
                    size={20}
                  />
                ) : (
                  <DeleteIcon />
                )}
              </IconButton>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}