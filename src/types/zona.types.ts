// ============================================================
// zona.types.ts — Tipos del sistema de zonas con polígonos
// ============================================================

import type { Timestamp } from "firebase/firestore";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ZonaPoligono {
  id: string;
  name: string;
  color: string;
  cost: number;
  priority: number;      // menor número = mayor prioridad (para zonas solapadas)
  active: boolean;
  vertices: LatLng[];    // coordenadas del polígono
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type FormZona = Omit<ZonaPoligono, "id" | "createdAt" | "updatedAt">;

export const FORM_ZONA_DEFECTO: FormZona = {
  name:     "",
  color:    "#F97316",
  cost:     2000,
  priority: 1,
  active:   true,
  vertices: [],
};

export const COLORES_PRESET = [
  "#F97316", "#E74C3C", "#E91E63", "#9C27B0",
  "#3F51B5", "#2196F3", "#009688", "#4CAF50",
  "#8BC34A", "#FF9800", "#795548", "#607D8B",
];

// ─── Ray-casting: punto dentro de polígono ───────────────────
export function puntoDentroDePoligono(punto: LatLng, vertices: LatLng[]): boolean {
  if (vertices.length < 3) return false;
  let dentro = false;
  const n = vertices.length;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = vertices[i].lng, yi = vertices[i].lat;
    const xj = vertices[j].lng, yj = vertices[j].lat;
    const intersecta =
      yi > punto.lat !== yj > punto.lat &&
      punto.lng < ((xj - xi) * (punto.lat - yi)) / (yj - yi) + xi;
    if (intersecta) dentro = !dentro;
    j = i;
  }
  return dentro;
}

// Detectar en qué zona cae un punto (prioridad = menor número gana)
export function detectarZonaPorPunto(
  punto: LatLng,
  zonas: ZonaPoligono[]
): ZonaPoligono | null {
  const activas = zonas
    .filter((z) => z.active && z.vertices.length >= 3)
    .sort((a, b) => a.priority - b.priority);

  for (const zona of activas) {
    if (puntoDentroDePoligono(punto, zona.vertices)) return zona;
  }
  return null;
}

// Compatibilidad con el CarritoContext existente (usa {id, nombre, costo, color})
export function zonaPoligonoToZona(z: ZonaPoligono) {
  return {
    id:     z.id,
    nombre: z.name,
    costo:  z.cost,
    color:  z.color,
    barrios: [],
  };
}
