"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createTheme,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext =
  createContext<ThemeModeContextValue>({
    mode: "light",
    toggleTheme: () => {},
  });

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [mode, setMode] =
    useState<ThemeMode>("light");

  /*
   * Load saved theme after the component mounts.
   */
  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "health-copilot-theme"
      );

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      setMode(savedTheme);
      return;
    }

    /*
     * If there is no saved preference,
     * use the operating system preference.
     */
    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    setMode(
      prefersDark ? "dark" : "light"
    );
  }, []);

  /*
   * Create the MUI theme.
   */
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,

          primary: {
            main: "#2196F3",
          },

          secondary: {
            main: "#00BCD4",
          },

          success: {
            main: "#22C55E",
          },

          warning: {
            main: "#F59E0B",
          },

          error: {
            main: "#EF4444",
          },

          background:
            mode === "light"
              ? {
                  default: "#F6F9FC",
                  paper: "#FFFFFF",
                }
              : {
                  default: "#080D18",
                  paper: "#101827",
                },

          text:
            mode === "light"
              ? {
                  primary: "#172033",
                  secondary: "#64748B",
                }
              : {
                  primary: "#F1F5F9",
                  secondary: "#94A3B8",
                },

          divider:
            mode === "light"
              ? "rgba(15, 23, 42, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
        },

        shape: {
          borderRadius: 14,
        },

        typography: {
          fontFamily:
            "var(--font-geist-sans), Arial, sans-serif",

          h1: {
            fontWeight: 800,
          },

          h2: {
            fontWeight: 800,
          },

          h3: {
            fontWeight: 800,
          },

          h4: {
            fontWeight: 800,
          },

          h5: {
            fontWeight: 750,
          },

          h6: {
            fontWeight: 700,
          },

          button: {
            fontWeight: 700,
            textTransform: "none",
          },
        },

        components: {
          /*
           * GLOBAL
           */
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                scrollBehavior: "smooth",
              },

              body: {
                margin: 0,

                backgroundColor:
                  mode === "light"
                    ? "#F6F9FC"
                    : "#080D18",

                color:
                  mode === "light"
                    ? "#172033"
                    : "#F1F5F9",

                transition:
                  "background-color 0.3s ease, color 0.3s ease",
              },

              "*": {
                boxSizing: "border-box",
              },

              "*::-webkit-scrollbar": {
                width: 7,
                height: 7,
              },

              "*::-webkit-scrollbar-track": {
                background:
                  mode === "light"
                    ? "#F1F5F9"
                    : "#0B1220",
              },

              "*::-webkit-scrollbar-thumb": {
                background:
                  mode === "light"
                    ? "#CBD5E1"
                    : "#334155",

                borderRadius: 10,
              },

              "*::-webkit-scrollbar-thumb:hover": {
                background:
                  mode === "light"
                    ? "#94A3B8"
                    : "#475569",
              },

              "::selection": {
                backgroundColor:
                  mode === "light"
                    ? "rgba(33, 150, 243, 0.20)"
                    : "rgba(33, 150, 243, 0.35)",
              },
            },
          },

          /*
           * CARDS
           */
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",

                border:
                  mode === "light"
                    ? "1px solid rgba(33, 150, 243, 0.08)"
                    : "1px solid rgba(255, 255, 255, 0.07)",

                boxShadow:
                  mode === "light"
                    ? "0 8px 30px rgba(15, 23, 42, 0.045)"
                    : "0 8px 30px rgba(0, 0, 0, 0.25)",

                transition:
                  "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              },
            },
          },

          /*
           * BUTTONS
           *
           * IMPORTANT:
           * MUI v7 does not accept `containedPrimary`
           * as an override key.
           */
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 11,

                textTransform: "none",

                fontWeight: 700,

                transition:
                  "all 0.25s ease",
              },

              contained: {
                "&.MuiButton-containedPrimary": {
                  boxShadow:
                    "0 6px 18px rgba(33, 150, 243, 0.22)",

                  "&:hover": {
                    boxShadow:
                      "0 8px 26px rgba(33, 150, 243, 0.32)",

                    transform:
                      "translateY(-1px)",
                  },
                },
              },
            },
          },

          /*
           * TEXT FIELDS
           */
          MuiTextField: {
            defaultProps: {
              variant: "outlined",
            },
          },

          /*
           * OUTLINED INPUT
           */
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,

                transition:
                  "box-shadow 0.25s ease, border-color 0.25s ease",

                "&:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor:
                      mode === "light"
                        ? "rgba(33, 150, 243, 0.40)"
                        : "rgba(33, 150, 243, 0.60)",
                  },

                "&.Mui-focused": {
                  boxShadow:
                    "0 0 0 3px rgba(33, 150, 243, 0.10)",
                },
              },
            },
          },

          /*
           * INPUT LABEL
           */
          MuiInputLabel: {
            styleOverrides: {
              root: {
                "&.Mui-focused": {
                  color: "primary.main",
                },
              },
            },
          },

          /*
           * CHIPS
           */
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },

          /*
           * DIALOG
           */
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 18,

                border:
                  mode === "light"
                    ? "1px solid rgba(33, 150, 243, 0.10)"
                    : "1px solid rgba(255, 255, 255, 0.08)",

                boxShadow:
                  mode === "light"
                    ? "0 24px 70px rgba(15, 23, 42, 0.16)"
                    : "0 24px 70px rgba(0, 0, 0, 0.55)",
              },
            },
          },

          /*
           * APP BAR
           */
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",

                backdropFilter:
                  "blur(16px)",

                WebkitBackdropFilter:
                  "blur(16px)",
              },
            },
          },

          /*
           * DRAWER
           */
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",

                backgroundColor:
                  mode === "light"
                    ? "#FFFFFF"
                    : "#0E1625",
              },
            },
          },

          /*
           * DIVIDER
           */
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor:
                  mode === "light"
                    ? "rgba(15, 23, 42, 0.08)"
                    : "rgba(255, 255, 255, 0.08)",
              },
            },
          },
        },
      }),
    [mode]
  );

  /*
   * Toggle between light and dark.
   */
  const toggleTheme = () => {
    setMode((current) => {
      const next: ThemeMode =
        current === "light"
          ? "dark"
          : "light";

      localStorage.setItem(
        "health-copilot-theme",
        next
      );

      return next;
    });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />

      <ThemeModeContext.Provider
        value={{
          mode,
          toggleTheme,
        }}
      >
        {children}
      </ThemeModeContext.Provider>
    </MuiThemeProvider>
  );
}

/*
 * Use this hook anywhere in the application.
 */
export function useThemeMode() {
  return useContext(
    ThemeModeContext
  );
}