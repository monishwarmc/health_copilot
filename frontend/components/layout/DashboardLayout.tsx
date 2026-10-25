"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CopilotLauncher from "@/components/chat/CopilotLauncher";
import MobileAppNavigation from "./MobileAppNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateStandalone = () => {
      setStandalone(
        displayMode.matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone === true,
      );
    };

    updateStandalone();
    displayMode.addEventListener("change", updateStandalone);
    return () => displayMode.removeEventListener("change", updateStandalone);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Fixed top navbar */}
      <Navbar
        onMenuClick={() => setMobileOpen(true)}
      />

      {/* Space reserved for fixed navbar */}
      <Box
        sx={{
          height: {
            xs: 64,
            sm: 72,
          },
        }}
      />

      {/* Main application area */}
      <Box
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 72px)",
        }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",

            px: {
              xs: 1.5,
              sm: 3,
              md: 4,
            },

            py: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            pb: standalone
              ? { xs: "calc(80px + env(safe-area-inset-bottom))", md: 4 }
              : undefined,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 1400,
              mx: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
      <CopilotLauncher />
      {standalone && <MobileAppNavigation />}
    </Box>
  );
}
