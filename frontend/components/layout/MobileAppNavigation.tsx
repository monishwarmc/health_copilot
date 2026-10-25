"use client";

import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "Home", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Food", path: "/nutrition", icon: <RestaurantOutlinedIcon /> },
  { label: "Weight", path: "/weight", icon: <MonitorWeightOutlinedIcon /> },
  { label: "Copilot", path: "/chat", icon: <ChatOutlinedIcon /> },
];

export default function MobileAppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const active = items.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

  return (
    <Paper
      component="nav"
      aria-label="App navigation"
      elevation={12}
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        zIndex: (theme) => theme.zIndex.appBar,
        insetInline: 0,
        bottom: 0,
        pb: "env(safe-area-inset-bottom)",
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        showLabels
        value={active?.path ?? false}
        onChange={(_, value: string) => router.push(value)}
        sx={{ height: 64, bgcolor: "transparent" }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            value={item.path}
            label={item.label}
            icon={item.icon}
            sx={{ minWidth: 0, px: 0.5, fontSize: "0.68rem" }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
