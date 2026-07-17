import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { settingsService } from "../features/admin/services/settingsService";

export type ThemeMode = "Light" | "Dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProviderWrapper");
  }
  return context;
};

export const getThemeStorageKey = (): string => {
  const role = localStorage.getItem("user_role")?.replace(/^ROLE_/, "");
  const shopId = localStorage.getItem("shopId");
  const terminalId = localStorage.getItem("terminalId");
  const terminalCode = localStorage.getItem("terminalCode");

  if (role === "ADMIN") {
    return "theme_ADMIN";
  }

  if (role === "SHOP_ADMIN" || role === "SHOP_USER") {
    const terminalKey = terminalId || terminalCode || "NO_TERMINAL";
    return `theme_SHOP_${shopId}_${terminalKey}`;
  }

  return "theme_GUEST";
};

interface Props {
  children: ReactNode;
}

export const ThemeProviderWrapper: React.FC<Props> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("Light");

  // Load from localStorage or Backend on startup
  useEffect(() => {
    const initializeTheme = async () => {
      // Clean up old global theme keys
      localStorage.removeItem("theme");
      localStorage.removeItem("defaultTheme");

      const role = localStorage.getItem("user_role")?.replace(/^ROLE_/, "");
      const themeKey = getThemeStorageKey();
      const storedTheme = localStorage.getItem(themeKey) as ThemeMode | null;

      if (storedTheme) {
        applyTheme(storedTheme);
        return;
      }

      // If no stored theme, fetch from backend if logged in
      if (role === "ADMIN") {
        try {
          const prefs = await settingsService.getUserPreferences();
          applyTheme(prefs.defaultTheme as ThemeMode || "Light");
        } catch (error) {
          applyTheme("Light");
        }
      } else if (role === "SHOP_ADMIN" || role === "SHOP_USER") {
        // Only fetch if a terminal is selected
        const terminalId = localStorage.getItem("terminalId");
        if (terminalId) {
          try {
            const prefs = await settingsService.getShopUserPreferences(terminalId);
            applyTheme(prefs.defaultTheme as ThemeMode || "Light");
          } catch (error) {
            applyTheme("Light");
          }
        } else {
          applyTheme("Light"); // Default until terminal is selected
        }
      } else {
        applyTheme("Light");
      }
    };

    initializeTheme();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    setThemeModeState(mode);
    const themeKey = getThemeStorageKey();
    if (themeKey !== "theme_GUEST") {
      localStorage.setItem(themeKey, mode);
    }

    // Apply class to document body
    const normalized = mode === "Dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", normalized);
  };

  const setThemeMode = (mode: ThemeMode) => {
    applyTheme(mode);
  };

  const muiTheme = createTheme({
    palette: {
      mode: themeMode === "Dark" ? "dark" : "light",
      primary: {
        main: themeMode === "Dark" ? "#f97316" : "#e5261f",
      },
      secondary: {
        main: themeMode === "Dark" ? "#ef4444" : "#ff6b00",
      },
      background: {
        default: themeMode === "Dark" ? "#111827" : "#fff7ed",
        paper: themeMode === "Dark" ? "#1f2937" : "#ffffff",
      },
      text: {
        primary: themeMode === "Dark" ? "#f9fafb" : "#111827",
        secondary: themeMode === "Dark" ? "#e5e7eb" : "#4b5563",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: "var(--card-bg)",
            },
            "& .MuiInputBase-input": {
              color: "var(--text-primary)",
            },
            "& .MuiInputLabel-root": {
              color: "var(--text-secondary)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--border-color)",
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            backgroundColor: "var(--card-bg)",
            color: "var(--text-primary)",
          },
          icon: {
            color: "var(--text-primary)",
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: "var(--text-primary)",
          }
        }
      }
    }
  });

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
