"use client";

import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

interface AddWeightFormProps {
  onSubmit: (
    weightKg: number,
    recordedAt: string,
    notes: string
  ) => Promise<void>;

  loading?: boolean;
}

export default function AddWeightForm({
  onSubmit,
  loading = false,
}: AddWeightFormProps) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const weightValue = Number(weight);

    if (
      !weight ||
      Number.isNaN(weightValue) ||
      weightValue <= 0
    ) {
      return;
    }

    if (!date) {
      return;
    }

    await onSubmit(
      weightValue,
      date,
      notes.trim()
    );

    setWeight("");
    setNotes("");
  };

  return (
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
          {/* Header */}
          <Stack spacing={0.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Record Weight
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
              }}
            >
              Add a new measurement to track your
              progress.
            </Typography>
          </Stack>

          {/* Form */}
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2}
          >
            {/* Weight */}
            <TextField
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) =>
                setWeight(e.target.value)
              }
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
              }}
            />

            {/* Date */}
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            {/* Notes */}
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Optional"
              fullWidth
              multiline
              minRows={3}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                mt: 1,
                py: 1.4,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              {loading
                ? "Recording..."
                : "Record Weight"}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}