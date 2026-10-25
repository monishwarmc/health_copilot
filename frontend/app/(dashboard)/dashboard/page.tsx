"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import MonitorWeightRoundedIcon from "@mui/icons-material/MonitorWeightRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import WeightChart from "@/components/weight/WeightChart";
import { useAuth } from "@/context/AuthContext";
import { getChatConversations } from "@/services/chat.service";
import {
  getNutrition,
  getNutritionSummary,
  type NutritionDaySummary,
  type NutritionItem,
  type NutritionSummaryResponse,
} from "@/services/nutrition.service";
import { getWeightStats, getWeights } from "@/services/weight.service";
import type { Weight, WeightStats } from "@/types/weight";

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(dateString: string, amount: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day + amount, 12);
  return localDateString(date);
}

function displayDay(dateString: string) {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

function displayDate(dateString?: string | null) {
  if (!dateString) return "Not recorded yet";
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function number(value: number | null | undefined, fractionDigits = 0) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
}

function MetricCard({
  label,
  value,
  unit,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  caption: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3.5,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack spacing={1.6}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
              {label}
            </Typography>
            <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: `${tone}14`, color: tone, display: "grid", placeItems: "center" }}>
              {icon}
            </Box>
          </Stack>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {value}
              {unit && <Typography component="span" sx={{ ml: 0.6, fontSize: "1rem", fontWeight: 700, color: "text.secondary" }}>{unit}</Typography>}
            </Typography>
            <Typography variant="caption" color="text.secondary">{caption}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function NutrientValue({ label, value, unit = "g" }: { label: string; value: number; unit?: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", py: 0.85, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 750 }}>{number(value, 1)} {unit}</Typography>
    </Stack>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [today, setToday] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("Welcome");
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummaryResponse | null>(null);
  const [recentMeals, setRecentMeals] = useState<NutritionItem[]>([]);
  const [conversationCount, setConversationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentDate = localDateString(new Date());
    setToday(currentDate);
    setDateLabel(new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }));
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    const refresh = () => setRefreshKey((key) => key + 1);
    window.addEventListener("health-copilot:data-updated", refresh);
    return () => window.removeEventListener("health-copilot:data-updated", refresh);
  }, []);

  useEffect(() => {
    if (!user?.id || !today) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      const startDate = shiftDate(today, -6);
      const results = await Promise.allSettled([
        getWeightStats(),
        getWeights(1, 30, "desc"),
        getNutritionSummary(startDate, today),
        getNutrition(1, 5, "desc"),
        getChatConversations(),
      ]);

      if (!active) return;

      const [weightStats, weightList, nutrition, mealList, conversations] = results;
      if (weightStats.status === "fulfilled") setStats(weightStats.value.data);
      if (weightList.status === "fulfilled") setWeights(weightList.value.data.items);
      if (nutrition.status === "fulfilled") setNutritionSummary(nutrition.value.data);
      if (mealList.status === "fulfilled") setRecentMeals(mealList.value.data.items);
      if (conversations.status === "fulfilled") setConversationCount(conversations.value.total);

      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length === results.length) {
        setError("Your health data could not be loaded. Check your connection and try again.");
      } else if (failures.length > 0) {
        setError("Some dashboard sections could not be refreshed. Your other data is available below.");
      }
      setLoading(false);
    };

    void load();
    return () => { active = false; };
  }, [user?.id, today, refreshKey]);

  const weekData = useMemo(() => {
    if (!today) return [];
    const dataByDate = new Map<string, NutritionDaySummary>(
      (nutritionSummary?.days ?? []).map((day) => [day.recorded_at.slice(0, 10), day]),
    );
    return Array.from({ length: 7 }, (_, index) => {
      const date = shiftDate(today, index - 6);
      const day = dataByDate.get(date);
      return {
        date,
        label: displayDay(date),
        calories: day?.calories ?? 0,
        entries: day?.entries ?? 0,
      };
    });
  }, [nutritionSummary, today]);

  const todaySummary = nutritionSummary?.days.find((day) => day.recorded_at.slice(0, 10) === today);
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there";
  const heightMeters = user?.height_cm ? user.height_cm / 100 : null;
  const bmi = stats?.current_weight != null && heightMeters ? stats.current_weight / (heightMeters * heightMeters) : null;
  const profileFields = [user?.height_cm, user?.date_of_birth, user?.target_weight_kg, user?.goal, user?.activity_level, user?.diet_preference];
  const profileCompletion = Math.round((profileFields.filter((value) => value != null && value !== "").length / profileFields.length) * 100);
  const todayCalories = todaySummary?.calories ?? 0;
  const weekEntries = nutritionSummary?.entries ?? 0;

  return (
    <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ pb: { xs: 10, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 3.5, sm: 5 },
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          color: "#fff",
          background: "linear-gradient(125deg, #102b48 0%, #145b76 54%, #3b8f8a 100%)",
          boxShadow: "0 22px 60px rgba(15, 54, 78, 0.20)",
        }}
      >
        <Box sx={{ position: "absolute", width: 320, height: 320, right: -95, top: -170, borderRadius: "50%", bgcolor: "rgba(255,255,255,.09)", filter: "blur(2px)" }} />
        <Box sx={{ position: "absolute", width: 180, height: 180, right: 170, bottom: -145, borderRadius: "50%", bgcolor: "rgba(111, 231, 198, .14)" }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ position: "relative", justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <AutoAwesomeRoundedIcon sx={{ color: "#a5f3dc" }} />
              <Typography variant="overline" sx={{ letterSpacing: ".16em", color: "#b9e9e3", fontWeight: 800 }}>YOUR HEALTH, IN FOCUS</Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3rem" }, fontWeight: 850, letterSpacing: "-.045em", lineHeight: 1.08 }}>
              {greeting}, {firstName}
            </Typography>
            <Typography sx={{ mt: 1.25, color: "rgba(255,255,255,.78)", maxWidth: 620, lineHeight: 1.7 }}>
              A calm, complete view of your nutrition, weight, and personal health goals.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 2, color: "rgba(255,255,255,.75)" }}>
              <CalendarMonthRoundedIcon fontSize="small" />
              <Typography variant="body2">{dateLabel || "Your health dashboard"}</Typography>
            </Stack>
          </Box>
          <Stack direction={{ xs: "row", sm: "column" }} spacing={1.2} sx={{ flexShrink: 0 }}>
            <Button component={Link} href="/nutrition" variant="contained" startIcon={<AddRoundedIcon />} sx={{ flex: { xs: 1, sm: "initial" }, borderRadius: 2.5, py: 1.2, px: 2, bgcolor: "#d5fff1", color: "#123d4b", fontWeight: 800, whiteSpace: "nowrap", "&:hover": { bgcolor: "#c0f7e6" } }}>
              Log a meal
            </Button>
            <Button component={Link} href="/chat" variant="outlined" startIcon={<AutoAwesomeRoundedIcon />} sx={{ flex: { xs: 1, sm: "initial" }, borderRadius: 2.5, py: 1.2, px: 2, color: "#fff", borderColor: "rgba(255,255,255,.35)", fontWeight: 750, whiteSpace: "nowrap", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" } }}>
              Ask Copilot
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity={error.includes("Some dashboard") ? "warning" : "error"} action={
          <Tooltip title="Refresh dashboard">
            <IconButton color="inherit" size="small" onClick={() => setRefreshKey((key) => key + 1)}><RefreshRoundedIcon /></IconButton>
          </Tooltip>
        }>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <MetricCard label="Current weight" value={stats?.current_weight != null ? number(stats.current_weight, 1) : "—"} unit={stats?.current_weight != null ? "kg" : undefined} caption={stats?.latest_recorded_at ? `Updated ${displayDate(stats.latest_recorded_at)}` : "Add a measurement to begin"} icon={<MonitorWeightRoundedIcon fontSize="small" />} tone="#2a7ea4" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <MetricCard label="Calories today" value={number(todayCalories)} unit="kcal" caption={`${todaySummary?.entries ?? 0} food ${todaySummary?.entries === 1 ? "entry" : "entries"} logged`} icon={<LocalFireDepartmentRoundedIcon fontSize="small" />} tone="#db7e36" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <MetricCard label="This week" value={number(weekEntries)} caption="Nutrition entries in the last 7 days" icon={<RestaurantRoundedIcon fontSize="small" />} tone="#328e72" />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <MetricCard label="Profile setup" value={`${profileCompletion}%`} caption={`${conversationCount ?? 0} Copilot conversations`} icon={<PersonOutlineRoundedIcon fontSize="small" />} tone="#8064bd" />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 }, "&:last-child": { pb: { xs: 2.25, sm: 3 } } }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>Today&apos;s nutrition</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>Your logged food totals, without assumed targets.</Typography>
                  </Box>
                  <Chip label={`${todaySummary?.entries ?? 0} entries`} size="small" sx={{ bgcolor: "rgba(50,142,114,.10)", color: "#28765f", fontWeight: 750 }} />
                </Stack>

                <Box sx={{ p: 2.25, borderRadius: 3, color: "#fff", background: "linear-gradient(120deg, #246e66, #49a27e)" }}>
                  <Typography variant="body2" sx={{ opacity: .8 }}>Energy logged</Typography>
                  <Typography variant="h3" sx={{ mt: .4, fontWeight: 850, letterSpacing: "-.04em" }}>{number(todayCalories)} <Typography component="span" sx={{ fontSize: "1rem", fontWeight: 700, opacity: .8 }}>kcal</Typography></Typography>
                  {!todaySummary && <Typography variant="caption" sx={{ opacity: .8 }}>No food has been logged today.</Typography>}
                </Box>

                <Box>
                  <NutrientValue label="Protein" value={todaySummary?.protein_g ?? 0} />
                  <NutrientValue label="Carbohydrates" value={todaySummary?.carbs_g ?? 0} />
                  <NutrientValue label="Fat" value={todaySummary?.fat_g ?? 0} />
                  <NutrientValue label="Fiber" value={todaySummary?.fiber_g ?? 0} />
                </Box>

                <Button component={Link} href="/nutrition" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: "flex-start", fontWeight: 750 }}>Open food journal</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 }, "&:last-child": { pb: { xs: 2.25, sm: 3 } } }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>Weight journey</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: .35 }}>Progress from your recorded measurements.</Typography>
                  </Box>
                  <Button component={Link} href="/weight" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 750 }}>Manage weight</Button>
                </Stack>

                {loading && !stats ? (
                  <Box sx={{ minHeight: 190, display: "grid", placeItems: "center" }}><CircularProgress size={28} /></Box>
                ) : stats?.current_weight == null ? (
                  <Box sx={{ minHeight: 190, borderRadius: 3, bgcolor: "action.hover", display: "grid", placeItems: "center", textAlign: "center", p: 2.5 }}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                      <MonitorWeightRoundedIcon color="primary" sx={{ fontSize: 36 }} />
                      <Typography sx={{ fontWeight: 800 }}>Start your weight history</Typography>
                      <Typography variant="body2" color="text.secondary">Record a measurement when it feels useful to you.</Typography>
                      <Button component={Link} href="/weight" variant="contained" startIcon={<AddRoundedIcon />}>Add measurement</Button>
                    </Stack>
                  </Box>
                ) : (
                  <Stack spacing={2.2}>
                    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
                      <Box sx={{ flex: "1 1 140px", minWidth: 0, p: 1.8, borderRadius: 3, bgcolor: "action.hover" }}>
                        <Typography variant="caption" color="text.secondary">Latest</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 850 }}>{number(stats.current_weight, 1)} <Typography component="span" sx={{ fontSize: ".95rem", color: "text.secondary" }}>kg</Typography></Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 140px", minWidth: 0, p: 1.8, borderRadius: 3, bgcolor: "action.hover" }}>
                        <Typography variant="caption" color="text.secondary">Change from start</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 850 }}>{stats.weight_change != null ? `${stats.weight_change > 0 ? "+" : ""}${number(stats.weight_change, 1)}` : "—"} <Typography component="span" sx={{ fontSize: ".95rem", color: "text.secondary" }}>kg</Typography></Typography>
                      </Box>
                      <Box sx={{ flex: "1 1 140px", minWidth: 0, p: 1.8, borderRadius: 3, bgcolor: "action.hover" }}>
                        <Typography variant="caption" color="text.secondary">Target</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 850 }}>{stats.target_weight != null ? number(stats.target_weight, 1) : "Set one"} <Typography component="span" sx={{ fontSize: ".95rem", color: "text.secondary" }}>{stats.target_weight != null ? "kg" : ""}</Typography></Typography>
                      </Box>
                    </Stack>
                    {stats.goal_progress_percent != null && (
                      <Box>
                        <Stack direction="row" sx={{ justifyContent: "space-between", mb: .8 }}>
                          <Typography variant="body2" color="text.secondary">Goal progress</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{number(stats.goal_progress_percent)}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={Math.max(0, Math.min(100, stats.goal_progress_percent))} sx={{ height: 8, borderRadius: 5 }} />
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">{stats.entries} measurements recorded · latest on {displayDate(stats.latest_recorded_at)}</Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 }, "&:last-child": { pb: { xs: 2.25, sm: 3 } } }}>
              <Stack spacing={1.8}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>Nutrition this week</Typography>
                    <Typography variant="body2" color="text.secondary">Calories from foods you logged each day.</Typography>
                  </Box>
                  <Chip icon={<TrendingUpRoundedIcon />} label="7 days" size="small" variant="outlined" />
                </Stack>
                <Box sx={{ height: { xs: 230, sm: 270 }, width: "100%" }} aria-label="Seven day calories chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={.18} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={52} />
                      <ChartTooltip formatter={(value) => [`${number(Number(value))} kcal`, "Logged"]} labelFormatter={(label, payload) => payload?.[0]?.payload?.date ?? label} />
                      <Bar dataKey="calories" fill="#398f78" radius={[7, 7, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                {weekEntries === 0 && <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>Your logged nutrition history will appear here.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 }, "&:last-child": { pb: { xs: 2.25, sm: 3 } } }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 850 }}>Your health profile</Typography>
                  <Typography variant="body2" color="text.secondary">Details that help personalize Copilot.</Typography>
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: .8 }}>
                    <Typography variant="caption" color="text.secondary">Profile completeness</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>{profileCompletion}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={profileCompletion} sx={{ height: 7, borderRadius: 5 }} />
                </Box>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Chip icon={<TrackChangesRoundedIcon />} label={user?.goal?.replaceAll("_", " ") ?? "Goal not set"} />
                  <Chip icon={<FavoriteBorderRoundedIcon />} label={user?.activity_level?.replaceAll("_", " ") ?? "Activity not set"} />
                  <Chip icon={<RestaurantRoundedIcon />} label={user?.diet_preference ?? "Diet not set"} />
                  {user?.height_cm && <Chip label={`${number(user.height_cm, 1)} cm`} variant="outlined" />}
                  {stats?.target_weight != null && <Chip label={`Target ${number(stats.target_weight, 1)} kg`} variant="outlined" />}
                </Stack>
                {user?.food_allergies && <Typography variant="body2"><Box component="span" sx={{ fontWeight: 800 }}>Food allergies: </Box>{user.food_allergies}</Typography>}
                {user?.medical_conditions && <Typography variant="body2"><Box component="span" sx={{ fontWeight: 800 }}>Health notes: </Box>{user.medical_conditions}</Typography>}
                {bmi != null && Number.isFinite(bmi) && <Typography variant="body2" color="text.secondary">BMI estimate: {number(bmi, 1)} <Box component="span" sx={{ fontSize: ".78rem" }}>(informational only)</Box></Typography>}
                <Button component={Link} href="/profile" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: "flex-start", fontWeight: 750 }}>Review profile</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <WeightChart weights={weights} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 }, "&:last-child": { pb: { xs: 2.25, sm: 3 } } }}>
              <Stack spacing={2}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>Recent meals</Typography>
                    <Typography variant="body2" color="text.secondary">Latest entries from your food journal.</Typography>
                  </Box>
                  <RestaurantRoundedIcon color="success" />
                </Stack>
                {recentMeals.length ? recentMeals.slice(0, 5).map((meal) => (
                  <Stack key={meal.id} direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center", py: 1.1, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: 0 } }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meal.food_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{meal.meal_type} · {displayDate(meal.recorded_at)}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: "nowrap" }}>{number(meal.calories)} kcal</Typography>
                  </Stack>
                )) : (
                  <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "action.hover", textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">No meals logged yet. Add your first food entry to start building your journal.</Typography>
                  </Box>
                )}
                <Button component={Link} href="/nutrition" endIcon={<ArrowForwardRoundedIcon />} sx={{ alignSelf: "flex-start", fontWeight: 750 }}>View nutrition journal</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", background: "linear-gradient(125deg, rgba(126,87,194,.08), rgba(65,157,157,.08))" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}><AutoAwesomeRoundedIcon /></Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>Your Copilot is ready</Typography>
                    <Typography variant="body2" color="text.secondary">Ask about your logs, goals, or a healthier next step.</Typography>
                  </Box>
                </Stack>
                <Button component={Link} href="/chat" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 2.5, whiteSpace: "nowrap" }}>Start a conversation</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ height: "100%", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "primary.main" }}><ChatBubbleOutlineRoundedIcon /></Box>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Conversation history</Typography>
                  <Typography variant="body2" color="text.secondary">{conversationCount ?? 0} saved Copilot chats</Typography>
                </Box>
                <Button component={Link} href="/chat" sx={{ ml: "auto", whiteSpace: "nowrap" }}>Open</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
          <CircularProgress size={16} />
          <Typography variant="caption">Refreshing your health overview…</Typography>
        </Stack>
      )}
    </Stack>
  );
}
