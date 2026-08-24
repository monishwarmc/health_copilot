"use client";

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import type {
  ChatMessage as ChatMessageType,
} from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser
          ? "flex-end"
          : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: {
            xs: "88%",
            sm: "75%",
          },

          px: 2,
          py: 1.5,

          borderRadius: 3,

          bgcolor: isUser
            ? "primary.main"
            : "action.hover",

          color: isUser
            ? "primary.contrastText"
            : "text.primary",

          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        <Typography variant="body1">
          {message.content}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.75,
            opacity: 0.65,
            textAlign: "right",
          }}
        >
          {new Date(
            message.created_at,
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "numeric",
              minute: "2-digit",
            },
          )}
        </Typography>
      </Paper>
    </Box>
  );
}