"use client";

import { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { WeatherData } from "@/types/weather";
import { getWeatherTheme, WeatherTheme } from "@/lib/weatherUtils";
import { LIGHT, DARK, Palette } from "@/lib/darkMode";
import {
  MapPin, Search, RefreshCw, Wind, Droplets,
  Eye, Gauge, Thermometer, WifiOff, LocateOff, X, ArrowRight,
} from "lucide-react";

type LoadingPhase = "locating" | "fetching" | null;
type ErrorType = "geo_denied" | "geo_unavailable" | "city_not_found" | "network" | "unknown" | null;

interface WeatherState {
  data: WeatherData | null;
  loadingPhase: LoadingPhase;
  errorType: ErrorType;
  errorMessage: string | null;
}

const WIND_DIRS = ["N","NE","E","SE","S","SO","O","NO"] as const;

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, accent, p }: {
  label: string; value: string; Icon: React.ElementType; accent: string; p: Palette;
}) {
  return (
    <div style={{
      backgroundColor: p.surfaceBg, borderRadius: 16,
      border: `1px solid ${p.surfaceBorder}`,
      padding: "12px 8px",
      display: "flex", flexDirection: "column" as const,
      alignItems: "center", gap: 6, flex: 1,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10,
        backgroundColor: `${accent}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={14} style={{ color: accent }} strokeWidth={2} />
      </div>
      <span style={{
        fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const,
        letterSpacing: "0.08em", color: p.textMuted, lineHeight: 1,
      }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: p.textPrimary }}>{value}</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ phase, isDark }: { phase: LoadingPhase; isDark: boolean }) {
  const p = isDark ? DARK : LIGHT;
  const sk = isDark ? "sk-dark" : "sk-light";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className={sk} style={{ height: 52, borderRadius: 16 }} />
      <div style={{
        backgroundColor: p.cardBg, borderRadius: 24,
        border: `1px solid ${p.cardBorder}`,
        boxShadow: p.cardShadow, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            border: `2px solid ${p.surfaceBorder}`,
            borderTopColor: p.textMuted,
            animation: "spinAnim 0.8s linear infinite",
          }} />
          <span style={{ fontSize: 11, color: p.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            {phase === "locating" ? "Détection position…" : "Chargement données…"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div className={sk} style={{ width: 140, height: 22 }} />
            <div className={sk} style={{ width: 90, height: 12, opacity: 0.6 }} />
          </div>
          <div className={sk} style={{ width: 70, height: 70, borderRadius: "50%" }} />
        </div>
        <div className={sk} style={{ width: 110, height: 64, marginBottom: 8 }} />
        <div className={sk} style={{ width: 160, height: 12, opacity: 0.5, marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className={sk} style={{ height: 76, animationDelay: `${i*80}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────
function ErrorBanner({ errorType, message, onRetry, onDismiss, isDark }: {
  errorType: ErrorType; message: string;
  onRetry: () => void; onDismiss: () => void; isDark: boolean;
}) {
  const isCity = errorType === "city_not_found";
  const isGeo  = errorType === "geo_denied" || errorType === "geo_unavailable";
  const Icon   = isCity ? Search : isGeo ? LocateOff : WifiOff;

  const bg     = isCity
    ? (isDark ? "#422006"  : "#fffbeb")
    : (isDark ? "#450a0a"  : "#fef2f2");
  const border = isCity
    ? (isDark ? "#854d0e"  : "#fde68a")
    : (isDark ? "#7f1d1d"  : "#fecaca");
  const iconColor = isCity ? "#f59e0b" : "#ef4444";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subColor  = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="fade-up" style={{
      borderRadius: 16, padding: "14px 16px", marginBottom: 12,
      backgroundColor: bg, border: `1px solid ${border}`,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <Icon size={15} style={{ color: iconColor, marginTop: 1, flexShrink: 0 }} strokeWidth={2} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: textColor, marginBottom: 3 }}>
          {isCity ? "Ville introuvable" : isGeo ? "Localisation refusée" : "Erreur réseau"}
        </p>
        <p style={{ fontSize: 12, color: subColor, fontWeight: 300, lineHeight: 1.5 }}>{message}</p>
        {isGeo && (
          <button onClick={onRetry} style={{
            marginTop: 8, display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 500, color: subColor,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
            <RefreshCw size={10} /> Réessayer
          </button>
        )}
      </div>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: isDark ? "#475569" : "#cbd5e1", padding: 2,
      }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
function SearchBar({ onSearch, onLocate, isLoading, currentCity, accent, p }: {
  onSearch:(c:string)=>void; onLocate:()=>void;
  isLoading:boolean; currentCity:string|null; accent:string; p: Palette;
}) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (!t || isLoading) return;
    onSearch(t); setQ(""); ref.current?.blur();
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <form onSubmit={submit}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          backgroundColor: p.inputBg, borderRadius: 16, padding: "10px 14px",
          border: `2px solid ${focused ? accent : p.inputBorder}`,
          boxShadow: focused
            ? `0 0 0 4px ${accent}18, 0 2px 12px rgba(0,0,0,0.08)`
            : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}>
          <Search size={16} strokeWidth={2} style={{
            color: focused ? accent : p.textMuted, flexShrink: 0, transition: "color 0.2s",
          }} />
          <input ref={ref} value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === "Escape" && (setQ(""), ref.current?.blur())}
            placeholder="Chercher une ville…"
            autoComplete="off" spellCheck={false}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, fontWeight: 300, color: p.textPrimary,
              fontFamily: "inherit",
            }}
          />
          {q && (
            <button type="button"
              onClick={() => { setQ(""); ref.current?.focus(); }}
              style={{ background:"none", border:"none", cursor:"pointer",
                color: p.textMuted, padding: 2, display:"flex" }}>
              <X size={14} />
            </button>
          )}
          <div style={{ width: 1, height: 18, backgroundColor: p.inputBorder }} />
          <button type="submit" disabled={!q.trim() || isLoading}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: q.trim() ? accent : p.surfaceBg,
              color: q.trim() ? "#ffffff" : p.textMuted,
              transition: "background-color 0.2s ease", flexShrink: 0,
            }}>
            {isLoading && q
              ? <RefreshCw size={13} style={{ animation:"spinAnim 0.8s linear infinite" }} />
              : <ArrowRight size={13} />}
          </button>
        </div>
      </form>

      <div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 4 }}>
        {currentCity && (
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 99,
            backgroundColor: p.surfaceBg, border: `1px solid ${p.surfaceBorder}`,
            fontSize: 11, fontWeight: 500, color: p.textSecondary,
          }}>
            <MapPin size={9} /> {currentCity}
          </span>
        )}
        <button onClick={onLocate} disabled={isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 99, cursor: "pointer",
            backgroundColor: `${accent}15`, border: `1px solid ${accent}35`,
            fontSize: 11, fontWeight: 500, color: accent, transition: "opacity 0.2s",
          }}>
          <MapPin size={9} /> Ma position
        </button>
      </div>
    </div>
  );
}

// ── WeatherCard ───────────────────────────────────────────────────────────────
interface Props {
  onThemeChange?: (t: WeatherTheme) => void;
  accentColor?: string;
  isDark?: boolean;
}

export default function WeatherCard({ onThemeChange, accentColor = "#3b82f6", isDark = false }: Props) {
  const [state, setState] = useState<WeatherState>({
    data: null, loadingPhase: "locating", errorType: null, errorMessage: null,
  });
  const [, startTransition] = useTransition();

  const p = isDark ? DARK : LIGHT;
  const isLoading = state.loadingPhase !== null;
  const theme = state.data ? getWeatherTheme(state.data.weather[0].id) : null;
  const accent = theme?.blobTopColor ?? accentColor;

  useEffect(() => { if (theme) onThemeChange?.(theme); }, [theme, onThemeChange]);

  const setLoading = (ph: LoadingPhase) =>
    setState((s: WeatherState) => ({ ...s, loadingPhase: ph, errorType: null, errorMessage: null }));
  const setError = (t: ErrorType, m: string) =>
    setState((s: WeatherState) => ({ ...s, loadingPhase: null, errorType: t, errorMessage: m }));
  const setSuccess = (d: WeatherData) =>
    setState({ data: d, loadingPhase: null, errorType: null, errorMessage: null });

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading("fetching");
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) { const b = await res.json().catch(()=>({})); throw new Error(b.error ?? `HTTP ${res.status}`); }
      setSuccess(await res.json());
    } catch(e) { setError("network", (e as Error).message || "Impossible de joindre le serveur."); }
  }, []);

  const fetchByCity = useCallback(async (city: string) => {
    startTransition(() => setLoading("fetching"));
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (res.status === 404) { setError("city_not_found", `"${city}" introuvable.`); return; }
      if (!res.ok) { const b = await res.json().catch(()=>({})); throw new Error(b.error ?? `HTTP ${res.status}`); }
      setSuccess(await res.json());
    } catch(e) { setError("network", (e as Error).message || "Erreur réseau."); }
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) { setError("geo_unavailable","Géolocalisation non supportée."); return; }
    setLoading("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchByCoords(coords.latitude, coords.longitude),
      (err) => {
        const types: Record<number,ErrorType> = { 1:"geo_denied", 2:"geo_unavailable", 3:"geo_unavailable" };
        const msgs: Record<number,string> = {
          1:"Accès refusé. Cherchez une ville dans la barre.",
          2:"Position indisponible.", 3:"Délai dépassé.",
        };
        setError(types[err.code] ?? "unknown", msgs[err.code] ?? err.message);
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, [fetchByCoords]);

  useEffect(() => { locate(); }, [locate]);

  const w = state.data;

  return (
    <div className="theme-transition" style={{ width: "100%", fontFamily: "inherit" }}>

      {isLoading && !w && <Skeleton phase={state.loadingPhase} isDark={isDark} />}

      {(!isLoading || w) && (
        <>
          <SearchBar onSearch={fetchByCity} onLocate={locate}
            isLoading={isLoading} currentCity={w?.name ?? null} accent={accent} p={p} />

          {state.errorType && state.errorMessage && (
            <ErrorBanner errorType={state.errorType} message={state.errorMessage}
              onRetry={locate} isDark={isDark}
              onDismiss={() => setState((s: WeatherState) => ({ ...s, errorType: null, errorMessage: null }))} />
          )}

          {/* Bandeau conseil */}
          {theme && (
            <div className="fade-up" style={{
              backgroundColor: p.cardBg, borderRadius: 16, padding: "12px 16px",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 10,
              borderTop:    `1px solid ${p.cardBorder}`,
              borderRight:  `1px solid ${p.cardBorder}`,
              borderBottom: `1px solid ${p.cardBorder}`,
              borderLeft:   `3px solid ${accent}`,
              boxShadow: p.cardShadow,
            }}>
              <theme.Icon size={15} style={{ color: accent, flexShrink: 0 }} strokeWidth={1.5} />
              <p style={{ fontSize: 13, color: p.textSecondary, fontWeight: 300 }}>{theme.advice}</p>
            </div>
          )}

          {/* Carte météo */}
          {w && (
            <div className="fade-up-2" style={{
              backgroundColor: p.cardBg, borderRadius: 24, overflow: "hidden",
              border: `1px solid ${p.cardBorder}`, boxShadow: p.cardShadow,
              opacity: isLoading ? 0.65 : 1, transition: "opacity 0.3s ease",
            }}>
              {/* Bande accent */}
              <div style={{
                height: 4,
                background: `linear-gradient(90deg, ${accent}, ${theme?.blobBottomColor ?? accent})`,
                transition: "background 1s ease",
              }} />

              <div style={{ padding: "24px 24px 20px" }}>

                {/* Header ville */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 20 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap: 6, marginBottom: 4 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        backgroundColor: accent,
                        boxShadow: `0 0 0 3px ${accent}30`,
                        animation: "pulse 2s ease-in-out infinite",
                      }} />
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                        textTransform: "uppercase" as const, color: accent,
                      }}>
                        {w.sys.country}
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: "clamp(1.4rem,6vw,2rem)", fontWeight: 600,
                      color: p.textPrimary, letterSpacing: "-0.03em", lineHeight: 1,
                    }}>
                      {w.name}
                    </h2>
                    <div style={{ display:"flex", alignItems:"center", gap: 4, marginTop: 4 }}>
                      <MapPin size={10} style={{ color: p.textMuted }} />
                      <span style={{ fontSize: 11, color: p.textMuted, fontWeight: 300 }}>
                        {w.coord.lat.toFixed(2)}°, {w.coord.lon.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                  <button onClick={locate} title="Rafraîchir" style={{
                    width: 36, height: 36, borderRadius: 12,
                    border: `1px solid ${p.surfaceBorder}`,
                    backgroundColor: p.surfaceBg, cursor: "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: p.textMuted, flexShrink: 0,
                  }}>
                    <RefreshCw size={14}
                      style={isLoading ? { animation:"spinAnim 0.8s linear infinite" } : {}} />
                  </button>
                </div>

                {/* Température */}
                <div style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  paddingBottom: 20, marginBottom: 20,
                  borderBottom: `1px solid ${p.divider}`,
                }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"flex-start", lineHeight: 1 }}>
                      <span style={{
                        fontSize: "clamp(4rem,18vw,6rem)", fontWeight: 200,
                        color: p.textPrimary, letterSpacing: "-0.04em",
                      }}>
                        {Math.round(w.main.temp)}
                      </span>
                      <span style={{ fontSize: "1.4rem", fontWeight: 300, color: p.textMuted, marginTop: "0.5rem" }}>
                        °C
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13, color: p.textSecondary,
                      fontWeight: 300, textTransform: "capitalize" as const, marginTop: 4,
                    }}>
                      {w.weather[0].description}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap: 5, marginTop: 6 }}>
                      <Thermometer size={11} style={{ color: p.textMuted }} />
                      <span style={{ fontSize: 11, color: p.textMuted, fontWeight: 300 }}>
                        Ressenti {Math.round(w.main.feels_like)}°
                        <span style={{ margin:"0 4px", color: p.surfaceBorder }}>·</span>
                        {Math.round(w.main.temp_min)}° / {Math.round(w.main.temp_max)}°
                      </span>
                    </div>
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${w.weather[0].icon}@4x.png`}
                    alt={w.weather[0].description}
                    style={{
                      width: 88, height: 88, flexShrink: 0,
                      filter: isDark
                        ? "drop-shadow(0 4px 16px rgba(255,255,255,0.08))"
                        : "drop-shadow(0 4px 12px rgba(0,0,0,0.10))",
                    }}
                  />
                </div>

                {/* Stats grid */}
                <div className="fade-up-3" style={{
                  display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 8, marginBottom: 16,
                }}>
                  <StatCard label="Humidité" value={`${w.main.humidity}%`}   Icon={Droplets} accent={accent} p={p} />
                  <StatCard label="Vent"     value={`${Math.round(w.wind.speed*3.6)}km/h`} Icon={Wind}    accent={accent} p={p} />
                  <StatCard label="Dir."     value={WIND_DIRS[Math.round(w.wind.deg/45)%8]} Icon={Gauge}   accent={accent} p={p} />
                  <StatCard label="Visib."   value={`${(w.visibility/1000).toFixed(0)}km`} Icon={Eye}     accent={accent} p={p} />
                </div>

                {/* Pression */}
                <div className="fade-up-4" style={{
                  backgroundColor: p.surfaceBg, borderRadius: 16,
                  padding: "14px 16px", marginBottom: 12,
                  border: `1px solid ${p.surfaceBorder}`,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
                      <Gauge size={12} style={{ color: p.textMuted }} strokeWidth={1.5} />
                      <span style={{ fontSize: 11, color: p.textSecondary, fontWeight: 500 }}>
                        Pression atmosphérique
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: p.textPrimary }}>
                      {w.main.pressure} hPa
                    </span>
                  </div>
                  <div style={{ height: 6, backgroundColor: p.inputBorder, borderRadius: 99, overflow:"hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width:`${Math.min(Math.max(((w.main.pressure-950)/100)*100,0),100)}%`,
                      background: `linear-gradient(90deg, ${accent}, ${theme?.blobBottomColor ?? accent})`,
                      transition: "width 1s cubic-bezier(0.4,0,0.2,1), background 1s ease",
                    }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: p.textMuted, fontWeight: 500 }}>950</span>
                    <span style={{ fontSize: 9, color: p.textMuted, fontWeight: 500 }}>Normal · 1013</span>
                    <span style={{ fontSize: 9, color: p.textMuted, fontWeight: 500 }}>1050</span>
                  </div>
                </div>

                {/* Lever / Coucher */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[{label:"Lever",ts:w.sys.sunrise,icon:"🌅"},{label:"Coucher",ts:w.sys.sunset,icon:"🌇"}]
                    .map(({label,ts,icon}) => (
                    <div key={label} style={{
                      backgroundColor: p.surfaceBg, borderRadius: 16, padding: "12px 14px",
                      display:"flex", alignItems:"center", gap: 10,
                      border: `1px solid ${p.surfaceBorder}`,
                    }}>
                      <span style={{ fontSize: 22 }}>{icon}</span>
                      <div>
                        <p style={{
                          fontSize: 10, color: p.textMuted, fontWeight: 500,
                          textTransform:"uppercase" as const, letterSpacing:"0.08em",
                        }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: p.textPrimary, marginTop: 2 }}>
                          {new Date(ts*1000).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <p style={{
                  textAlign:"center", fontSize: 10, color: p.textMuted,
                  letterSpacing: "0.1em", textTransform:"uppercase" as const, fontWeight: 300,
                }}>
                  Données du {new Date(w.dt*1000).toLocaleString("fr-FR",{
                    day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* État vide */}
          {!w && !isLoading && !state.errorType && (
            <div style={{
              backgroundColor: p.cardBg, borderRadius: 24, padding: 48,
              border: `1px solid ${p.cardBorder}`, boxShadow: p.cardShadow,
              display:"flex", flexDirection:"column" as const,
              alignItems:"center", gap: 12, textAlign:"center" as const,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: p.surfaceBg,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Search size={22} style={{ color: p.textMuted }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: p.textSecondary }}>
                Aucune ville sélectionnée
              </p>
              <p style={{ fontSize: 12, color: p.textMuted, fontWeight: 300 }}>
                Cherchez une ville ou utilisez votre position
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}