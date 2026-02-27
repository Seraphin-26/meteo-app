// lib/darkMode.ts
// Palettes de couleurs centralisées pour light / dark mode.
// Utilisées dans WeatherShell et WeatherCard via props.

export interface Palette {
  // Page
  pageBg:       string;
  // Header
  headerBg:     string;
  headerBorder: string;
  // Textes
  textPrimary:  string;
  textSecondary:string;
  textMuted:    string;
  // Cartes / surfaces
  cardBg:       string;
  cardBorder:   string;
  cardShadow:   string;
  surfaceBg:    string;   // fond des pills, sections internes
  surfaceBorder:string;
  // Input
  inputBg:      string;
  inputBorder:  string;
  // Séparateur
  divider:      string;
  // Skeleton
  skBase:       string;
  skShine:      string;
  // Toggle bouton
  toggleBg:     string;
  toggleBorder: string;
  toggleIcon:   string;
}

export const LIGHT: Palette = {
  pageBg:        "#f8fafc",
  headerBg:      "rgba(255,255,255,0.90)",
  headerBorder:  "#f1f5f9",
  textPrimary:   "#0f172a",
  textSecondary: "#475569",
  textMuted:     "#94a3b8",
  cardBg:        "#ffffff",
  cardBorder:    "#f1f5f9",
  cardShadow:    "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  surfaceBg:     "#f8fafc",
  surfaceBorder: "#f1f5f9",
  inputBg:       "#ffffff",
  inputBorder:   "#e2e8f0",
  divider:       "#f8fafc",
  skBase:        "#f1f5f9",
  skShine:       "#e2e8f0",
  toggleBg:      "#f1f5f9",
  toggleBorder:  "#e2e8f0",
  toggleIcon:    "#64748b",
};

export const DARK: Palette = {
  pageBg:        "#0b0f19",
  headerBg:      "rgba(15,20,32,0.92)",
  headerBorder:  "#1e2535",
  textPrimary:   "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted:     "#475569",
  cardBg:        "#111827",
  cardBorder:    "#1e2535",
  cardShadow:    "0 2px 24px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.30)",
  surfaceBg:     "#0f172a",
  surfaceBorder: "#1e2535",
  inputBg:       "#111827",
  inputBorder:   "#1e2535",
  divider:       "#0f172a",
  skBase:        "#1e2535",
  skShine:       "#263347",
  toggleBg:      "#1e2535",
  toggleBorder:  "#263347",
  toggleIcon:    "#94a3b8",
};
