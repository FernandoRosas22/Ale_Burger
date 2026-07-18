// ============================================================
// ZonaFormPanel.tsx — Panel lateral para editar propiedades de zona
// ============================================================

import { useState, useEffect } from "react";
import { COLORES_PRESET, type ZonaPoligono, type FormZona } from "@/types/zona.types";
import { actualizarZona, crearZona, eliminarZona, duplicarZona, toggleZonaActiva } from "@/services/zonas.service";
import { formatPrecio } from "@/context/CarritoContext";
import ToastNotif, { useToasts } from "@/components/productos/ToastNotif";

interface ZonaFormPanelProps {
  zona: ZonaPoligono | null;       // null = nueva zona en creación
  verticesNuevos: { lat: number; lng: number }[] | null; // vértices recién dibujados
  onGuardado: (msg: string) => void;
  onEliminar: () => void;
  onCerrar: () => void;
  onColorChange: (color: string) => void;
}

export default function ZonaFormPanel({
  zona, verticesNuevos, onGuardado, onEliminar, onCerrar, onColorChange,
}: ZonaFormPanelProps) {
  const [nombre,   setNombre]   = useState("");
  const [costo,    setCosto]    = useState(2000);
  const [color,    setColor]    = useState("#F97316");
  const [prioridad,setPrioridad]= useState(1);
  const [guardando,setGuardando]= useState(false);
  const [confirmElim, setConfirmElim] = useState(false);
  const { toasts, agregar, quitar } = useToasts();

  // Poblar form al seleccionar zona existente
  useEffect(() => {
    if (zona) {
      setNombre(zona.name);
      setCosto(zona.cost);
      setColor(zona.color);
      setPrioridad(zona.priority);
      setConfirmElim(false);
    } else {
      setNombre("");
      setCosto(2000);
      setColor("#F97316");
      setPrioridad(1);
    }
  }, [zona?.id]);

  const handleColorPick = (c: string) => {
    setColor(c);
    onColorChange(c);
  };

  const esNueva = !zona;
  const tieneVertices = esNueva
    ? (verticesNuevos?.length ?? 0) >= 3
    : (zona?.vertices.length ?? 0) >= 3;

  const handleGuardar = async () => {
    if (!nombre.trim()) { agregar("El nombre es obligatorio", "error"); return; }
    if (costo < 0)      { agregar("El costo no puede ser negativo", "error"); return; }
    if (esNueva && !tieneVertices) {
      agregar("Dibujá el polígono en el mapa primero", "error"); return;
    }
    setGuardando(true);
    try {
      if (esNueva) {
        await crearZona({
          name: nombre.trim(), color, cost: costo,
          priority: prioridad, active: true,
          vertices: verticesNuevos!,
        });
        onGuardado("Zona creada ✓");
      } else {
        await actualizarZona(zona!.id, {
          name: nombre.trim(), color, cost: costo, priority: prioridad,
        });
        onGuardado("Zona actualizada ✓");
      }
      onCerrar();
    } catch (e: any) {
      agregar("Error: " + e.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!zona) return;
    setGuardando(true);
    try {
      await eliminarZona(zona.id);
      onGuardado("Zona eliminada");
      onEliminar();
      onCerrar();
    } catch (e: any) {
      agregar("Error al eliminar: " + e.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleDuplicar = async () => {
    if (!zona) return;
    try {
      await duplicarZona(zona);
      agregar(`"${zona.name}" duplicada (inactiva) ✓`, "ok");
      onCerrar();
    } catch { agregar("Error al duplicar", "error"); }
  };

  const handleToggle = async () => {
    if (!zona) return;
    try {
      await toggleZonaActiva(zona.id, !zona.active);
      agregar(`Zona ${!zona.active ? "activada" : "desactivada"} ✓`, "ok");
    } catch { agregar("Error", "error"); }
  };

  return (
    <div className="zfp-root">
      <div className="zfp-header">
        <h3 className="zfp-titulo">
          {esNueva ? "➕ Nueva zona" : `✏️ ${zona?.name || "Zona"}`}
        </h3>
        <button className="zfp-cerrar" onClick={onCerrar} disabled={guardando}>✕</button>
      </div>

      <div className="zfp-body">
        {/* Nombre */}
        <div className="zfp-field">
          <label className="zfp-label">Nombre *</label>
          <input
            className="zfp-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: ZONA 1 — Ferrari Norte"
            maxLength={50}
            disabled={guardando}
          />
        </div>

        {/* Costo */}
        <div className="zfp-field">
          <label className="zfp-label">Costo de envío *</label>
          <input
            className="zfp-input"
            type="number"
            min={0}
            step={100}
            value={costo || ""}
            onChange={(e) => setCosto(Number(e.target.value))}
            placeholder="2000"
            disabled={guardando}
          />
          {costo > 0 && (
            <span className="zfp-preview">{formatPrecio(costo)}</span>
          )}
        </div>

        {/* Prioridad */}
        <div className="zfp-field">
          <label className="zfp-label">Prioridad</label>
          <input
            className="zfp-input"
            type="number"
            min={1}
            value={prioridad}
            onChange={(e) => setPrioridad(Number(e.target.value))}
            disabled={guardando}
          />
          <span className="zfp-hint">Menor número = se evalúa primero si hay zonas superpuestas</span>
        </div>

        {/* Color */}
        <div className="zfp-field">
          <label className="zfp-label">Color del polígono</label>
          <div className="zfp-colores">
            {COLORES_PRESET.map((c) => (
              <button
                key={c}
                className={`zfp-color-btn${color === c ? " zfp-color-btn--activo" : ""}`}
                style={{ background: c }}
                onClick={() => handleColorPick(c)}
                disabled={guardando}
                title={c}
              />
            ))}
            {/* Color personalizado */}
            <input
              type="color"
              className="zfp-color-custom"
              value={color}
              onChange={(e) => handleColorPick(e.target.value)}
              disabled={guardando}
              title="Color personalizado"
            />
          </div>
        </div>

        {/* Estado del polígono */}
        {esNueva && (
          <div className={`zfp-estado-poligono${tieneVertices ? " zfp-estado-poligono--ok" : ""}`}>
            {tieneVertices
              ? `✓ Polígono dibujado (${verticesNuevos!.length} vértices)`
              : "⚠ Todavía no dibujaste el polígono en el mapa"}
          </div>
        )}

        {/* Acciones secundarias (solo zona existente) */}
        {!esNueva && (
          <div className="zfp-acciones">
            <button className="zfp-btn-sec" onClick={handleToggle} disabled={guardando}>
              {zona?.active ? "🙈 Desactivar zona" : "✅ Activar zona"}
            </button>
            <button className="zfp-btn-sec" onClick={handleDuplicar} disabled={guardando}>
              📋 Duplicar
            </button>
          </div>
        )}

        {/* Confirmar eliminación */}
        {!esNueva && (
          confirmElim ? (
            <div className="zfp-confirm-elim">
              <p>¿Eliminar "{zona?.name}"? Esta acción no se puede deshacer.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="zfp-btn-elim-confirm" onClick={handleEliminar} disabled={guardando}>
                  {guardando ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button className="zfp-btn-sec" onClick={() => setConfirmElim(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button className="zfp-btn-elim" onClick={() => setConfirmElim(true)} disabled={guardando}>
              🗑 Eliminar zona
            </button>
          )
        )}
      </div>

      <div className="zfp-footer">
        <button className="zfp-btn-cancelar" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </button>
        <button className="zfp-btn-guardar" onClick={handleGuardar} disabled={guardando || (esNueva && !tieneVertices)}>
          {guardando ? "Guardando..." : esNueva ? "Crear zona" : "Guardar cambios"}
        </button>
      </div>

      <ToastNotif toasts={toasts} onRemove={quitar} />
    </div>
  );
}
