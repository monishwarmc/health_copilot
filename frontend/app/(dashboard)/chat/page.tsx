"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

import ChatHistory from "@/components/chat/ChatHistory";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";

import getErrorMessage from "@/lib/error";

import {
  deleteChatConversation,
  executeChatAction,
  getChatConversation,
  getChatConversations,
  sendChatMessage,
  updateChatTitle,
} from "@/services/chat.service";

import type {
  ChatAction,
  ChatConversation,
  ChatMessage as ChatMessageType,
} from "@/types/chat";

interface PendingAction {
  conversationId: string;
  action: ChatAction;
}

function makeLocalUserMessage(
  content: string,
): ChatMessageType {
  return {
    id: `local-user-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    role: "user",
    content,
    created_at: new Date().toISOString(),
  };
}

function makeLocalAssistantMessage(
  content: string,
): ChatMessageType {
  return {
    id: `local-assistant-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    role: "assistant",
    content,
    created_at: new Date().toISOString(),
  };
}

function formatActionLabel(
  action: ChatAction,
): string {
  return action.type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase(),
    );
}

export default function ChatPage() {
  const [
    conversations,
    setConversations,
  ] = useState<ChatConversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);

  const [
    messages,
    setMessages,
  ] = useState<ChatMessageType[]>([]);

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction | null>(null);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    executingAction,
    setExecutingAction,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const activeConversation =
    useMemo(
      () =>
        conversations.find(
          (conversation) =>
            conversation.id ===
            activeConversationId,
        ) ?? null,
      [
        conversations,
        activeConversationId,
      ],
    );

  const scrollToBottom =
    useCallback(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, []);

  useEffect(() => {
    scrollToBottom();
  }, [
    messages,
    sending,
    pendingAction,
    scrollToBottom,
  ]);

  /*
   * =========================================================
   * LOAD CONVERSATIONS
   * =========================================================
   */

  const loadConversations =
    useCallback(async () => {
      try {
        setLoadingConversations(true);
        setError(null);

        const response =
          await getChatConversations();

        setConversations(
          response.items,
        );
      } catch (err) {
        setError(
          getErrorMessage(err),
        );
      } finally {
        setLoadingConversations(false);
      }
    }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  /*
   * =========================================================
   * NEW CHAT
   * =========================================================
   */

  const startNewChat = () => {
    if (
      sending ||
      executingAction
    ) {
      return;
    }

    setActiveConversationId(null);
    setMessages([]);
    setPendingAction(null);
    setError(null);
  };

  /*
   * =========================================================
   * SELECT CONVERSATION
   * =========================================================
   */

  const selectConversation =
    async (
      conversationId: string,
    ) => {
      if (
        sending ||
        executingAction
      ) {
        return;
      }

      try {
        setLoadingConversation(true);
        setError(null);
        setPendingAction(null);

        setActiveConversationId(
          conversationId,
        );

        setMessages([]);

        const conversation =
          await getChatConversation(
            conversationId,
          );

        setMessages(
          conversation.messages,
        );

        setConversations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                conversation.id
                  ? conversation
                  : item,
            ),
        );
      } catch (err) {
        setError(
          getErrorMessage(err),
        );

        setActiveConversationId(null);
        setMessages([]);
      } finally {
        setLoadingConversation(false);
      }
    };

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  const handleSend = async (
    content: string,
  ) => {
    if (
      sending ||
      executingAction
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setPendingAction(null);

    const previousConversationId =
      activeConversationId;

    const optimisticMessage =
      makeLocalUserMessage(
        content,
      );

    setMessages(
      (current) => [
        ...current,
        optimisticMessage,
      ],
    );

    try {
      const response =
        await sendChatMessage({
          conversation_id:
            previousConversationId,
          message: content,
        });

      const conversationId =
        response.conversation_id;

      setActiveConversationId(
        conversationId,
      );

      setMessages(
        (current) => [
          ...current,
          response.message,
        ],
      );

      if (response.action) {
        setPendingAction({
          conversationId,
          action: response.action,
        });
      }

      if (
        previousConversationId ===
        null
      ) {
        await loadConversations();
      } else {
        try {
          const updatedConversation =
            await getChatConversation(
              conversationId,
            );

          setConversations(
            (current) => {
              const exists =
                current.some(
                  (item) =>
                    item.id ===
                    updatedConversation.id,
                );

              if (!exists) {
                return [
                  updatedConversation,
                  ...current,
                ];
              }

              return current.map(
                (item) =>
                  item.id ===
                  updatedConversation.id
                    ? updatedConversation
                    : item,
              );
            },
          );
        } catch {
          // Chat succeeded.
        }
      }
    } catch (err) {
      setMessages(
        (current) =>
          current.filter(
            (message) =>
              message.id !==
              optimisticMessage.id,
          ),
      );

      setError(
        getErrorMessage(err),
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * =========================================================
   * CONFIRM ACTION
   * =========================================================
   */

  const confirmAction =
    async () => {
      if (
        !pendingAction ||
        executingAction
      ) {
        return;
      }

      const action =
        pendingAction;

      try {
        setExecutingAction(true);
        setError(null);

        const response =
          await executeChatAction({
            conversation_id:
              action.conversationId,
            action_type:
              action.action.type,
            payload:
              action.action.payload,
          });

        if (!response.success) {
          setError(
            response.message ||
              "The action could not be completed.",
          );

          return;
        }

        setMessages(
          (current) => [
            ...current,
            makeLocalAssistantMessage(
              response.message,
            ),
          ],
        );

        setPendingAction(null);

        await loadConversations();
      } catch (err) {
        setError(
          getErrorMessage(err),
        );
      } finally {
        setExecutingAction(false);
      }
    };

  /*
   * =========================================================
   * CANCEL ACTION
   * =========================================================
   */

  const cancelAction = () => {
    if (executingAction) {
      return;
    }

    setPendingAction(null);
  };

  /*
   * =========================================================
   * RENAME
   * =========================================================
   */

  const renameConversation =
    async (
      conversation: ChatConversation,
      title: string,
    ) => {
      const trimmedTitle =
        title.trim();

      if (
        !trimmedTitle ||
        trimmedTitle.length > 200
      ) {
        return;
      }

      try {
        setError(null);

        const updated =
          await updateChatTitle(
            conversation.id,
            {
              title: trimmedTitle,
            },
          );

        setConversations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item,
            ),
        );
      } catch (err) {
        setError(
          getErrorMessage(err),
        );

        throw err;
      }
    };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const removeConversation =
    async (
      conversationId: string,
    ) => {
      try {
        setError(null);

        await deleteChatConversation(
          conversationId,
        );

        setConversations(
          (current) =>
            current.filter(
              (conversation) =>
                conversation.id !==
                conversationId,
            ),
        );

        if (
          conversationId ===
          activeConversationId
        ) {
          setActiveConversationId(null);
          setMessages([]);
          setPendingAction(null);
        }
      } catch (err) {
        setError(
          getErrorMessage(err),
        );
      }
    };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <Box
      sx={{
        /*
         * The page itself MUST NOT scroll.
         */
        width: "100%",
        height: "100%",
        minHeight: 0,

        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 0,

          display: "flex",
          flexDirection: "column",

          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            minHeight: 0,

            display: "flex",

            flexDirection: {
              xs: "column",
              md: "row",
            },

            overflow: "hidden",
          }}
        >
          {/* =================================================
              CHAT HISTORY
          ================================================== */}

          <Box
            sx={{
              /*
               * Critical for flexbox:
               * allows ChatHistory to shrink.
               */
              minHeight: 0,
              minWidth: 0,

              /*
               * Desktop sidebar occupies its own
               * scrolling region.
               */
              overflow: "hidden",

              display: "flex",
              flexDirection: "column",

              flexShrink: 0,

              width: {
                xs: "100%",
                md: 300,
              },

              maxHeight: {
                xs: 280,
                md: "100%",
              },
            }}
          >
            <ChatHistory
              conversations={
                conversations
              }
              activeConversationId={
                activeConversationId
              }
              loading={
                loadingConversations
              }
              onNewChat={
                startNewChat
              }
              onSelect={(id) =>
                void selectConversation(
                  id,
                )
              }
              onRename={
                renameConversation
              }
              onDelete={
                removeConversation
              }
            />
          </Box>

          {/* =================================================
              CHAT CONTENT
          ================================================== */}

          <Box
            sx={{
              flex: 1,

              minWidth: 0,
              minHeight: 0,

              display: "flex",
              flexDirection: "column",

              overflow: "hidden",
            }}
          >
            {/* Header */}

            <Box
              sx={{
                flexShrink: 0,

                px: {
                  xs: 2,
                  sm: 3,
                },

                py: 2,
              }}
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
                    width: 42,
                    height: 42,
                    flexShrink: 0,

                    borderRadius:
                      "50%",

                    display: "grid",
                    placeItems:
                      "center",

                    bgcolor:
                      "primary.main",

                    color:
                      "primary.contrastText",
                  }}
                >
                  <SmartToyOutlinedIcon />
                </Box>

                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {activeConversation?.title ||
                      "Health Copilot"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Ask about your
                    health, nutrition,
                    weight, or goals.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Error */}

            {error && (
              <Alert
                severity="error"
                onClose={() =>
                  setError(null)
                }
                sx={{
                  m: 2,
                  flexShrink: 0,
                }}
              >
                {error}
              </Alert>
            )}

            {/* =================================================
                MESSAGE SCROLLER
            ================================================== */}

            <Box
              sx={{
                flex: 1,
                minHeight: 0,

                overflowY: "auto",
                overflowX: "hidden",

                px: {
                  xs: 2,
                  sm: 3,
                },

                py: 3,

                overscrollBehavior:
                  "contain",
              }}
            >
              {loadingConversation ? (
                <Stack
                  sx={{
                    minHeight: 300,
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                  spacing={2}
                >
                  <CircularProgress
                    size={28}
                  />

                  <Typography
                    color="text.secondary"
                  >
                    Loading
                    conversation...
                  </Typography>
                </Stack>
              ) : messages.length ===
                0 ? (
                <Stack
                  spacing={1}
                  sx={{
                    minHeight: 350,
                    maxWidth: 600,
                    mx: "auto",
                    textAlign:
                      "center",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    How can I help?
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Start a conversation
                    with your Health
                    Copilot.
                  </Typography>
                </Stack>
              ) : (
                <>
                  {messages.map(
                    (message) => (
                      <ChatMessage
                        key={
                          message.id
                        }
                        message={
                          message
                        }
                      />
                    ),
                  )}

                  {sending && (
                    <Box
                      sx={{
                        display:
                          "flex",
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 3,
                          bgcolor:
                            "action.hover",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems:
                              "center",
                          }}
                        >
                          <CircularProgress
                            size={16}
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Health Copilot
                            is thinking...
                          </Typography>
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </>
              )}

              {/* =================================================
                  ACTION CONFIRMATION
              ================================================== */}

              {pendingAction && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,

                    borderRadius: 3,

                    border:
                      "1px solid",
                    borderColor:
                      "warning.main",

                    bgcolor:
                      "background.paper",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Confirmation required
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Health Copilot
                    wants to perform:
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {formatActionLabel(
                      pendingAction.action,
                    )}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Review the
                    assistant&apos;s
                    message above before
                    confirming this
                    action.
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={
                        <CloseRoundedIcon />
                      }
                      onClick={
                        cancelAction
                      }
                      disabled={
                        executingAction
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={
                        executingAction ? (
                          <CircularProgress
                            size={16}
                            color="inherit"
                          />
                        ) : (
                          <CheckRoundedIcon />
                        )
                      }
                      onClick={() =>
                        void confirmAction()
                      }
                      disabled={
                        executingAction
                      }
                    >
                      Confirm
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* =================================================
                INPUT
            ================================================== */}

            <Divider />

            <CardContent
              sx={{
                flexShrink: 0,

                px: {
                  xs: 2,
                  sm: 3,
                },

                py: 2,
              }}
            >
              <ChatInput
                onSend={handleSend}
                disabled={
                  sending ||
                  executingAction ||
                  loadingConversation
                }
              />
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
