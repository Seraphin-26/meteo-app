"use client";

import { useEffect, useState } from "react";
import { WeatherTheme } from "@/lib/weatherUtils";

interface Props {
  theme: WeatherTheme;
  children: React.ReactNode;
}

export default function WeatherBackground({ theme, children }: Props) {
  const [grad, setGrad] = useState(theme.gradient);
  const [b1, setB1] = useState(theme.blobTopColor);
  const [b2, setB2] = useState(theme.blobBottomColor);

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setGrad(theme.gradient);
      setB1(theme.blobTopColor);
      setB2(theme.blobBottomColor);
    });
    return () => cancelAnimationFrame(r);
  }, [theme]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: grad,
        transition: "background 1.4s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Grain overlay pour texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Blob haut gauche */}
      <div
        className="pointer-events-none fixed -top-48 -left-48 w-[600px] h-[600px] rounded-full opacity-40 blur-[120px] z-0"
        style={{
          background: `radial-gradient(circle, ${b1}, transparent 70%)`,
          transition: "background 1.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      {/* Blob bas droite */}
      <div
        className="pointer-events-none fixed -bottom-48 -right-48 w-[700px] h-[700px] rounded-full opacity-30 blur-[140px] z-0"
        style={{
          background: `radial-gradient(circle, ${b2}, transparent 70%)`,
          transition: "background 1.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      {/* Blob centre subtil */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] z-0"
        style={{ background: `radial-gradient(circle, white, transparent 70%)` }}
      />

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
