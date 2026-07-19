// ============================================================
// ZonaSelector.tsx — Detección automática de zona por polígono
// Geocodifica la dirección → punto → ray-casting en polígonos
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useZonas } from "@/hooks/useZonas";
import { geocodificarDireccion } from "@/services/zonas.service";
import { detectarZonaPorPunto, zonaPoligonoToZona } from "@/types/zona.types";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";

const SIN_ZONA_BASE = { id: "sin_zona", nombre: "Retiro en local", costo: 0, color: "#999", barrios: [] };

export default function ZonaSelector() {
  const { setZonaEnvio } = useCarrito();
  const { zonas } = useZonas(true); // solo activas

  const [direccion,     setDireccion]     = useState("");
  const [estado,        setEstado]        = useState<"idle"|"buscando"|"encontrada"|"no_encontrada">("idle");
  const [zonaDetectada, setZonaDetectada] = useState<any>(null);
  const [zonaManual,    setZonaManual]    = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDireccion = (val: string) => {
    setDireccion(val);
    setZonaDetectada(null);
    setZonaManual("");
    setZonaEnvio(SIN_ZONA_BASE);

    if (val.trim().length < 6) { setEstado("idle"); return; }

    // Debounce 800ms para respetar rate limit de Nominatim
    clearTimeout(debounceRef.current);
    setEstado("buscando");
    debounceRef.current = setTimeout(async () => {
      const coords = await geocodificarDireccion(val);
      if (!coords) { setEstado("no_encontrada"); return; }

      const zona = detectarZonaPorPunto(coords, zonas);
      if (zona) {
        const zonaBase = zonaPoligonoToZona(zona);
        setZonaDetectada(zonaBase);
        setZonaEnvio(zonaBase);
        setZonaManual(zona.id);
        setEstado("encontrada");
      } else {
        setEstado("no_encontrada");
      }
    }, 800);
  };

  const handleManual = (id: string) => {
    setZonaManual(id);
    const zona = zonas.find((z) => z.id === id);
    if (zona) {
      const zonaBase = zonaPoligonoToZona(zona);
      setZonaDetectada(zonaBase);
      setZonaEnvio(zonaBase);
      setEstado("encontrada");
    }
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="zona-auto">
      <label className="zona-auto__label">📍 Tu dirección de entrega</label>
      <input
        className={`zona-auto__input${estado === "encontrada" ? " zona-auto__input--ok" : ""}${estado === "no_encontrada" ? " zona-auto__input--warn" : ""}`}
        type="text"
        placeholder="Ej: Génova 498, Agustín Ferrari..."
        value={direccion}
        onChange={(e) => handleDireccion(e.target.value)}
        autoComplete="street-address"
      />

      {/* Buscando */}
      {estado === "buscando" && (
        <div className="zona-auto__buscando">
          <div className="zona-auto__spinner" /> Detectando zona...
        </div>
      )}

      {/* Zona detectada automáticamente */}
      {estado === "encontrada" && zonaDetectada && (
        <div className="zona-auto__resultado" style={{ borderColor: zonaDetectada.color }}>
          <span className="zona-auto__dot" style={{ background: zonaDetectada.color }} />
          <div className="zona-auto__info">
            <span className="zona-auto__nombre">✓ {zonaDetectada.nombre}</span>
            <span className="zona-auto__costo">
              Envío: <strong>{formatPrecio(zonaDetectada.costo)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* No detectada: mostrar selector manual (solo DESPUÉS de intentar buscar) */}
      {estado === "no_encontrada" && (
        <div className="zona-auto__selector-wrap">
          <p className="zona-auto__no-encontrada">
            ⚠️ No pudimos detectar tu zona automáticamente. Elegila de la lista:
          </p>
          <div className="zona-auto__grid">
            {zonas.map((z) => (
              <button
                key={z.id}
                type="button"
                className={`zona-auto__chip${zonaManual === z.id ? " zona-auto__chip--activo" : ""}`}
                style={zonaManual === z.id ? { borderColor: z.color, background: z.color + "22" } : {}}
                onClick={() => handleManual(z.id)}
              >
                <span className="zona-auto__chip-dot" style={{ background: z.color }} />
                <span className="zona-auto__chip-nombre">{z.name}</span>
                <span className="zona-auto__chip-precio">{formatPrecio(z.cost)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
