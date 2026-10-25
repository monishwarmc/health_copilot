"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import MonitorWeightRoundedIcon from "@mui/icons-material/MonitorWeightRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

import ChatMessage from "@/components/chat/ChatMessage";
import getErrorMessage from "@/lib/error";
import { executeChatAction, sendChatMessage } from "@/services/chat.service";
import type { ChatAction, ChatMessage as ChatMessageType } from "@/types/chat";

function localMessage(role: ChatMessageType["role"], content: string): ChatMessageType {
  return {
    id: `copilot-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

function pageLabel(pathname: string) {
  const route = pathname.split("/").filter(Boolean)[0];
  const labels: Record<string, string> = {
    dashboard: "your dashboard",
    nutrition: "your food journal",
    weight: "your weight journey",
    profile: "your health profile",
  };
  return labels[route ?? ""] ?? "your health journey";
}

export default function CopilotLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingAction, setPendingAction] = useState<ChatAction | null>(null);
  const [sending, setSending] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const send = async (content = draft) => {
    const message = content.trim();
    if (!message || sending || executing) return;

    const optimisticMessage = localMessage("user", message);
    setDraft("");
    setSending(true);
    setError(null);
    setPendingAction(null);
    setMessages((current) => [...current, optimisticMessage]);

    try {
      const response = await sendChatMessage({ conversation_id: conversationId, message });
      setConversationId(response.conversation_id);
      setMessages((current) => [...current, response.message]);
      setPendingAction(response.action);
    } catch (sendError) {
      setError(getErrorMessage(sendError));
      setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id));
      setDraft(message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) setDraft(detail.prompt);
    };
    window.addEventListener("health-copilot:open", handleOpen);
    return () => window.removeEventListener("health-copilot:open", handleOpen);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingAction, sending]);

  const confirmAction = async () => {
    if (!pendingAction || !conversationId || executing) return;
    setExecuting(true);
    setError(null);
    try {
      const response = await executeChatAction({
        conversation_id: conversationId,
        action_type: pendingAction.type,
        payload: pendingAction.payload,
      });
      setMessages((current) => [...current, localMessage("assistant", response.message)]);
      setPendingAction(null);
      window.dispatchEvent(new Event("health-copilot:data-updated"));
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setExecuting(false);
    }
  };

  const startNewChat = () => {
    if (sending || executing) return;
    setMessages([]);
    setConversationId(null);
    setPendingAction(null);
    setError(null);
    setDraft("");
  };

  const suggestions = [
    { label: "Review my food log", prompt: "Can you summarize the nutrition I have logged today?", icon: <RestaurantRoundedIcon fontSize="small" /> },
    { label: "Check my progress", prompt: "Can you help me understand my recent weight progress?", icon: <MonitorWeightRoundedIcon fontSize="small" /> },
    { label: "Plan a next step", prompt: "Suggest one realistic health habit I can focus on this week.", icon: <AutoAwesomeRoundedIcon fontSize="small" /> },
  ];

  return (
    <>
      {pathname !== "/chat" && (
        <Tooltip title="Ask Health Copilot" placement="left">
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setOpen(true)}
            aria-label="Ask Health Copilot"
            sx={{
              position: "fixed",
              right: { xs: 16, sm: 24 },
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              zIndex: (theme) => theme.zIndex.drawer + 2,
              px: { xs: 0, sm: 2.2 },
              width: { xs: 56, sm: "auto" },
              minWidth: { xs: 56, sm: 56 },
              height: 56,
              borderRadius: 4,
              color: "#fff",
              background: "linear-gradient(135deg, #5368c8, #8356c9 60%, #9a63c1)",
              boxShadow: "0 10px 30px rgba(94, 83, 184, .38)",
              "&:hover": { background: "linear-gradient(135deg, #465ab7, #7447bb 60%, #8a54b4)" },
            }}
          >
            <AutoAwesomeRoundedIcon />
            <Typography sx={{ display: { xs: "none", sm: "inline" }, ml: 1, fontWeight: 800 }}>Ask Copilot</Typography>
          </Fab>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 440 },
            maxWidth: "100vw",
            height: "100dvh",
            border: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          },
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: "max(16px, env(safe-area-inset-top))", pb: 2, color: "#fff", background: "linear-gradient(120deg, #364b9a, #7951ae 65%, #945caa)" }}>
          <Stack direction="row" spacing={1.4} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 44, height: 44, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 3, bgcolor: "rgba(255,255,255,.16)" }}><AutoAwesomeRoundedIcon /></Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 850 }}>Health Copilot</Typography>
              <Typography variant="caption" sx={{ opacity: .78 }}>Here with you on {pageLabel(pathname)}</Typography>
            </Box>
            <Tooltip title="Start a new chat">
              <IconButton onClick={startNewChat} aria-label="Start a new chat" sx={{ color: "#fff" }}><UndoRoundedIcon /></IconButton>
            </Tooltip>
            <IconButton onClick={() => setOpen(false)} aria-label="Close Copilot" sx={{ color: "#fff" }}><CloseRoundedIcon /></IconButton>
          </Stack>
        </Box>

        <Box ref={scrollRef} sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: { xs: 1.5, sm: 2 }, py: 2 }}>
          {messages.length === 0 ? (
            <Stack spacing={2} sx={{ minHeight: "100%", justifyContent: "center", px: .5 }}>
              <Box sx={{ textAlign: "center", px: 2, pb: 1 }}>
                <Box sx={{ width: 68, height: 68, mx: "auto", mb: 1.5, display: "grid", placeItems: "center", borderRadius: 5, color: "secondary.main", bgcolor: "rgba(126,87,194,.12)" }}><AutoAwesomeRoundedIcon sx={{ fontSize: 34 }} /></Box>
                <Typography variant="h6" sx={{ fontWeight: 850 }}>What would you like help with?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: .6, lineHeight: 1.6 }}>Ask about the health data you have logged or get general wellness guidance.</Typography>
              </Box>
              {suggestions.map((suggestion) => (
                <Paper key={suggestion.label} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Button fullWidth onClick={() => void send(suggestion.prompt)} startIcon={suggestion.icon} endIcon={<OpenInFullRoundedIcon sx={{ transform: "rotate(45deg)" }} />} sx={{ justifyContent: "space-between", px: 1.8, py: 1.5, textTransform: "none", fontWeight: 750, color: "text.primary" }}>
                    {suggestion.label}
                  </Button>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Stack spacing={1}>
              {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
              {sending && <Stack direction="row" spacing={1} sx={{ alignItems: "center", px: 1, py: 1.5 }}><AutoAwesomeRoundedIcon color="secondary" fontSize="small" /><Typography variant="body2" color="text.secondary">Thinking about your question…</Typography></Stack>}
              {pendingAction && (
                <Paper variant="outlined" sx={{ ml: { xs: 0, sm: 3 }, p: 1.8, borderRadius: 3, borderColor: "warning.light", bgcolor: "rgba(255,167,38,.06)" }}>
                  <Stack spacing={1.3}>
                    <Box>
                      <Chip size="small" color="warning" label="Needs your confirmation" sx={{ mb: .8, fontWeight: 750 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{pendingAction.type.replaceAll("_", " ").toLowerCase()}</Typography>
                      <Typography variant="caption" color="text.secondary">Copilot will only update your account after you confirm.</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" size="small" startIcon={<CheckRoundedIcon />} onClick={() => void confirmAction()} disabled={executing} sx={{ borderRadius: 2, fontWeight: 750 }}>{executing ? "Saving…" : "Confirm update"}</Button>
                      <Button size="small" onClick={() => setPendingAction(null)} disabled={executing} sx={{ borderRadius: 2 }}>Dismiss</Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}
        </Box>

        <Divider />
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.4, pb: "max(14px, env(safe-area-inset-bottom))", bgcolor: "background.paper" }}>
          {error && <Alert severity="error" sx={{ mb: 1.2, py: 0 }}>{error}</Alert>}
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={draft}
              disabled={sending || executing}
              placeholder="Ask anything about your health journey…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <Tooltip title="Send message">
              <span>
                <IconButton color="primary" onClick={() => void send()} disabled={!draft.trim() || sending || executing} aria-label="Send message" sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: "action.hover" }}>
                  <SendRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, textAlign: "center" }}>General health information only. Not a diagnosis or emergency service.</Typography>
        </Box>
      </Drawer>
    </>
  );
}
