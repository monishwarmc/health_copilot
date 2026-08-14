"use client";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

import Logo from "../ui/Logo";

import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "../ui/ThemeProvider";

import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const { user } = useAuth();

  const { mode, toggleTheme } =
    useThemeMode();

  const firstLetter =
    user?.full_name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: "1px solid",
        borderColor:
          mode === "light"
            ? "rgba(33, 150, 243, 0.10)"
            : "rgba(255, 255, 255, 0.07)",

        bgcolor:
          mode === "light"
            ? "rgba(255, 255, 255, 0.88)"
            : "rgba(8, 13, 24, 0.88)",

        color: "text.primary",

        backdropFilter:
          "blur(18px)",

        WebkitBackdropFilter:
          "blur(18px)",

        zIndex: (theme) =>
          theme.zIndex.drawer + 1,

        transition:
          "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: 64,
            sm: 72,
          },

          px: {
            xs: 1.5,
            sm: 3,
          },

          gap: 1.5,
        }}
      >
        {/* Mobile menu */}
        <IconButton
          onClick={onMenuClick}
          aria-label="Open navigation"
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },

            width: 42,
            height: 42,

            borderRadius: 2.5,

            color: "text.secondary",

            "&:hover": {
              bgcolor:
                "action.hover",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            flex: 1,

            minWidth: 0,
          }}
        >
          <Logo />
        </Box>

        {/* Theme toggle */}
        <IconButton
          onClick={toggleTheme}
          aria-label={
            mode === "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
          sx={{
            width: 42,
            height: 42,

            borderRadius: 2.5,

            color:
              mode === "light"
                ? "text.secondary"
                : "warning.main",

            bgcolor:
              mode === "light"
                ? "rgba(33, 150, 243, 0.05)"
                : "rgba(255, 193, 7, 0.08)",

            border: "1px solid",

            borderColor:
              mode === "light"
                ? "rgba(33, 150, 243, 0.10)"
                : "rgba(255, 193, 7, 0.15)",

            transition:
              "all 0.25s ease",

            "&:hover": {
              bgcolor:
                mode === "light"
                  ? "rgba(33, 150, 243, 0.10)"
                  : "rgba(255, 193, 7, 0.14)",

              transform:
                "rotate(10deg) scale(1.05)",

              boxShadow:
                mode === "light"
                  ? "0 0 18px rgba(33, 150, 243, 0.15)"
                  : "0 0 18px rgba(255, 193, 7, 0.18)",
            },
          }}
        >
          {mode === "light" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Profile */}
        <Link
          href="/profile"
          style={{
            textDecoration: "none",
          }}
        >
          <Avatar
            sx={{
              width: {
                xs: 38,
                sm: 42,
              },

              height: {
                xs: 38,
                sm: 42,
              },

              bgcolor:
                "primary.main",

              color:
                "primary.contrastText",

              fontSize: {
                xs: "0.9rem",
                sm: "1rem",
              },

              fontWeight: 700,

              overflow: "hidden",

              border: "2px solid",

              borderColor:
                mode === "light"
                  ? "rgba(33, 150, 243, 0.15)"
                  : "rgba(33, 150, 243, 0.30)",

              boxShadow:
                mode === "light"
                  ? "0 4px 14px rgba(33, 150, 243, 0.15)"
                  : "0 0 16px rgba(33, 150, 243, 0.20)",

              transition:
                "all 0.25s ease",

              "&:hover": {
                transform:
                  "scale(1.05)",

                boxShadow:
                  "0 0 22px rgba(33, 150, 243, 0.35)",
              },
            }}
          >
            {user?.profile_picture ? (
              <Image
                src={user.profile_picture}
                alt="Profile picture"
                width={42}
                height={42}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              firstLetter
            )}
          </Avatar>
        </Link>
      </Toolbar>
    </AppBar>
  );
}