"use client";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import MonitorWeightOutlinedIcon from "@mui/icons-material/MonitorWeightOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import PersonIcon from "@mui/icons-material/Person";

import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const drawerWidth = 250;

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: "Nutrition",
    path: "/nutrition",
    icon: <RestaurantOutlinedIcon />,
  },
  {
    label: "Weight",
    path: "/weight",
    icon: <MonitorWeightOutlinedIcon />,
  },
  {
    label: "Workout",
    path: "/workout",
    icon: <FitnessCenterOutlinedIcon />,
  },
  {
    label: "AI Chat",
    path: "/chat",
    icon: <ChatOutlinedIcon />,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <PersonIcon />,
  },
];

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onMobileClose?.();
  };

  const navigation = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",

        bgcolor: "background.paper",

        backgroundImage:
          "linear-gradient(180deg, rgba(33,150,243,0.025) 0%, transparent 35%)",
      }}
    >
      <List
        sx={{
          px: 1.5,
          py: 2,
        }}
      >
        {navigationItems.map((item) => {
          const active =
            pathname === item.path ||
            pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => handleNavigation(item.path)}
              sx={{
                position: "relative",

                minHeight: 50,

                mb: 0.75,

                px: 1.5,

                borderRadius: 2.5,

                overflow: "hidden",

                color: active
                  ? "primary.main"
                  : "text.secondary",

                transition:
                  "all 0.2s ease",

                "& .MuiListItemIcon-root": {
                  minWidth: 42,

                  color: active
                    ? "primary.main"
                    : "text.secondary",

                  transition:
                    "all 0.2s ease",
                },

                "& .MuiListItemText-primary": {
                  fontSize: "0.94rem",

                  fontWeight: active
                    ? 700
                    : 500,

                  transition:
                    "all 0.2s ease",
                },

                "&.Mui-selected": {
                  bgcolor:
                    "rgba(33, 150, 243, 0.09)",

                  boxShadow:
                    "inset 0 0 20px rgba(33,150,243,0.035)",
                },

                "&.Mui-selected:hover": {
                  bgcolor:
                    "rgba(33, 150, 243, 0.13)",
                },

                "&:hover": {
                  bgcolor:
                    "action.hover",

                  transform:
                    "translateX(2px)",
                },

                "&::before": active
                  ? {
                      content: '""',

                      position: "absolute",

                      left: 0,

                      top: "20%",

                      width: 3,

                      height: "60%",

                      borderRadius:
                        "0 4px 4px 0",

                      bgcolor:
                        "primary.main",

                      boxShadow:
                        "0 0 12px rgba(33,150,243,0.65)",
                    }
                  : {},
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: drawerWidth,

          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,

            boxSizing: "border-box",

            borderRight: "1px solid",

            borderColor: "divider",

            /* Fixed navbar offset */
            top: {
              xs: 64,
              sm: 72,
            },

            height: {
              xs: "calc(100% - 64px)",
              sm: "calc(100% - 72px)",
            },

            bgcolor: "background.paper",

            backgroundImage:
              "linear-gradient(180deg, rgba(33,150,243,0.025) 0%, transparent 35%)",

            overflowX: "hidden",
          },
        }}
      >
        {navigation}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,

            boxSizing: "border-box",

            top: {
              xs: 64,
              sm: 72,
            },

            height: {
              xs: "calc(100% - 64px)",
              sm: "calc(100% - 72px)",
            },

            bgcolor: "background.paper",

            backgroundImage:
              "linear-gradient(180deg, rgba(33,150,243,0.025) 0%, transparent 35%)",

            borderRight: "1px solid",

            borderColor: "divider",
          },
        }}
      >
        {navigation}
      </Drawer>
    </>
  );
}