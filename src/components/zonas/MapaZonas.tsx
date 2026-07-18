// ============================================================
// MapaZonas.tsx — Mapa Leaflet con polígonos editables
// ============================================================

import { useEffect, useRef, useCallback } from "react";
import type { ZonaPoligono, LatLng } from "@/types/zona.types";

// Coordenadas centradas en Agustín Ferrari / Merlo
const CENTER: [number, number] = [-34.7205, -58.7947];
const ZOOM_INICIAL = 14;

interface MapaZonasProps {
  zonas: ZonaPoligono[];
  zonaSeleccionada: ZonaPoligono | null;
  modoCrear: boolean;
  onZonaClick: (zona: ZonaPoligono) => void;
  onPoligonoCreado: (vertices: LatLng[]) => void;
  onPoligonoEditado: (id: string, vertices: LatLng[]) => void;
  onCancelarCreacion: () => void;
}

export default function MapaZonas({
  zonas,
  zonaSeleccionada,
  modoCrear,
  onZonaClick,
  onPoligonoCreado,
  onPoligonoEditado,
  onCancelarCreacion,
}: MapaZonasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const layersRef    = useRef<Map<string, any>>(new Map());
  const drawRef      = useRef<any>(null);
  const editLayerRef = useRef<any>(null);

  // ── Inicializar mapa ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Import dinámico para evitar problemas con SSR
    import("leaflet").then((L) => {
      // Fix para íconos de Leaflet en Vite
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: CENTER,
        zoom:   ZOOM_INICIAL,
        zoomControl: true,
      });

      // Tile layer OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Renderizar polígonos cuando cambien las zonas ───────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      // Limpiar capas anteriores (excepto la que se está editando)
      layersRef.current.forEach((layer, id) => {
        if (id !== zonaSeleccionada?.id || !editLayerRef.current) {
          mapRef.current.removeLayer(layer);
        }
      });
      layersRef.current.clear();

      zonas.forEach((zona) => {
        if (zona.vertices.length < 3) return;
        // Si esta zona está siendo editada, no la redibujamos (la maneja el editor)
        if (zona.id === zonaSeleccionada?.id && editLayerRef.current) return;

        const latlngs = zona.vertices.map((v) => [v.lat, v.lng] as [number, number]);
        const poly = L.polygon(latlngs, {
          color:       zona.color,
          fillColor:   zona.color,
          fillOpacity: zona.active ? 0.25 : 0.08,
          weight:      zona.id === zonaSeleccionada?.id ? 3 : 2,
          opacity:     zona.active ? 1 : 0.4,
          dashArray:   zona.active ? undefined : "6,4",
        });

        // Tooltip con nombre y costo
        poly.bindTooltip(
          `<strong>${zona.name}</strong><br>$${zona.cost.toLocaleString("es-AR")}${zona.active ? "" : " (inactiva)"}`,
          { permanent: false, sticky: true }
        );

        poly.on("click", () => onZonaClick(zona));
        poly.addTo(mapRef.current);
        layersRef.current.set(zona.id, poly);
      });
    });
  }, [zonas, zonaSeleccionada?.id]);

  // ── Modo creación de polígono ───────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then(async (L) => {
      const LD = await import("leaflet-draw");

      if (modoCrear) {
        // Crear capa de edición temporal
        const drawnItems = new L.FeatureGroup();
        mapRef.current.addLayer(drawnItems);

        const drawControl = new (L as any).Control.Draw({
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: false,
              shapeOptions: { color: "#F97316", fillOpacity: 0.3 },
            },
            polyline: false, rectangle: false, circle: false,
            circlemarker: false, marker: false,
          },
          edit: { featureGroup: drawnItems },
        });
        mapRef.current.addControl(drawControl);
        drawRef.current = drawControl;

        // Iniciar dibujo automáticamente
        setTimeout(() => {
          const btn = containerRef.current?.querySelector(".leaflet-draw-draw-polygon") as HTMLElement;
          btn?.click();
        }, 300);

        // Capturar polígono creado
        mapRef.current.on((L as any).Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          drawnItems.addLayer(layer);
          const vertices: LatLng[] = layer.getLatLngs()[0].map((ll: any) => ({
            lat: ll.lat, lng: ll.lng,
          }));
          onPoligonoCreado(vertices);
          // Limpiar control de dibujo
          mapRef.current.removeControl(drawControl);
          mapRef.current.removeLayer(drawnItems);
          drawRef.current = null;
        });

        return () => {
          if (drawRef.current) {
            try { mapRef.current?.removeControl(drawRef.current); } catch {}
            drawRef.current = null;
          }
          mapRef.current?.removeLayer(drawnItems);
          mapRef.current?.off((L as any).Draw.Event.CREATED);
        };
      } else {
        // Cancelar si se sale del modo creación
        if (drawRef.current) {
          try { mapRef.current?.removeControl(drawRef.current); } catch {}
          drawRef.current = null;
        }
      }
    });
  }, [modoCrear]);

  // ── Modo edición de polígono existente ──────────────────────
  useEffect(() => {
    if (!mapRef.current || !zonaSeleccionada || zonaSeleccionada.vertices.length < 3) return;
    import("leaflet").then(async (L) => {
      await import("leaflet-draw");

      // Limpiar editor anterior
      if (editLayerRef.current) {
        try { mapRef.current.removeLayer(editLayerRef.current._featureGroup); } catch {}
        editLayerRef.current = null;
      }

      // Crear grupo de edición
      const editGroup = new L.FeatureGroup();
      const latlngs   = zonaSeleccionada.vertices.map(
        (v) => [v.lat, v.lng] as [number, number]
      );
      const poly = L.polygon(latlngs, {
        color:       zonaSeleccionada.color,
        fillColor:   zonaSeleccionada.color,
        fillOpacity: 0.3,
        weight:      3,
      });
      editGroup.addLayer(poly);
      mapRef.current.addLayer(editGroup);

      // Habilitar edición
      (poly as any).editing?.enable?.();

      // Guardar referencia
      editLayerRef.current = { poly, _featureGroup: editGroup };

      // Listener: cuando termina la edición guardamos los nuevos vértices
      const onEditEnd = () => {
        const newLatLngs = (poly as any).getLatLngs()[0];
        const vertices: LatLng[] = newLatLngs.map((ll: any) => ({
          lat: ll.lat, lng: ll.lng,
        }));
        onPoligonoEditado(zonaSeleccionada.id, vertices);
      };
      poly.on("edit", onEditEnd);

      return () => {
        poly.off("edit", onEditEnd);
        try { mapRef.current?.removeLayer(editGroup); } catch {}
        editLayerRef.current = null;
      };
    });
  }, [zonaSeleccionada?.id, zonaSeleccionada?.color]);

  return (
    <div className="mapa-zonas-wrap">
      {/* Instrucciones contextuales */}
      {modoCrear && (
        <div className="mapa-zonas-hint">
          🖊 Hacé click en el mapa para trazar los vértices del polígono.
          Doble click para cerrar la figura.
          <button className="mapa-zonas-cancelar" onClick={onCancelarCreacion}>
            Cancelar
          </button>
        </div>
      )}
      {zonaSeleccionada && !modoCrear && zonaSeleccionada.vertices.length >= 3 && (
        <div className="mapa-zonas-hint mapa-zonas-hint--edit">
          ✏️ Arrastrá los puntos blancos para modificar los límites de <strong>{zonaSeleccionada.name}</strong>.
          Los cambios se guardan solos.
        </div>
      )}
      <div ref={containerRef} className="mapa-zonas-container" />
    </div>
  );
}
