"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import LoginIcon from "@mui/icons-material/Login";

import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const { verifyEmail } = useAuth();

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await verifyEmail(token);

        setSuccess(true);
        setMessage(response);
      } catch {
        setSuccess(false);
        setMessage(
          "Verification failed. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
        }}
      >
        <Stack 
        spacing={3} 
        sx={{
            alignItems:"center"
        }}
        >
          {loading ? (
            <>
              <CircularProgress />

              <Typography
                variant="h5"
                sx={{
                    fontWeight:600
                }}
              >
                Verifying...
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                    textAlign: "center"
                }}
              >
                Please wait while we verify your email.
              </Typography>
            </>
          ) : success ? (
            <>
              <CheckCircleIcon
                color="success"
                sx={{ fontSize: 70 }}
              />

              <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    fontWeight: 700
                }}
              >
                Email Verified
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                    textAlign: "center"
                }}
              >
                {message}
              </Typography>

              <Button
                component={Link}
                href="/login"
                variant="contained"
                startIcon={<LoginIcon />}
                fullWidth
              >
                Continue to Login
              </Button>
            </>
          ) : (
            <>
              <ErrorIcon
                color="error"
                sx={{ fontSize: 70 }}
              />

              <Typography
                variant="h4"
                sx={{
                    textAlign:"center",
                    fontWeight:700
                }}
              >
                Verification Failed
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                    textAlign: "center"
                }}
              >
                {message}
              </Typography>

              <Button
                component={Link}
                href="/login"
                variant="contained"
                fullWidth
              >
                Back to Login
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}