"use client";

import Image from "next/image";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConstructionIcon from "@mui/icons-material/Construction";


interface UnderConstructionProps {
  page?: string;
}

export default function UnderConstruction({
  page = "This",
}: UnderConstructionProps) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",

        background:
          "radial-gradient(circle at 50% 20%, rgba(25,118,210,0.12), transparent 35%)," +
          "radial-gradient(circle at 80% 80%, rgba(156,39,176,0.08), transparent 30%)," +
          "background.default",
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          width: {
            xs: 180,
            sm: 260,
            md: 340,
          },
          height: {
            xs: 180,
            sm: 260,
            md: 340,
          },
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "divider",
          top: {
            xs: -90,
            md: -140,
          },
          right: {
            xs: -90,
            md: -140,
          },
          opacity: 0.5,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: {
            xs: 140,
            sm: 220,
            md: 280,
          },
          height: {
            xs: 140,
            sm: 220,
            md: 280,
          },
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "divider",
          bottom: {
            xs: -70,
            md: -100,
          },
          left: {
            xs: -70,
            md: -100,
          },
          opacity: 0.4,
        }}
      />

      {/* Main */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: {
            xs: 2,
            sm: 4,
            md: 6,
          },
          py: {
            xs: 5,
            sm: 6,
            md: 8,
          },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          spacing={{
            xs: 3,
            sm: 4,
          }}
          sx={{
            width: "100%",
            maxWidth: 620,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Illustration */}
          <Box
            sx={{
              width: {
                xs: 190,
                sm: 240,
                md: 280,
              },
              height: {
                xs: 150,
                sm: 190,
                md: 220,
              },
              position: "relative",
            }}
          >
            <Image
              src="/assets/Under-construction.png"
              alt="Page under construction"
              fill
              sizes="(max-width: 600px) 190px, (max-width: 900px) 240px, 280px"
              style={{
                objectFit: "contain",
              }}
              priority
            />
          </Box>

          {/* Status badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <ConstructionIcon
              sx={{
                fontSize: 18,
                color: "primary.main",
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "text.secondary",
              }}
            >
              WORK IN PROGRESS
            </Typography>
          </Box>

          {/* Title */}
          <Stack spacing={1}>
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: "1.75rem",
                  sm: "2.25rem",
                  md: "2.75rem",
                },
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {page}
            </Typography>

            <Typography
              component="span"
              sx={{
                display: "block",
                fontSize: {
                  xs: "1.5rem",
                  sm: "2rem",
                  md: "2.4rem",
                },
                lineHeight: 1.15,
                fontWeight: 800,
                color: "primary.main",
                letterSpacing: "-0.03em",
              }}
            >
              is coming soon.
            </Typography>
          </Stack>

          {/* Description */}
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 520,
              fontSize: {
                xs: "0.95rem",
                sm: "1rem",
                md: "1.05rem",
              },
              lineHeight: 1.7,
            }}
          >
            We&apos;re building this part of Health Copilot to give you a
            better experience. It&apos;s currently under development and
            will be available soon.
          </Typography>

          {/* Actions */}
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              pt: 1,
            }}
          >
            <Button
              href="/dashboard"
              variant="contained"
              size="large"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 180,
                },
                borderRadius: 2.5,
                px: 3,
                py: 1.25,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",

                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Go to Dashboard
            </Button>

            <Button
              href="/dashboard"
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 150,
                },
                borderRadius: 2.5,
                px: 3,
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Go Back
            </Button>
          </Stack>

          {/* Small footer message */}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              pt: 1,
            }}
          >
            Health Copilot • More features coming soon
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}