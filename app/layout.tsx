import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// next/font/google : télécharge la police au build,
// la sert en local → pas de requête externe, pas de warning
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Météo",
  description: "Application météo — Next.js 15 + TypeScript",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={outfit.variable}>
      <body
        className="bg-slate-50 min-h-screen"
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}