// ============================================================
// ProductModal.tsx
// Modal de personalización de producto antes de agregar al carrito
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { MenuItem, Ingrediente, Extra } from "@/data/menu";
import { useCarrito, parsePrecio, formatPrecio } from "@/context/CarritoContext";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const { agregarAlCarrito } = useCarrito();

  const [ingredientesRemovidos, setIngredientesRemovidos] = useState<Ingrediente[]>([]);
  const [extrasSeleccionados, setExtrasSeleccionados]     = useState<Extra[]>([]);
  const [observaciones, setObservaciones]                 = useState("");
  const [cantidad, setCantidad]                           = useState(1);
  const [exito, setExito]                                 = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setIngredientesRemovidos([]);
      setExtrasSeleccionados([]);
      setObservaciones("");
      setCantidad(1);
      setExito(false);
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

  const toggleExtra = useCallback((ext: Extra) => {
    setExtrasSeleccionados((prev) =>
      prev.some((e) => e.id === ext.id) ? prev.filter((e) => e.id !== ext.id) : [...prev, ext]
    );
  }, []);

  if (!isOpen || !item) return null;

  const precioBase   = parsePrecio(item.precio);
  const extrasTotal  = extrasSeleccionados.reduce((s, e) => s + e.precio, 0);
  const precioUnit   = precioBase + extrasTotal;
  const precioTotal  = precioUnit * cantidad;

  const tienePersonalizacion = (item.ingredientes?.length ?? 0) > 0 || (item.extras?.length ?? 0) > 0;

  const handleAgregar = () => {
    if (!item) return;
    agregarAlCarrito(
      item,
      {
        ingredientesRemovidos,
        extrasAgregados: extrasSeleccionados,
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
            <span className="pm-precio-base">Precio base: {formatPrecio(precioBase)}</span>
          </div>

          {/* Ingredientes removibles */}
          {(item.ingredientes?.length ?? 0) > 0 && (
            <div className="pm-section">
              <h3 className="pm-section-title">Sacar ingredientes</h3>
              <div className="pm-chips">
                {item.ingredientes!.map((ing) => {
                  const removido = ingredientesRemovidos.some((i) => i.id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      className={`pm-chip${removido ? " pm-chip--removido" : ""}`}
                      onClick={() => toggleIngrediente(ing)}
                      aria-pressed={removido}
                    >
                      <span className="pm-chip-icon">{removido ? "✕" : "✓"}</span>
                      {ing.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras */}
          {(item.extras?.length ?? 0) > 0 && (
            <div className="pm-section">
              <h3 className="pm-section-title">Agregar extras</h3>
              <div className="pm-extras">
                {item.extras!.map((ext) => {
                  const sel = extrasSeleccionados.some((e) => e.id === ext.id);
                  return (
                    <div
                      key={ext.id}
                      className={`pm-extra${sel ? " pm-extra--sel" : ""}`}
                      onClick={() => toggleExtra(ext)}
                      role="checkbox"
                      aria-checked={sel}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleExtra(ext); }}
                    >
                      <div className="pm-extra-left">
                        <div className="pm-checkbox">
                          {sel && (
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4.5L4.5 8L11 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="pm-extra-nombre">{ext.nombre}</span>
                      </div>
                      <span className="pm-extra-precio">+{formatPrecio(ext.precio)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observaciones — siempre visible */}
          <div className="pm-section">
            <h3 className="pm-section-title">
              {tienePersonalizacion ? "Observaciones" : "¿Alguna aclaración?"}
            </h3>
            <textarea
              className="pm-obs"
              placeholder="Ej: sin ketchup, bien cocida, aparte la salsa..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pm-footer">
          {/* Cantidad */}
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

          {/* Agregar */}
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
