// ============================================================
// useGoogleMapsScript.ts — Carga el script de Google Maps JS API
// (necesario para el widget de Places Autocomplete) una sola vez,
// sin importar cuántos componentes lo usen.
// ============================================================

import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let cargando: Promise<void> | null = null;

function cargarScript(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
    return Promise.resolve();
  }
  if (cargando) return cargando;

  cargando = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("Falta VITE_GOOGLE_MAPS_API_KEY"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=es&region=AR`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps JS API"));
    document.head.appendChild(script);
  });

  return cargando;
}

/** Devuelve true cuando window.google.maps.places ya está disponible. */
export function useGoogleMapsScript(): boolean {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let activo = true;
    cargarScript()
      .then(() => { if (activo) setListo(true); })
      .catch((e) => console.error("[useGoogleMapsScript]", e.message));
    return () => { activo = false; };
  }, []);

  return listo;
}
