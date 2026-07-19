// ============================================================
// SembrarZonas.tsx — Precarga las 10 zonas de la imagen original
// Nombres, colores y costos EXACTOS de la lista. Posición/forma
// son un punto de partida para ajustar arrastrando en el mapa.
// ============================================================

import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Centro real de AleBurgers (mismo que MAPS_EMBED_URL en contact.ts)
const PIN_LAT = -34.7205088;
const PIN_LNG = -58.7947361;

// Datos EXACTOS leídos de la imagen (nombre, color, costo) —
// la posición es un punto de partida en forma de anillo alrededor del local.
const ZONAS_IMAGEN = [
  { nombre: "ZONA 1",  color: "#8B0000", costo: 2000, bearing: 20  },
  { nombre: "ZONA 2",  color: "#1a237e", costo: 1500, bearing: 56  },
  { nombre: "ZONA 3",  color: "#283593", costo: 2500, bearing: 92  },
  { nombre: "ZONA 4",  color: "#e91e63", costo: 2500, bearing: 128 },
  { nombre: "ZONA 5",  color: "#2e7d32", costo: 3000, bearing: 164 },
  { nombre: "ZONA 6",  color: "#6a1b9a", costo: 3000, bearing: 200 },
  { nombre: "ZONA 7",  color: "#e65100", costo: 3500, bearing: 236 },
  { nombre: "ZONA 8",  color: "#4dd0e1", costo: 3500, bearing: 272 },
  { nombre: "ZONA 9",  color: "#33691e", costo: 3000, bearing: 308 },
  { nombre: "ZONA 10", color: "#795548", costo: 3500, bearing: 344 },
];

const DISTANCIA_M = 900;   // distancia del centro de cada zona al local
const RADIO_ZONA_M = 500;  // "radio" del hexágono de cada zona

// Convierte metros de desplazamiento a lat/lng
function desplazar(lat: number, lng: number, bearingDeg: number, distM: number) {
  const R = 6371000;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distM / R) +
    Math.cos(lat1) * Math.sin(distM / R) * Math.cos(brng)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(distM / R) * Math.cos(lat1),
    Math.cos(distM / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

// Genera un hexágono alrededor de un centro
function hexagono(centerLat: number, centerLng: number, radioM: number) {
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angulo = i * 60;
    vertices.push(desplazar(centerLat, centerLng, angulo, radioM));
  }
  return vertices;
}

export default function SembrarZonas({ onListo }: { onListo: () => void }) {
  const [estado, setEstado] = useState<"idle" | "sembrando" | "listo" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSembrar = async () => {
    setEstado("sembrando");
    try {
      const snap = await getDocs(collection(db, "zones"));
      if (!snap.empty) {
        setEstado("listo");
        setMsg(`Ya hay ${snap.size} zonas guardadas. No hace falta sembrar de nuevo.`);
        setTimeout(onListo, 1800);
        return;
      }

      let i = 0;
      for (const z of ZONAS_IMAGEN) {
        setMsg(`Creando ${z.nombre}...`);
        const centro = desplazar(PIN_LAT, PIN_LNG, z.bearing, DISTANCIA_M);
        const vertices = hexagono(centro.lat, centro.lng, RADIO_ZONA_M);

        await addDoc(collection(db, "zones"), {
          name: z.nombre,
          color: z.color,
          cost: z.costo,
          priority: i + 1,
          active: true,
          vertices,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        i++;
      }

      setEstado("listo");
      setMsg(`✅ ${ZONAS_IMAGEN.length} zonas creadas. Ahora ajustá cada una arrastrando sus vértices.`);
      setTimeout(onListo, 2200);
    } catch (e: any) {
      setEstado("error");
      setMsg(e?.message ?? "Error desconocido");
    }
  };

  if (estado === "idle") {
    return (
      <div className="migrar-banner">
        <div className="migrar-info">
          <span className="migrar-icon">🗺</span>
          <div>
            <strong>Precargar las 10 zonas de tu lista</strong>
            <p>
              Nombre, color y costo exactos de cada zona (ZONA 1 a ZONA 10) se crean automáticamente
              como polígonos de partida alrededor del local. Después solo arrastrás cada uno para
              que coincida con el límite real de tu zona de reparto.
            </p>
          </div>
        </div>
        <button className="migrar-btn" onClick={handleSembrar}>
          Precargar ahora
        </button>
      </div>
    );
  }

  if (estado === "sembrando") {
    return (
      <div className="migrar-banner migrar-banner--loading">
        <div className="migrar-spinner" />
        <span>{msg || "Creando zonas..."}</span>
      </div>
    );
  }

  if (estado === "listo") {
    return (
      <div className="migrar-banner migrar-banner--ok">
        <span>{msg}</span>
      </div>
    );
  }

  return (
    <div className="migrar-banner migrar-banner--error">
      <span>❌ Error: {msg}</span>
      <button className="migrar-btn" onClick={() => setEstado("idle")}>Reintentar</button>
    </div>
  );
}
