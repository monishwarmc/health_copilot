"use client";

import { useEffect, useState } from "react";
import AddToHomeScreenRoundedIcon from "@mui/icons-material/AddToHomeScreenRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallAppButtonProps {
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
}

export default function InstallAppButton({
  fullWidth = false,
  size = "medium",
  variant = "outlined",
}: InstallAppButtonProps) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setInstalled(standalone);
    setIsIOS(ios);
    setIsAndroid(/Android/i.test(userAgent));
    setReady(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setHelpOpen(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch {
      setHelpOpen(true);
    } finally {
      setInstallPrompt(null);
    }
  };

  if (!ready || installed) return null;

  const steps = isIOS
    ? [
        "Open this page in Safari.",
        "Tap the Share button (the square with an upward arrow).",
        "Choose Add to Home Screen, then tap Add.",
      ]
    : isAndroid
      ? [
          "Open the browser menu (⋮) in Chrome.",
          "Choose Install app or Add to Home screen.",
          "Confirm Add or Install. Health Copilot will get its own home screen icon.",
        ]
      : [
          "Open your browser menu.",
          "Choose Install Health Copilot or Add to Home Screen if your browser offers it.",
          "Launch it from its new app icon for a focused, standalone window.",
        ];

  return (
    <>
      <Button
        onClick={handleInstall}
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        startIcon={<AddToHomeScreenRoundedIcon />}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        Install app
      </Button>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Make Health Copilot your own app</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2">
            Add it to your home screen to open Health Copilot in its own app window, separate from your browser tabs.
          </Typography>
          <List dense disablePadding sx={{ mt: 1.5 }}>
            {steps.map((step) => (
              <ListItem key={step} disableGutters>
                <ListItemIcon sx={{ minWidth: 34, color: "primary.main" }}>
                  {isIOS ? <CheckRoundedIcon fontSize="small" /> : <CheckCircleRoundedIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={step} slotProps={{ primary: { variant: "body2" } }} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHelpOpen(false)} variant="contained">Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
