// ============================================================
// GestionZonas.tsx — Pestaña de zonas dentro del panel admin
// ============================================================

import { useState, lazy, Suspense } from "react";
import { useZonas } from "@/hooks/useZonas";
import { actualizarZona, duplicarZona, toggleZonaActiva, eliminarZona } from "@/services/zonas.service";
import ZonaFormPanel from "./ZonaFormPanel";
import SembrarZonas from "./SembrarZonas";
import ToastNotif, { useToasts } from "@/components/productos/ToastNotif";
import type { ZonaPoligono, LatLng } from "@/types/zona.types";
import { formatPrecio } from "@/context/CarritoContext";

// Lazy load del mapa para no bloquear el bundle inicial
const MapaZonas = lazy(() => import("./MapaZonas"));

export default function GestionZonas() {
  const { zonas, cargando, error } = useZonas();
  const [sembrado, setSembrado] = useState(false);
  const mostrarSiembra = !cargando && !error && zonas.length === 0 && !sembrado;
  const { toasts, agregar, quitar } = useToasts();

  const [zonaSeleccionada,  setZonaSeleccionada]  = useState<ZonaPoligono | null>(null);
  const [panelAbierto,      setPanelAbierto]       = useState(false);
  const [modoCrear,         setModoCrear]          = useState(false);
  const [verticesNuevos,    setVerticesNuevos]     = useState<LatLng[] | null>(null);
  const [busqueda,          setBusqueda]           = useState("");
  const [vistaActual,       setVistaActual]        = useState<"mapa" | "lista">("mapa");

  const zonasFiltradas = zonas.filter((z) =>
    z.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Crear nueva zona ────────────────────────────────────────
  const handleNuevaZona = () => {
    setZonaSeleccionada(null);
    setVerticesNuevos(null);
    setModoCrear(true);
    setPanelAbierto(true);
    setVistaActual("mapa");
  };

  // ── Click en zona del mapa ──────────────────────────────────
  const handleZonaClick = (zona: ZonaPoligono) => {
    setZonaSeleccionada(zona);
    setPanelAbierto(true);
    setModoCrear(false);
  };

  // ── Polígono recién dibujado ────────────────────────────────
  const handlePoligonoCreado = (vertices: LatLng[]) => {
    setVerticesNuevos(vertices);
    setModoCrear(false);
  };

  // ── Vértices editados en el mapa ────────────────────────────
  const handlePoligonoEditado = async (id: string, vertices: LatLng[]) => {
    try {
      await actualizarZona(id, { vertices });
      agregar("Polígono actualizado ✓", "ok");
    } catch {
      agregar("Error al actualizar el polígono", "error");
    }
  };

  // ── Color cambiado en el panel (preview en tiempo real) ────
  const handleColorChange = async (color: string) => {
    if (zonaSeleccionada) {
      await actualizarZona(zonaSeleccionada.id, { color }).catch(() => {});
    }
  };

  // ── Cerrar panel ────────────────────────────────────────────
  const handleCerrar = () => {
    setPanelAbierto(false);
    setZonaSeleccionada(null);
    setVerticesNuevos(null);
    setModoCrear(false);
  };

  return (
    <div className="gz-root">

      {/* ── Toolbar ── */}
      <div className="gz-toolbar">
        <input
          className="gz-busqueda"
          type="search"
          placeholder="🔍 Buscar zona..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="gz-vista-btns">
          <button
            className={`gz-vista-btn${vistaActual === "mapa" ? " gz-vista-btn--activo" : ""}`}
            onClick={() => setVistaActual("mapa")}
          >🗺 Mapa</button>
          <button
            className={`gz-vista-btn${vistaActual === "lista" ? " gz-vista-btn--activo" : ""}`}
            onClick={() => setVistaActual("lista")}
          >📋 Lista</button>
        </div>
        <button className="gz-btn-nueva" onClick={handleNuevaZona}>
          ➕ Nueva zona
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="gz-stats">
        <div className="gz-stat"><span className="gz-stat-n">{zonas.length}</span><span>Total</span></div>
        <div className="gz-stat"><span className="gz-stat-n gz-stat-n--ok">{zonas.filter(z=>z.active).length}</span><span>Activas</span></div>
        <div className="gz-stat"><span className="gz-stat-n gz-stat-n--warn">{zonas.filter(z=>!z.active).length}</span><span>Inactivas</span></div>
      </div>

      {/* ── Precarga inicial de zonas (solo si no hay ninguna) ── */}
      {mostrarSiembra && (
        <div style={{ padding: "0 16px" }}>
          <SembrarZonas onListo={() => setSembrado(true)} />
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div className="gz-contenido">

        {/* Mapa */}
        {vistaActual === "mapa" && (
          <div className="gz-mapa-area">
            {cargando && <div className="gz-loading-mapa">Cargando mapa...</div>}
            {error && <div className="gp-error">⚠️ {error}</div>}
            <Suspense fallback={<div className="gz-loading-mapa">Inicializando mapa...</div>}>
              <MapaZonas
                zonas={zonasFiltradas}
                zonaSeleccionada={zonaSeleccionada}
                modoCrear={modoCrear}
                onZonaClick={handleZonaClick}
                onPoligonoCreado={handlePoligonoCreado}
                onPoligonoEditado={handlePoligonoEditado}
                onCancelarCreacion={() => { setModoCrear(false); setPanelAbierto(false); }}
              />
            </Suspense>
          </div>
        )}

        {/* Lista */}
        {vistaActual === "lista" && (
          <div className="gz-lista">
            {cargando && <div className="gz-loading-mapa">Cargando...</div>}
            {!cargando && zonasFiltradas.length === 0 && (
              <div className="gp-vacio">
                <span style={{ fontSize: "2rem" }}>🗺</span>
                <p>{zonas.length === 0 ? "No hay zonas. Creá la primera." : "Sin resultados."}</p>
                {zonas.length === 0 && (
                  <button className="gz-btn-nueva" onClick={handleNuevaZona}>Crear primera zona</button>
                )}
              </div>
            )}
            {zonasFiltradas.map((z) => (
              <div
                key={z.id}
                className={`gz-zona-row${zonaSeleccionada?.id === z.id ? " gz-zona-row--sel" : ""}${!z.active ? " gz-zona-row--off" : ""}`}
                onClick={() => handleZonaClick(z)}
              >
                <div className="gz-zona-color" style={{ background: z.color }} />
                <div className="gz-zona-info">
                  <span className="gz-zona-nombre">{z.name}</span>
                  <span className="gz-zona-meta">
                    {z.vertices.length} vértices · Prioridad {z.priority}
                    {!z.active && " · INACTIVA"}
                  </span>
                </div>
                <span className="gz-zona-costo">{formatPrecio(z.cost)}</span>
                <div className="gz-zona-acciones">
                  <button
                    className="gp-accion"
                    onClick={(e) => { e.stopPropagation(); toggleZonaActiva(z.id, !z.active).then(() => agregar(`Zona ${!z.active ? "activada" : "desactivada"} ✓`, "ok")); }}
                    title={z.active ? "Desactivar" : "Activar"}
                  >{z.active ? "🙈" : "✅"}</button>
                  <button
                    className="gp-accion"
                    onClick={(e) => { e.stopPropagation(); duplicarZona(z).then(() => agregar("Duplicada ✓", "ok")); }}
                    title="Duplicar"
                  >📋</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Panel lateral de edición */}
        {panelAbierto && (
          <ZonaFormPanel
            zona={zonaSeleccionada}
            verticesNuevos={verticesNuevos}
            onGuardado={(msg) => agregar(msg, "ok")}
            onEliminar={handleCerrar}
            onCerrar={handleCerrar}
            onColorChange={handleColorChange}
          />
        )}
      </div>

      <ToastNotif toasts={toasts} onRemove={quitar} />
    </div>
  );
}
