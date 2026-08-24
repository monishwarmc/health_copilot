"use client";

import { useState } from "react";

import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import type { ChatConversation } from "@/types/chat";

interface ChatHistoryProps {
  conversations: ChatConversation[];

  activeConversationId: string | null;

  loading?: boolean;

  onNewChat: () => void;

  onSelect: (
    conversationId: string,
  ) => void;

  onRename: (
    conversation: ChatConversation,
    title: string,
  ) => Promise<void>;

  onDelete: (
    conversationId: string,
  ) => Promise<void>;
}

export default function ChatHistory({
  conversations,
  activeConversationId,
  loading = false,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
}: ChatHistoryProps) {
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const startRename = (
    conversation: ChatConversation,
  ) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveRename = async (
    conversation: ChatConversation,
  ) => {
    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    if (title.length > 200) {
      return;
    }

    await onRename(
      conversation,
      title,
    );

    cancelRename();
  };

  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          md: 300,
        },

        flexShrink: 0,

        borderRight: {
          xs: 0,
          md: "1px solid",
        },

        borderColor: "divider",

        display: "flex",
        flexDirection: "column",

        minHeight: {
          xs: "auto",
          md: "calc(100vh - 150px)",
        },

        bgcolor: "background.paper",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Stack
        spacing={1.5}
        sx={{
          p: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={
            <AddRoundedIcon />
          }
          onClick={onNewChat}
          fullWidth
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          New Chat
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            px: 0.5,
            fontWeight: 600,
          }}
        >
          Conversations
        </Typography>
      </Stack>

      <Divider />

      {/* =====================================================
          CONVERSATION LIST
      ===================================================== */}

      <List
        disablePadding
        sx={{
          overflowY: "auto",
          flex: 1,
          p: 1,

          /*
           * Keep scrollbar subtle.
           */
          "&::-webkit-scrollbar": {
            width: 6,
          },

          "&::-webkit-scrollbar-thumb": {
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Loading */}

        {loading && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              p: 2,
              textAlign: "center",
            }}
          >
            Loading conversations...
          </Typography>
        )}

        {/* Empty */}

        {!loading &&
          conversations.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                p: 2,
                textAlign: "center",
              }}
            >
              No conversations yet.
            </Typography>
          )}

        {/* Conversations */}

        {conversations.map(
          (conversation) => {
            const active =
              conversation.id ===
              activeConversationId;

            const editing =
              editingId ===
              conversation.id;

            {/* =================================================
                RENAME MODE
            ================================================= */}

            if (editing) {
              return (
                <Stack
                  key={conversation.id}
                  direction="row"
                  spacing={0.5}
                  sx={{
                    p: 1,
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="input"
                    autoFocus
                    value={editingTitle}
                    maxLength={200}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                    ) => {
                      setEditingTitle(
                        event.target.value,
                      );
                    }}
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        void saveRename(
                          conversation,
                        );
                      }

                      if (
                        event.key ===
                        "Escape"
                      ) {
                        cancelRename();
                      }
                    }}
                    sx={{
                      minWidth: 0,
                      flex: 1,

                      border:
                        "1px solid",

                      borderColor:
                        "divider",

                      borderRadius: 1.5,

                      bgcolor:
                        "background.paper",

                      color:
                        "text.primary",

                      px: 1,
                      py: 0.75,

                      outline: "none",

                      font: "inherit",

                      "&:focus": {
                        borderColor:
                          "primary.main",
                      },
                    }}
                  />

                  <Tooltip title="Save">
                    <span>
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={
                          !editingTitle.trim()
                        }
                        onClick={() =>
                          void saveRename(
                            conversation,
                          )
                        }
                      >
                        <CheckRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Cancel">
                    <IconButton
                      size="small"
                      onClick={
                        cancelRename
                      }
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              );
            }

            {/* =================================================
                NORMAL CONVERSATION
            ================================================= */}

            return (
              <ListItemButton
                key={conversation.id}
                selected={active}
                onClick={() =>
                  onSelect(
                    conversation.id,
                  )
                }
                sx={{
                  borderRadius: 2,
                  mb: 0.5,

                  alignItems: "center",

                  transition:
                    "background-color 0.15s ease",

                  "&.Mui-selected": {
                    bgcolor:
                      "action.selected",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor:
                      "action.selected",
                  },

                  "&:hover .chat-history-actions":
                    {
                      opacity: 1,
                    },
                }}
              >
                {/* =================================================
                    CONVERSATION TEXT
                ================================================= */}

                <ListItemText
                  sx={{
                    minWidth: 0,
                    mr: 0.5,
                  }}
                  primary={
                    conversation.title
                  }
                  secondary={new Date(
                    conversation.updated_at,
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    },
                  )}
                  slotProps={{
                    primary: {
                      noWrap: true,

                      sx: {
                        fontWeight:
                          active
                            ? 700
                            : 500,
                      },
                    },

                    secondary: {
                      noWrap: true,

                      sx: {
                        color:
                          "text.secondary",
                      },
                    },
                  }}
                />

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <Stack
                  className="chat-history-actions"
                  direction="row"
                  spacing={0.25}
                  sx={{
                    ml: 0.5,

                    /*
                     * Hidden until hover on desktop.
                     * Always visible for touch devices.
                     */
                    opacity: {
                      xs: 1,
                      md: 0,
                    },

                    transition:
                      "opacity 0.15s ease",
                  }}
                >
                  <Tooltip title="Rename">
                    <IconButton
                      size="small"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        startRename(
                          conversation,
                        );
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                      }}
                    >
                      <EditOutlinedIcon
                        fontSize="small"
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        void onDelete(
                          conversation.id,
                        );
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                      }}
                    >
                      <DeleteOutlineRoundedIcon
                        fontSize="small"
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemButton>
            );
          },
        )}
      </List>
    </Box>
  );
}