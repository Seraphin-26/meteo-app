// lib/weatherUtils.ts
// Utilitaire central : à partir de l'ID météo OWM, retourne
// un thème visuel complet (gradient, blobs, conseil, icône Lucide).

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  LucideIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WeatherTheme {
  /** Gradient CSS appliqué au <body> / fond de page */
  gradient: string;
  /** Couleur du blob en haut à gauche */
  blobTopColor: string;
  /** Couleur du blob en bas à droite */
  blobBottomColor: string;
  /** Conseil humain affiché sous la carte */
  advice: string;
  /** Composant icône Lucide-React correspondant */
  Icon: LucideIcon;
  /** Nom de la condition (pour aria-label) */
  label: string;
}

// ── Table de correspondance ────────────────────────────────────────────────────
// Référence IDs : https://openweathermap.org/weather-conditions

const THEMES: Array<{
  min: number;
  max: number;
  theme: WeatherTheme;
}> = [
  // ⛈ Orage (200–232)
  {
    min: 200, max: 232,
    theme: {
      gradient:       "linear-gradient(135deg, #0a0a1a 0%, #12122e 50%, #1a1040 100%)",
      blobTopColor:   "#4f46e5",
      blobBottomColor:"#7c3aed",
      advice:         "Restez à l'intérieur, orage imminent ⚡",
      Icon:           CloudLightning,
      label:          "Orage",
    },
  },
  // 🌧 Bruine (300–321)
  {
    min: 300, max: 321,
    theme: {
      gradient:       "linear-gradient(135deg, #1e2d40 0%, #243447 50%, #2a3d52 100%)",
      blobTopColor:   "#60a5fa",
      blobBottomColor:"#93c5fd",
      advice:         "Un petit imperméable suffit aujourd'hui 🧥",
      Icon:           CloudDrizzle,
      label:          "Bruine",
    },
  },
  // 🌧 Pluie (500–531)
  {
    min: 500, max: 531,
    theme: {
      gradient:       "linear-gradient(135deg, #1a2540 0%, #1e2d52 50%, #243360 100%)",
      blobTopColor:   "#3b82f6",
      blobBottomColor:"#1d4ed8",
      advice:         "N'oublie pas ton parapluie ☂️",
      Icon:           CloudRain,
      label:          "Pluie",
    },
  },
  // ❄️ Neige (600–622)
  {
    min: 600, max: 622,
    theme: {
      gradient:       "linear-gradient(135deg, #c8d6e5 0%, #d8e8f4 50%, #e8f2fa 100%)",
      blobTopColor:   "#bae6fd",
      blobBottomColor:"#e0f2fe",
      advice:         "Chaussures imperméables et gants recommandés 🧤",
      Icon:           CloudSnow,
      label:          "Neige",
    },
  },
  // 🌫 Atmosphère – brume, brouillard, fumée… (700–781)
  {
    min: 700, max: 781,
    theme: {
      gradient:       "linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)",
      blobTopColor:   "#d1d5db",
      blobBottomColor:"#9ca3af",
      advice:         "Visibilité réduite, conduisez prudemment 🌫️",
      Icon:           Eye,
      label:          "Brume / Brouillard",
    },
  },
  // ☀️ Ciel dégagé (800)
  {
    min: 800, max: 800,
    theme: {
      gradient:       "linear-gradient(135deg, #0c2e5c 0%, #1a4a8a 40%, #2563b8 100%)",
      blobTopColor:   "#fbbf24",
      blobBottomColor:"#f59e0b",
      advice:         "Pense à tes lunettes de soleil 🕶️",
      Icon:           Sun,
      label:          "Ciel dégagé",
    },
  },
  // 🌤 Quelques nuages (801–802)
  {
    min: 801, max: 802,
    theme: {
      gradient:       "linear-gradient(135deg, #1a3a5c 0%, #264d73 50%, #2d5f8a 100%)",
      blobTopColor:   "#93c5fd",
      blobBottomColor:"#fbbf24",
      advice:         "Belle journée, profitez-en ! ☀️🌤",
      Icon:           CloudSun,
      label:          "Partiellement nuageux",
    },
  },
  // ☁️ Nuageux / couvert (803–804)
  {
    min: 803, max: 804,
    theme: {
      gradient:       "linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)",
      blobTopColor:   "#9ca3af",
      blobBottomColor:"#6b7280",
      advice:         "Ciel couvert, une petite veste s'impose 🧣",
      Icon:           Cloud,
      label:          "Nuageux",
    },
  },
];

// Thème par défaut (fallback)
const DEFAULT_THEME: WeatherTheme = {
  gradient:       "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
  blobTopColor:   "#94a3b8",
  blobBottomColor:"#64748b",
  advice:         "Vérifiez la météo avant de sortir 🌡️",
  Icon:           Wind,
  label:          "Inconnu",
};

// ── Fonction principale ───────────────────────────────────────────────────────

/**
 * Retourne un objet `WeatherTheme` complet à partir de l'ID météo OWM.
 *
 * @example
 * const theme = getWeatherTheme(800);
 * // → { gradient: "…", advice: "Pense à tes lunettes de soleil 🕶️", Icon: Sun, … }
 */
export function getWeatherTheme(conditionId: number): WeatherTheme {
  const match = THEMES.find(
    ({ min, max }) => conditionId >= min && conditionId <= max
  );
  return match?.theme ?? DEFAULT_THEME;
}

/**
 * Retourne uniquement le conseil textuel (utile pour les tests ou les tooltips).
 */
export function getWeatherAdvice(conditionId: number): string {
  return getWeatherTheme(conditionId).advice;
}

/**
 * Retourne `true` si le temps est susceptible de nécessiter un équipement
 * de protection (pluie, neige, orage).
 */
export function requiresProtection(conditionId: number): boolean {
  return conditionId >= 200 && conditionId < 700;
}
