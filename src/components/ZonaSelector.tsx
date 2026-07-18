// ============================================================
// ZonaSelector.tsx — Dirección + selector de zona siempre visible
// ============================================================

import { useState } from "react";
import { ZONAS, SIN_ZONA, detectarZona } from "@/data/zonas";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";

export default function ZonaSelector() {
  const { setZonaEnvio } = useCarrito();
  const [direccion,     setDireccion]     = useState("");
  const [zonaDetectada, setZonaDetectada] = useState<typeof SIN_ZONA | null>(null);
  const [zonaManual,    setZonaManual]    = useState("");

  const handleDireccion = (val: string) => {
    setDireccion(val);
    // Intentar detección automática
    if (val.trim().length >= 4) {
      const zona = detectarZona(val);
      if (zona) {
        setZonaDetectada(zona);
        setZonaManual(zona.id);
        setZonaEnvio(zona);
        return;
      }
    }
    // Si no detecta, respetar la selección manual si ya eligió
    if (!zonaManual) {
      setZonaDetectada(null);
      setZonaEnvio(SIN_ZONA);
    }
  };

  const handleManual = (id: string) => {
    setZonaManual(id);
    const zona = ZONAS.find((z) => z.id === id);
    if (zona) {
      setZonaDetectada(zona);
      setZonaEnvio(zona);
    }
  };

  return (
    <div className="zona-auto">
      {/* Campo de dirección */}
      <label className="zona-auto__label">📍 Tu dirección de entrega</label>
      <input
        className={`zona-auto__input${zonaDetectada ? " zona-auto__input--ok" : ""}`}
        type="text"
        placeholder="Ej: Génova 498, Agustín Ferrari..."
        value={direccion}
        onChange={(e) => handleDireccion(e.target.value)}
        autoComplete="street-address"
      />

      {/* Selector de zona — SIEMPRE VISIBLE para delivery */}
      <div className="zona-auto__selector-wrap">
        <label className="zona-auto__label" style={{ marginTop: 4 }}>
          🗺 Zona de entrega
          {!zonaManual && <span className="zona-auto__requerido"> * Elegí tu zona</span>}
        </label>
        <div className="zona-auto__grid">
          {ZONAS.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`zona-auto__chip${zonaManual === z.id ? " zona-auto__chip--activo" : ""}`}
              style={zonaManual === z.id ? { borderColor: z.color, background: z.color + "22" } : {}}
              onClick={() => handleManual(z.id)}
            >
              <span className="zona-auto__chip-dot" style={{ background: z.color }} />
              <span className="zona-auto__chip-nombre">{z.nombre}</span>
              <span className="zona-auto__chip-precio">{formatPrecio(z.costo)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zona confirmada */}
      {zonaDetectada && (
        <div className="zona-auto__resultado" style={{ borderColor: zonaDetectada.color }}>
          <span className="zona-auto__dot" style={{ background: zonaDetectada.color }} />
          <div className="zona-auto__info">
            <span className="zona-auto__nombre">{zonaDetectada.nombre} ✓</span>
            <span className="zona-auto__costo">
              Costo de envío: <strong>{formatPrecio(zonaDetectada.costo)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
