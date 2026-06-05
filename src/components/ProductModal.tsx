// ============================================================
// ProductModal.tsx — v2: tamaños en lugar de extras
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { MenuItem, Ingrediente } from "@/data/menu";
import { useCarrito, parsePrecio, formatPrecio } from "@/context/CarritoContext";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const { agregarAlCarrito } = useCarrito();

  const [ingredientesRemovidos, setIngredientesRemovidos] = useState<Ingrediente[]>([]);
  const [tamanioSeleccionado, setTamanioSeleccionado]     = useState<string | null>(null);
  const [observaciones, setObservaciones]                 = useState("");
  const [cantidad, setCantidad]                           = useState(1);
  const [exito, setExito]                                 = useState(false);

  // Reset al abrir — seleccionar "simple" por defecto
  useEffect(() => {
    if (isOpen && item) {
      setIngredientesRemovidos([]);
      setObservaciones("");
      setCantidad(1);
      setExito(false);
      // Default: primer tamaño (simple)
      if (item.tamanios && item.tamanios.length > 0) {
        setTamanioSeleccionado(item.tamanios[0].id);
      } else {
        setTamanioSeleccionado(null);
      }
    }
  }, [isOpen, item?.nombre]);

  // Escape para cerrar
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  const toggleIngrediente = useCallback((ing: Ingrediente) => {
    setIngredientesRemovidos((prev) =>
      prev.some((i) => i.id === ing.id) ? prev.filter((i) => i.id !== ing.id) : [...prev, ing]
    );
  }, []);

  if (!isOpen || !item) return null;

  // Precio: si tiene tamaños usar el seleccionado, si no el base del item
  const tamanioActual = item.tamanios?.find((t) => t.id === tamanioSeleccionado);
  const precioUnit    = tamanioActual ? tamanioActual.precio : parsePrecio(item.precio);
  const precioTotal   = precioUnit * cantidad;

  const handleAgregar = () => {
    if (!item) return;
    agregarAlCarrito(
      item,
      {
        ingredientesRemovidos,
        extrasAgregados: [],
        observaciones: observaciones.trim(),
      },
      cantidad,
      precioUnit
    );
    setExito(true);
    setTimeout(() => onClose(), 700);
  };

  return createPortal(
    <div
      className="pm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Personalizar ${item.nombre}`}
    >
      <div className="pm-container">

        {/* Imagen */}
        <div className="pm-img-wrap">
          {item.img ? (
            <img src={item.img} alt={item.nombre} className="pm-img" loading="lazy" />
          ) : (
            <div className="pm-img-fallback">
              <span>{item.emoji}</span>
            </div>
          )}
          <div className="pm-img-gradient" />
          <button className="pm-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Body scrollable */}
        <div className="pm-body">

          {/* Info */}
          <div className="pm-info">
            <h2 className="pm-nombre">{item.nombre}</h2>
            {item.desc && <p className="pm-desc">{item.desc}</p>}
          </div>

          {/* ── Selector de tamaño ── */}
          {item.tamanios && item.tamanios.length > 0 && (
            <div className="pm-section">
              <div className="pm-section-header">
                <h3 className="pm-section-title">ELEGÍ EL TAMAÑO DE TU BURGER</h3>
                <span className="pm-section-badge">Elegí 1</span>
              </div>
              <div className="pm-tamanios">
                {item.tamanios.map((tam) => {
                  const sel = tamanioSeleccionado === tam.id;
                  return (
                    <label
                      key={tam.id}
                      className={`pm-tamanio${sel ? " pm-tamanio--sel" : ""}`}
                    >
                      <input
                        type="radio"
                        name="tamanio"
                        value={tam.id}
                        checked={sel}
                        onChange={() => setTamanioSeleccionado(tam.id)}
                        className="pm-tamanio-radio"
                      />
                      <span className="pm-tamanio-radio-ui" aria-hidden="true" />
                      <span className="pm-tamanio-nombre">{tam.nombre}</span>
                      <span className="pm-tamanio-precios">
                        {tam.precioAnt && (
                          <span className="pm-tamanio-ant">{formatPrecio(tam.precioAnt)}</span>
                        )}
                        <span className="pm-tamanio-precio">{formatPrecio(tam.precio)}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Ingredientes removibles ── */}
          {(item.ingredientes?.length ?? 0) > 0 && (
            <div className="pm-section">
              <div className="pm-section-header">
                <h3 className="pm-section-title">¿QUERÉS SACARLE ALGO?</h3>
                <span className="pm-section-badge">Elegí hasta {item.ingredientes!.length}</span>
              </div>
              <div className="pm-ing-list">
                {item.ingredientes!.map((ing) => {
                  const removido = ingredientesRemovidos.some((i) => i.id === ing.id);
                  return (
                    <label
                      key={ing.id}
                      className={`pm-ing-row${removido ? " pm-ing-row--sel" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={removido}
                        onChange={() => toggleIngrediente(ing)}
                        className="pm-ing-checkbox"
                      />
                      <span className="pm-ing-check-ui" aria-hidden="true">
                        {removido && (
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4.5L4.5 8L11 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span className="pm-ing-nombre">SIN {ing.nombre.toUpperCase()}</span>
                      <span className="pm-ing-precio">+$0</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="pm-section">
            <h3 className="pm-section-title">Observaciones</h3>
            <textarea
              className="pm-obs"
              placeholder="Ej: bien cocida, aparte la salsa..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pm-footer">
          <div className="pm-qty" role="group" aria-label="Cantidad">
            <button
              className="pm-qty-btn"
              onClick={() => setCantidad((q) => Math.max(1, q - 1))}
              disabled={cantidad <= 1}
              aria-label="Restar"
            >−</button>
            <span className="pm-qty-val" aria-live="polite">{cantidad}</span>
            <button
              className="pm-qty-btn"
              onClick={() => setCantidad((q) => q + 1)}
              aria-label="Sumar"
            >+</button>
          </div>

          <button
            className={`pm-add-btn${exito ? " pm-add-btn--ok" : ""}`}
            onClick={handleAgregar}
            disabled={exito}
          >
            <span>{exito ? "¡Listo! ✓" : "Agregar al pedido"}</span>
            {!exito && <strong>{formatPrecio(precioTotal)}</strong>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
