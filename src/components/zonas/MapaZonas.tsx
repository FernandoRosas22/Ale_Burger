// ============================================================
// MapaZonas.tsx — Mapa Leaflet con polígonos editables
// ============================================================

import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet-draw";
import type { ZonaPoligono, LatLng } from "@/types/zona.types";

// leaflet-draw es un plugin "clásico" que espera `L` en window.
// Sin esta línea, leaflet-draw falla silenciosamente y el mapa no funciona.
(window as any).L = L;

// Fix íconos de Leaflet en Vite (rutas rotas por defecto)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Coordenadas reales de AleBurgers (mismas del mapa embebido en contact.ts)
const CENTER: [number, number] = [-34.7205088, -58.7947361];
const ZOOM_INICIAL = 15;

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
  const mapRef       = useRef<L.Map | null>(null);
  const layersRef    = useRef<Map<string, L.Polygon>>(new Map());
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef  = useRef<L.FeatureGroup | null>(null);
  const editGroupRef   = useRef<L.FeatureGroup | null>(null);

  // ── Inicializar mapa UNA SOLA VEZ ───────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: ZOOM_INICIAL,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Marcador de referencia del local
    L.marker(CENTER).addTo(map).bindPopup("📍 AleBurgers (local)");

    mapRef.current = map;

    // Forzar recalculo de tamaño (bug común: mapa gris hasta hacer resize)
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Renderizar polígonos cuando cambien las zonas ───────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar capas previas (excepto la que está en edición activa)
    layersRef.current.forEach((layer, id) => {
      if (id !== zonaSeleccionada?.id || !editGroupRef.current) {
        map.removeLayer(layer);
      }
    });
    layersRef.current.clear();

    zonas.forEach((zona) => {
      if (zona.vertices.length < 3) return;
      if (zona.id === zonaSeleccionada?.id && editGroupRef.current) return;

      const latlngs = zona.vertices.map((v) => L.latLng(v.lat, v.lng));
      const poly = L.polygon(latlngs, {
        color: zona.color,
        fillColor: zona.color,
        fillOpacity: zona.active ? 0.28 : 0.08,
        weight: zona.id === zonaSeleccionada?.id ? 3 : 2,
        opacity: zona.active ? 1 : 0.4,
        dashArray: zona.active ? undefined : "6,4",
      });

      poly.bindTooltip(
        `<strong>${zona.name}</strong><br>$${zona.cost.toLocaleString("es-AR")}${zona.active ? "" : " (inactiva)"}`,
        { sticky: true }
      );
      poly.on("click", () => onZonaClick(zona));
      poly.addTo(map);
      layersRef.current.set(zona.id, poly);
    });
  }, [zonas, zonaSeleccionada?.id]);

  // ── Modo creación de polígono ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (modoCrear) {
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      const drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false,
            shapeOptions: { color: "#F97316", fillOpacity: 0.3 },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: { featureGroup: drawnItems, remove: false },
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      const iniciar = setTimeout(() => {
        const btn = containerRef.current?.querySelector(
          ".leaflet-draw-draw-polygon"
        ) as HTMLElement | null;
        btn?.click();
      }, 200);

      const onCreated = (e: any) => {
        const layer = e.layer as L.Polygon;
        drawnItems.addLayer(layer);
        const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
          lat: ll.lat,
          lng: ll.lng,
        }));
        onPoligonoCreado(latlngs);
        map.removeControl(drawControl);
        map.removeLayer(drawnItems);
        drawControlRef.current = null;
        drawnItemsRef.current = null;
      };

      map.on(L.Draw.Event.CREATED, onCreated);

      return () => {
        clearTimeout(iniciar);
        map.off(L.Draw.Event.CREATED, onCreated);
        if (drawControlRef.current) {
          try { map.removeControl(drawControlRef.current); } catch {}
          drawControlRef.current = null;
        }
        if (drawnItemsRef.current) {
          try { map.removeLayer(drawnItemsRef.current); } catch {}
          drawnItemsRef.current = null;
        }
      };
    }
  }, [modoCrear]);

  // ── Modo edición de polígono existente ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zonaSeleccionada || zonaSeleccionada.vertices.length < 3 || modoCrear) return;

    const editGroup = new L.FeatureGroup();
    const latlngs = zonaSeleccionada.vertices.map((v) => L.latLng(v.lat, v.lng));
    const poly = L.polygon(latlngs, {
      color: zonaSeleccionada.color,
      fillColor: zonaSeleccionada.color,
      fillOpacity: 0.3,
      weight: 3,
    });
    editGroup.addLayer(poly);
    map.addLayer(editGroup);
    editGroupRef.current = editGroup;

    (poly as any).editing.enable();

    const guardar = () => {
      const nuevos = (poly.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));
      onPoligonoEditado(zonaSeleccionada.id, nuevos);
    };
    poly.on("edit", guardar);

    return () => {
      poly.off("edit", guardar);
      try { map.removeLayer(editGroup); } catch {}
      editGroupRef.current = null;
    };
  }, [zonaSeleccionada?.id, modoCrear]);

  return (
    <div className="mapa-zonas-wrap">
      {modoCrear && (
        <div className="mapa-zonas-hint">
          🖊 Hacé click en el mapa para trazar los vértices. Doble click para cerrar la figura.
          <button className="mapa-zonas-cancelar" onClick={onCancelarCreacion}>
            Cancelar
          </button>
        </div>
      )}
      {zonaSeleccionada && !modoCrear && zonaSeleccionada.vertices.length >= 3 && (
        <div className="mapa-zonas-hint mapa-zonas-hint--edit">
          ✏️ Arrastrá los puntos blancos para ajustar <strong>{zonaSeleccionada.name}</strong>.
          Se guarda solo.
        </div>
      )}
      <div ref={containerRef} className="mapa-zonas-container" />
    </div>
  );
}
