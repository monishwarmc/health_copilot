"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import getErrorMessage from "@/lib/error";

export default function GoogleButton() {
  const buttonRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [ready, setReady] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const { googleAuth } =
    useAuth();

  useEffect(() => {
    let cancelled = false;

    const renderGoogleButton =
      () => {
        if (cancelled) {
          return;
        }

        if (!buttonRef.current) {
          return;
        }

        if (
          typeof window ===
            "undefined" ||
          !window.google
        ) {
          return;
        }

        const clientId =
          process.env
            .NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          console.error(
            "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured."
          );

          setError(
            "Google Sign-In is not configured."
          );

          return;
        }

        /*
         * Prevent duplicate buttons.
         */
        buttonRef.current.innerHTML =
          "";

        try {
          /*
           * =====================================================
           * INITIALIZE GOOGLE IDENTITY SERVICES
           * =====================================================
           */

          window.google.accounts.id.initialize(
            {
              client_id: clientId,

              callback: async (
                response
              ) => {
                if (
                  !response.credential
                ) {
                  toast.error(
                    "Google did not return a credential."
                  );

                  return;
                }

                const toastId =
                  toast.loading(
                    "Signing in with Google..."
                  );

                try {
                  await googleAuth(
                    response.credential
                  );

                  toast.success(
                    "Logged in successfully",
                    {
                      id: toastId,
                    }
                  );
                } catch (error) {
                  toast.error(
                    getErrorMessage(
                      error
                    ),
                    {
                      id: toastId,
                    }
                  );
                }
              },
            }
          );

          /*
           * =====================================================
           * RENDER GOOGLE BUTTON
           * =====================================================
           */

          window.google.accounts.id.renderButton(
            buttonRef.current,
            {
              type: "standard",

              theme: "outline",

              size: "large",

              text: "continue_with",

              shape: "rectangular",

              logo_alignment: "left",

              use_fedcm_for_button:
                true,

              width: "100%",
            }
          );

          if (!cancelled) {
            setReady(true);
            setError(null);
          }
        } catch (renderError) {
          console.error(
            "Google Sign-In initialization failed:",
            renderError
          );

          if (!cancelled) {
            setError(
              "Unable to load Google Sign-In."
            );
          }
        }
      };

    /*
     * ==========================================================
     * GOOGLE SCRIPT ALREADY LOADED
     * ==========================================================
     */

    if (
      typeof window !==
        "undefined" &&
      window.google
    ) {
      renderGoogleButton();

      return () => {
        cancelled = true;
      };
    }

    /*
     * ==========================================================
     * WAIT FOR GIS SCRIPT
     * ==========================================================
     *
     * The script is loaded in app/layout.tsx:
     *
     * https://accounts.google.com/gsi/client
     */

    let attempts = 0;

    const interval =
      window.setInterval(() => {
        attempts += 1;

        if (window.google) {
          window.clearInterval(
            interval
          );

          renderGoogleButton();

          return;
        }

        /*
         * Stop after 10 seconds.
         */
        if (attempts >= 100) {
          window.clearInterval(
            interval
          );

          if (!cancelled) {
            setError(
              "Google Sign-In could not be loaded."
            );
          }
        }
      }, 100);

    return () => {
      cancelled = true;

      window.clearInterval(
        interval
      );
    };
  }, [googleAuth]);

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: 48,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          border: "1px solid",
          borderColor: "divider",

          borderRadius: 3,

          px: 2,
        }}
      >
        <Typography
          variant="body2"
          color="error"
          sx={{
            textAlign: "center",
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  /* ============================================================
     BUTTON
  ============================================================ */

  return (
    <Box
      sx={{
        width: "100%",

        minHeight: 48,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        "& > div": {
          width: "100%",
          display: "flex",
          justifyContent: "center",
        },
      }}
    >
      {!ready && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            color: "text.secondary",
          }}
        >
          <CircularProgress
            size={18}
          />

          <Typography
            variant="body2"
          >
            Loading Google Sign-In...
          </Typography>
        </Stack>
      )}

      <Box
        ref={buttonRef}
        sx={{
          display: ready
            ? "flex"
            : "none",

          width: "100%",

          justifyContent:
            "center",
        }}
      />
    </Box>
  );
}