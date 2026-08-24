"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";

import SendRoundedIcon from
  "@mui/icons-material/SendRounded";

interface ChatInputProps {
  onSend: (
    message: string,
  ) => Promise<void> | void;

  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] =
    useState("");

  const inputRef =
    useRef<
      HTMLInputElement |
      HTMLTextAreaElement |
      null
    >(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    const message = value.trim();

    if (!message || disabled) {
      return;
    }

    setValue("");

    await onSend(message);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems:"flex-end"
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={5}
        value={value}
        disabled={disabled}
        placeholder="Ask Health Copilot anything..."
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          /*
           * MUI TextField types this event against
           * its outer element. We don't need to
           * manually specify the event type.
           */

          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();

            void submit();
          }
        }}
        slotProps={{
          htmlInput: {
            ref: inputRef,
          },
        }}
      />

      <Tooltip title="Send">
        <span>
          <IconButton
            color="primary"
            onClick={() => void submit()}
            disabled={
              disabled ||
              !value.trim()
            }
            sx={{
              width: 48,
              height: 48,
              mb: 0.25,
            }}
          >
            <SendRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}