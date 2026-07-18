// ============================================================
// ZonaSelector.tsx — Dirección con detección automática de zona
// El cliente escribe su barrio → se asigna el costo automáticamente
// ============================================================

import { useState } from "react";
import { ZONAS, SIN_ZONA, detectarZona } from "@/data/zonas";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";

export default function ZonaSelector() {
  const { setZonaEnvio, zonaEnvio } = useCarrito();
  const [direccion,     setDireccion]     = useState("");
  const [zonaDetectada, setZonaDetectada] = useState<typeof SIN_ZONA | null>(null);
  const [sinCobertura,  setSinCobertura]  = useState(false);

  const handleDireccion = (val: string) => {
    setDireccion(val);
    setSinCobertura(false);

    if (val.trim().length < 4) {
      setZonaDetectada(null);
      setZonaEnvio(SIN_ZONA);
      return;
    }

    const zona = detectarZona(val);
    if (zona) {
      setZonaDetectada(zona);
      setZonaEnvio(zona);
      setSinCobertura(false);
    } else if (val.trim().length > 10) {
      setZonaDetectada(null);
      setZonaEnvio(SIN_ZONA);
      setSinCobertura(true);
    }
  };

  const handleManual = (id: string) => {
    const zona = ZONAS.find((z) => z.id === id);
    if (zona) {
      setZonaDetectada(zona);
      setZonaEnvio(zona);
      setSinCobertura(false);
    }
  };

  return (
    <div className="zona-auto">
      <label className="zona-auto__label">📍 Tu dirección de entrega</label>
      <input
        className={`zona-auto__input${sinCobertura ? " zona-auto__input--warn" : ""}${zonaDetectada ? " zona-auto__input--ok" : ""}`}
        type="text"
        placeholder="Ej: Reconquista 1234, Agustín Ferrari"
        value={direccion}
        onChange={(e) => handleDireccion(e.target.value)}
        autoComplete="street-address"
      />

      {/* Zona detectada automáticamente */}
      {zonaDetectada && (
        <div className="zona-auto__resultado" style={{ borderColor: zonaDetectada.color }}>
          <span className="zona-auto__dot" style={{ background: zonaDetectada.color }} />
          <div className="zona-auto__info">
            <span className="zona-auto__nombre">📦 {zonaDetectada.nombre}</span>
            <span className="zona-auto__costo">
              Envío: <strong>{formatPrecio(zonaDetectada.costo)}</strong>
            </span>
          </div>
          <span className="zona-auto__ok">✓</span>
        </div>
      )}

      {/* No encontrada: selector manual de respaldo */}
      {sinCobertura && (
        <div className="zona-auto__fallback">
          <p>⚠️ No detectamos tu zona. Elegila manualmente o escribí el barrio:</p>
          <select className="zona-auto__select" defaultValue="" onChange={(e) => handleManual(e.target.value)}>
            <option value="" disabled>Seleccioná tu zona...</option>
            {ZONAS.map((z) => (
              <option key={z.id} value={z.id}>{z.nombre} — {formatPrecio(z.costo)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
