// app/api/weather/route.ts
// Route Handler — s'exécute côté SERVEUR uniquement.
// La clé OPENWEATHER_API_KEY n'est jamais exposée au navigateur.

import { NextRequest, NextResponse } from "next/server";

const OWM_BASE = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!lat && !lon && !city) {
    return NextResponse.json(
      { error: "Fournissez lat & lon, ou city." },
      { status: 400 }
    );
  }

  if ((lat && !lon) || (!lat && lon)) {
    return NextResponse.json(
      { error: "lat et lon doivent être fournis ensemble." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API manquante côté serveur." },
      { status: 500 }
    );
  }

  // ── Construction de l'URL OWM ────────────────────────────────────────────
  const query = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${encodeURIComponent(city!)}`;
  const url = `${OWM_BASE}?${query}&appid=${apiKey}&units=metric&lang=fr`;

  // ── Appel OWM (depuis le serveur → clé jamais visible du client) ─────────
  try {
    const owmRes = await fetch(url, {
      next: { revalidate: 600 }, // cache 10 min côté serveur
    });

    if (!owmRes.ok) {
      const err = await owmRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message ?? "Erreur OpenWeatherMap" },
        { status: owmRes.status }
      );
    }

    const data = await owmRes.json();

    // Renvoie les données au client — sans jamais inclure la clé
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur réseau serveur." }, { status: 502 });
  }
}
