// ============================================================
// useZonas.ts — Hook tiempo real para zonas de Firestore
// ============================================================

import { useEffect, useState } from "react";
import { escucharZonas } from "@/services/zonas.service";
import type { ZonaPoligono } from "@/types/zona.types";

export function useZonas(soloActivas = false) {
  const [zonas,    setZonas]    = useState<ZonaPoligono[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const unsub = escucharZonas(
      (data) => {
        setZonas(soloActivas ? data.filter((z) => z.active) : data);
        setCargando(false);
        setError("");
      },
      (err) => { setError(err.message); setCargando(false); }
    );
    return () => unsub();
  }, [soloActivas]);

  return { zonas, cargando, error };
}
