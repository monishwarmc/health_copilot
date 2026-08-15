"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {Weight} from "@/types/weight"

interface WeightChartProps {
  weights: Weight[];
}

interface ChartData {
  id: string;
  weight_kg: number;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  date: string;
}

export default function WeightChart({
  weights,
}: WeightChartProps) {
  const chartData: ChartData[] = [...weights]
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() -
        new Date(b.recorded_at).getTime()
    )
    .map((weight) => ({
      ...weight,
      date: new Date(
        weight.recorded_at
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    }));

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
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
          <Stack spacing={0.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Weight Trend
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
              }}
            >
              Your weight changes over time
            </Typography>
          </Stack>

          {chartData.length === 0 && (
            <Box
              sx={{
                minHeight: 280,
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
                  No weight data yet
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 280,
                    lineHeight: 1.6,
                  }}
                >
                  Add your first weight measurement
                  to start tracking your progress.
                </Typography>
              </Stack>
            </Box>
          )}

          {chartData.length === 1 && (
            <Box
              sx={{
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Stack
                spacing={1}
                sx={{
                    alignItems:"center"
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems:"center"
                  }}
                  spacing={0.75}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {chartData[0].weight_kg.toFixed(1)}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    kg
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                  }}
                >
                  One measurement recorded.
                  <br />
                  Add more measurements to see your
                  trend.
                </Typography>
              </Stack>
            </Box>
          )}

          {chartData.length > 1 && (
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: 280,
                  sm: 340,
                },
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.1}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                    tickFormatter={(value: number) =>
                      `${value}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => {
                      if (
                        Array.isArray(value)
                      ) {
                        return [
                          `${Number(value[0]).toFixed(
                            1
                          )} kg`,
                          "Weight",
                        ];
                      }

                      return [
                        `${Number(value).toFixed(
                          1
                        )} kg`,
                        "Weight",
                      ];
                    }}
                    labelFormatter={(label) =>
                      `Date: ${String(label)}`
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid",
                      background:
                        "var(--mui-palette-background-paper)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="weight_kg"
                    stroke="currentColor"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}