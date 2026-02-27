// app/page.tsx — Server Component (Next.js 14+ App Router)
//
// Version complète : SSR du thème + pré-fetch météo + compatible Next.js 15
//
// Règle clé Next.js 15 :
//   → searchParams est une Promise  → await obligatoire
//   → On ne peut PAS passer de fonctions ou d'objets avec méthodes
//     (ex: icônes Lucide) d'un Server Component vers un Client Component
//   → Solution : on extrait uniquement les strings/boolean du thème
//     et on laisse WeatherShell reconstruire le WeatherTheme côté client

import WeatherShell from "@/components/WeatherShell";
import { getWeatherTheme } from "@/lib/weatherUtils";
import { WeatherData } from "@/types/weather";

const DEFAULT_CITY = "Paris";
const API_KEY = process.env.OPENWEATHER_API_KEY ?? "";

// ── Fetch météo côté serveur ───────────────────────────────────────────────────

async function getWeather(city: string): Promise<WeatherData | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

// Données de démo si pas de clé API
const MOCK_DATA: WeatherData = {
  coord: { lon: 2.3488, lat: 48.8534 },
  weather: [{ id: 800, main: "Clear", description: "ciel dégagé", icon: "01d" }],
  base: "stations",
  main: { temp: 22, feels_like: 21, temp_min: 18, temp_max: 25, pressure: 1018, humidity: 45 },
  visibility: 10000,
  wind: { speed: 3.5, deg: 180 },
  clouds: { all: 0 },
  dt: Math.floor(Date.now() / 1000),
  sys: {
    country: "FR",
    sunrise: Math.floor(Date.now() / 1000) - 3600 * 4,
    sunset: Math.floor(Date.now() / 1000) + 3600 * 4,
  },
  timezone: 3600,
  id: 2988507,
  name: "Paris",
  cod: 200,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function WeatherPage({
  searchParams,
}: {
  // ✅ Next.js 15 : searchParams est une Promise
  searchParams: Promise<{ city?: string }>;
}) {
  // ✅ await obligatoire
  const { city } = await searchParams;
  const targetCity = city ?? DEFAULT_CITY;

  // Pré-fetch côté serveur pour le thème initial (évite le flash de couleur)
  const weather = (await getWeather(targetCity)) ?? MOCK_DATA;
  const conditionId = weather.weather[0]?.id ?? 800;

  // On calcule le thème côté serveur...
  const theme = getWeatherTheme(conditionId);

  // ...mais on n'envoie que des STRINGS au Client Component (pas l'icône Lucide !)
  // WeatherShell reconstituera le WeatherTheme complet côté client.
  const themeProps = {
    initialGradient:    theme.gradient,
    initialBlobTop:     theme.blobTopColor,
    initialBlobBottom:  theme.blobBottomColor,
    initialAdvice:      theme.advice,
    initialIconName:    theme.label, // label string, l'icône est résolue côté client
    initialLabel:       theme.label,
  };

  return (
    <>
      {/* Police chargée côté serveur → zéro FOUT (Flash Of Unstyled Text) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap"
      />

      {/*
        WeatherShell reçoit uniquement des valeurs sérialisables (strings, boolean).
        Il reconstruit le WeatherTheme complet côté client et coordonne :
          - WeatherBackground : fond animé avec les bonnes couleurs dès le 1er rendu
          - WeatherCard       : géolocalisation + recherche + carte météo
      */}
      <WeatherShell
        {...themeProps}
        isDemo={!API_KEY}
      />
    </>
  );
}
