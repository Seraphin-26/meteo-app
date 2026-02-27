"use client";

import { useState, useCallback } from "react";
import { getWeatherTheme, WeatherTheme } from "@/lib/weatherUtils";
import { LIGHT, DARK } from "@/lib/darkMode";
import WeatherCard from "@/components/WeatherCard";
import { Sun, Moon } from "lucide-react";

interface Props {
  initialGradient: string;
  initialBlobTop: string;
  initialBlobBottom: string;
  initialAdvice: string;
  initialIconName: string;
  initialLabel: string;
  isDemo: boolean;
}

export default function WeatherShell({
  initialGradient, initialBlobTop, initialBlobBottom,
  initialAdvice, initialLabel, isDemo,
}: Props) {
  const [theme, setTheme] = useState<WeatherTheme>({
    gradient: initialGradient,
    blobTopColor: initialBlobTop,
    blobBottomColor: initialBlobBottom,
    advice: initialAdvice,
    Icon: getWeatherTheme(800).Icon,
    label: initialLabel,
  });

  const [isDark, setIsDark] = useState(false);
  const p = isDark ? DARK : LIGHT;
  const accent = theme.blobTopColor;

  const toggleDark = useCallback(() => setIsDark(d => !d), []);

  return (
    <div
      className="theme-transition"
      style={{
        minHeight: "100vh",
        backgroundColor: p.pageBg,
        fontFamily: "'Outfit', sans-serif",
      }}
    >

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: p.headerBg,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${p.headerBorder}`,
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `linear-gradient(135deg, ${accent}, ${theme.blobBottomColor})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: `0 2px 10px ${accent}50`,
              transition: "background 1s ease, box-shadow 1s ease",
            }}>☁</div>
            <span style={{ fontWeight: 600, fontSize: 15, color: p.textPrimary, letterSpacing: "-0.02em" }}>
              Météo
            </span>
          </div>

          {/* Droite : badge + toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Badge statut */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 99,
              backgroundColor: isDemo
                ? (isDark ? "#422006" : "#fef9c3")
                : (isDark ? "#052e16" : "#f0fdf4"),
              border: `1px solid ${isDemo
                ? (isDark ? "#854d0e" : "#fde047")
                : (isDark ? "#14532d" : "#86efac")}`,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: isDemo ? "#ca8a04" : "#22c55e",
                animation: "pulse 2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: isDemo
                  ? (isDark ? "#fbbf24" : "#92400e")
                  : (isDark ? "#4ade80" : "#166534"),
              }}>
                {isDemo ? "Mode démo" : "Live"}
              </span>
            </div>

            {/* Toggle dark mode */}
            <button
              onClick={toggleDark}
              title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              aria-label={isDark ? "Mode clair" : "Mode sombre"}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px 6px 8px", borderRadius: 99,
                backgroundColor: p.toggleBg,
                border: `1px solid ${p.toggleBorder}`,
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {/* Track */}
              <div style={{
                width: 36, height: 20, borderRadius: 99,
                backgroundColor: isDark ? accent : "#e2e8f0",
                position: "relative",
                transition: "background-color 0.3s ease",
                flexShrink: 0,
              }}>
                {/* Thumb */}
                <div style={{
                  position: "absolute",
                  top: 2, left: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  transform: isDark ? "translateX(16px)" : "translateX(0)",
                  transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDark
                    ? <Moon size={9} style={{ color: "#6366f1" }} />
                    : <Sun  size={9} style={{ color: "#f59e0b" }} />}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: p.textSecondary }}>
                {isDark ? "Sombre" : "Clair"}
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* Barre accent météo */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accent}, ${theme.blobBottomColor})`,
        transition: "background 1.2s ease",
      }} />

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* Titre */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: 6,
            color: accent, transition: "color 1s ease",
          }}>
            Météo en temps réel
          </p>
          <h1 style={{
            fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
            fontWeight: 300, color: p.textPrimary,
            letterSpacing: "-0.04em", lineHeight: 1.1,
          }}>
            Quel temps fait-il ?
          </h1>
        </div>

        {/* Carte météo */}
        <WeatherCard onThemeChange={setTheme} accentColor={accent} isDark={isDark} />

      </main>
    </div>
  );
}
