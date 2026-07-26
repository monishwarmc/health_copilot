"use client";

import Link from "next/link";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import LoginIcon from "@mui/icons-material/Login";

export default function CheckEmailPage() {
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
        <Stack spacing={3} 
        sx={{
          alignItems: "center"
        }}
        >
          <MarkEmailReadIcon
            color="primary"
            sx={{ fontSize: 70 }}
          />

          <Typography
            variant="h4"
            sx={{
              textAlign:"center",
              fontWeight:700
            }}
          >
            Check Your Email
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign:"center"
            }}
          >
            Your account has been created successfully.
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign:"center"
            }}
          >
            We've sent a verification email to your inbox.
            <br />
            Please click the verification link before logging in.
          </Typography>

          <Button
            component={Link}
            href="/login"
            variant="contained"
            startIcon={<LoginIcon />}
            fullWidth
          >
            Go to Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}