// ============================================================
// ZonaSelector.tsx — Detección automática de zona por polígono
// Geocodifica la dirección → punto → ray-casting en polígonos
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useZonas } from "@/hooks/useZonas";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import { geocodificarDireccion } from "@/services/geocoding.service";
import { detectarZonaPorPunto, zonaPoligonoToZona } from "@/types/zona.types";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";

// Centro aprox. del Partido de Moreno — sesga las sugerencias de
// Places sin restringirlas (el cliente puede pedir desde otra localidad).
const MORENO_BOUNDS = {
  north: -34.575, south: -34.72,
  east: -58.72,   west: -58.86,
};

const SIN_ZONA_BASE = { id: "sin_zona", nombre: "Retiro en local", costo: 0, color: "#999", barrios: [] };

export default function ZonaSelector() {
  const { setZonaEnvio, direccionEnvio, setDireccionEnvio } = useCarrito();
  const { zonas } = useZonas(true); // solo activas
  const scriptListo = useGoogleMapsScript();

  const [estado,        setEstado]        = useState<"idle"|"buscando"|"encontrada"|"no_encontrada">("idle");
  const [zonaDetectada, setZonaDetectada] = useState<any>(null);
  const [zonaManual,    setZonaManual]    = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const resolverZonaPorCoords = (coords: { lat: number; lng: number }) => {
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
  };

  const handleDireccion = (val: string) => {
    setDireccionEnvio(val);
    setZonaDetectada(null);
    setZonaManual("");
    setZonaEnvio(SIN_ZONA_BASE);

    if (val.trim().length < 6) { setEstado("idle"); return; }

    // Debounce 800ms como fallback si el usuario tipea y no elige
    // ninguna sugerencia del autocomplete (ej: pega la dirección, o
    // el autocomplete todavía no cargó).
    clearTimeout(debounceRef.current);
    setEstado("buscando");
    debounceRef.current = setTimeout(async () => {
      const coords = await geocodificarDireccion(val);
      if (!coords) { setEstado("no_encontrada"); return; }
      resolverZonaPorCoords(coords);
    }, 800);
  };

  // Inicializa el widget de Google Places Autocomplete sobre el input.
  // Cuando el usuario elige una sugerencia, ya tenemos lat/lng directo
  // (sin pegarle de nuevo a la Geocoding API) y resolvemos la zona al toque.
  useEffect(() => {
    if (!scriptListo || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ar" },
      fields: ["formatted_address", "geometry"],
      types: ["address"],
      bounds: MORENO_BOUNDS,
    });
    autocompleteRef.current = autocomplete;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      if (!loc) { setEstado("no_encontrada"); return; }

      clearTimeout(debounceRef.current);
      const direccion = place.formatted_address ?? inputRef.current!.value;
      setDireccionEnvio(direccion);
      setEstado("buscando");
      resolverZonaPorCoords({ lat: loc.lat(), lng: loc.lng() });
    });

    return () => listener.remove();
  }, [scriptListo, zonas]);

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
        ref={inputRef}
        className={`zona-auto__input${estado === "encontrada" ? " zona-auto__input--ok" : ""}${estado === "no_encontrada" ? " zona-auto__input--warn" : ""}`}
        type="text"
        placeholder="Ej: Génova 498, Agustín Ferrari..."
        value={direccionEnvio}
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
