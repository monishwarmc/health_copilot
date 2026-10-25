"use client";

import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import toast from "react-hot-toast";

interface GoogleReauthButtonProps {
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
}

export default function GoogleReauthButton({ onCredential, disabled = false }: GoogleReauthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);


  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;
    let attempts = 0;

    const renderButton = () => {
      if (cancelled || !buttonRef.current || !window.google) return;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setFailed(true);
        return;
      }

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        context: "signin",
        callback: async (response) => {
          if (!response.credential) {
            toast.error("Google did not return a verification token.");
            return;
          }
          try {
            await onCredentialRef.current(response.credential);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Google verification failed.");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        use_fedcm_for_button: true,
        width: Math.min(Math.max(Math.floor(buttonRef.current.clientWidth), 220), 400),
      });
      setReady(true);
      setFailed(false);
    };

    if (window.google) {
      renderButton();
    } else {
      interval = window.setInterval(() => {
        attempts += 1;
        if (window.google) {
          if (interval !== undefined) window.clearInterval(interval);
          renderButton();
        } else if (attempts >= 100) {
          if (interval !== undefined) window.clearInterval(interval);
          setFailed(true);
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  return (
    <Stack spacing={1} sx={{ width: "100%", alignItems: "center" }}>
      {!ready && !failed && <CircularProgress size={20} />}
      {failed && <Typography variant="body2" color="error">Google verification could not be loaded. Refresh and try again.</Typography>}
      <Box ref={buttonRef} aria-label="Verify account with Google" sx={{ width: "100%", minHeight: 44, opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? "none" : "auto" }} />
    </Stack>
  );
}
