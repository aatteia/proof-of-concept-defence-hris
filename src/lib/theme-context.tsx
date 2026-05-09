"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Theme =
  | "snow"
  | "slate"
  | "navy"
  | "high-contrast"
  | "eucalyptus";

export interface ThemeDefinition {
  id: Theme;
  label: string;
  description: string;
  /** Approximate hex colours for the preview swatch — sidebar | bg | primary */
  preview: { sidebar: string; bg: string; primary: string };
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "snow",
    label: "Snow",
    description: "Clean light mode with blue-grey surfaces. The MAMS default.",
    preview: { sidebar: "#ffffff", bg: "#f8fafc", primary: "#3b82f6" },
  },
  {
    id: "slate",
    label: "Slate",
    description: "Dark mode with deep blue-grey backgrounds and blue accents.",
    preview: { sidebar: "#1c2030", bg: "#171b27", primary: "#3b82f6" },
  },
  {
    id: "navy",
    label: "Navy",
    description: "Deep navy sidebar against a crisp light surface.",
    preview: { sidebar: "#1a2745", bg: "#f5f7fb", primary: "#1e3a8a" },
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    description: "WCAG AAA-ready. Pure white and near-black with strong borders.",
    preview: { sidebar: "#f0f0f0", bg: "#ffffff", primary: "#1e3a8a" },
  },
  {
    id: "eucalyptus",
    label: "Eucalyptus",
    description: "Warm olive-green tones inspired by Australian Defence.",
    preview: { sidebar: "#263326", bg: "#f2f5f2", primary: "#4a7c59" },
  },
];

// ── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  /** The currently applied theme (resolved from system preference or manual selection). */
  theme: Theme;
  /** The user's manually selected theme (used to highlight the active tile). */
  selectedTheme: Theme;
  setTheme: (t: Theme) => void;
  followSystem: boolean;
  setFollowSystem: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_THEME = "mams-theme";
const STORAGE_KEY_FOLLOW = "mams-follow-system";

function resolveSystemTheme(): Theme {
  if (typeof window === "undefined") return "snow";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "slate"
    : "snow";
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("snow");
  const [followSystem, setFollowSystemState] = useState(false);
  const [systemTheme, setSystemTheme] = useState<Theme>("snow");

  // The theme actually applied to the document.
  const theme: Theme = followSystem ? systemTheme : selectedTheme;

  // On mount: restore persisted preferences and detect system theme.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
    const storedFollow = localStorage.getItem(STORAGE_KEY_FOLLOW);
    if (stored) setSelectedTheme(stored);
    if (storedFollow === "true") setFollowSystemState(true);
    setSystemTheme(resolveSystemTheme());
  }, []);

  // Keep the system theme in sync when the OS preference changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () =>
      setSystemTheme(mq.matches ? "slate" : "snow");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Apply the resolved theme to <html data-theme="...">
  useEffect(() => {
    if (theme === "snow") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setSelectedTheme(t);
    localStorage.setItem(STORAGE_KEY_THEME, t);
  }, []);

  const setFollowSystem = useCallback((v: boolean) => {
    setFollowSystemState(v);
    localStorage.setItem(STORAGE_KEY_FOLLOW, String(v));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, selectedTheme, setTheme, followSystem, setFollowSystem }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
