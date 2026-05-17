// ============================================================
// CheckoutModal.tsx
// Modal profesional de checkout con validaciones + Firebase
// ============================================================

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";
import { guardarPedido, serializarItems } from "@/services/orders.service";
import {
  FORM_CHECKOUT_INICIAL,
  METODOS_PAGO,
  type FormCheckout,
  type ErroresCheckout,
  type MetodoPago,
  type TipoEntrega,
  type ItemPedido,
} from "@/types/order.types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Validaciones ─────────────────────────────────────────────
function validar(form: FormCheckout): ErroresCheckout {
  const errores: ErroresCheckout = {};
  if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
  if (form.tipoEntrega === "delivery") {
    if (!form.telefono.trim()) {
      errores.telefono = "El teléfono es obligatorio";
    } else if (!/^[\d\s\-+()]{7,20}$/.test(form.telefono.trim())) {
      errores.telefono = "Ingresá un teléfono válido";
    }
    if (!form.direccion.trim()) {
      errores.direccion = "La dirección es obligatoria para delivery";
    }
  }
  return errores;
}

// ─── Componente ───────────────────────────────────────────────
export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, vaciarCarrito, cerrarCarrito } = useCarrito();

  const [form, setForm]         = useState<FormCheckout>(FORM_CHECKOUT_INICIAL);
  const [errores, setErrores]   = useState<ErroresCheckout>({});
  const [paso, setPaso]         = useState<"form" | "enviando" | "exito" | "error">("form");
  const [pedidoId, setPedidoId] = useState<string>("");
  const [errorMsg, setErrorMsg]   = useState<string>("");

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setForm(FORM_CHECKOUT_INICIAL);
      setErrores({});
      setPaso("form");
      setPedidoId("");
    }
  }, [isOpen]);

  // Escape para cerrar (solo si no está enviando)
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && paso !== "enviando") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, paso, onClose]);

  // ── Precio calculado ──
  const descuentoPct  = form.metodoPago === "efectivo" ? 10 : 0;
  const montoDescuento = Math.round(subtotal * descuentoPct / 100);
  const total          = subtotal - montoDescuento;

  // ── Handlers ──
  const setField = <K extends keyof FormCheckout>(key: K, val: FormCheckout[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errores[key]) setErrores((e) => ({ ...e, [key]: undefined }));
  };

  const handleEnviar = async () => {
    const errs = validar(form);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    setPaso("enviando");

    try {
      const itemsPedido: ItemPedido[] = items.map((i) => ({
        nombre:         i.nombre ?? "",
        emoji:          i.emoji ?? "",
        imagen:         i.imagen ?? null,
        cantidad:       i.cantidad ?? 1,
        precioBase:     i.precioBase ?? 0,
        precioUnitario: i.precioUnitario ?? 0,
        subtotalItem:   (i.precioUnitario ?? 0) * (i.cantidad ?? 1),
        personalizacion: {
          ingredientesRemovidos: i.personalizacion?.ingredientesRemovidos ?? [],
          extrasAgregados:       i.personalizacion?.extrasAgregados ?? [],
          observaciones:         i.personalizacion?.observaciones ?? "",
        },
      }));

      const id = await guardarPedido({
        cliente: {
          nombre:                 form.nombre.trim() || "",
          telefono:               form.telefono?.trim() || "",
          direccion:              form.tipoEntrega === "retiro" ? "" : (form.direccion?.trim() || ""),
          tipoEntrega:            form.tipoEntrega,
          metodoPago:             form.metodoPago,
          observacionesGenerales: form.observacionesGenerales?.trim() || "",
        },
        items:    serializarItems(itemsPedido) as ItemPedido[],
        subtotal,
        descuento: montoDescuento,
        total,
        estado:   "pendiente",
        fechaCreacion: new Date().toISOString(),
      });

      setPedidoId(id);
      vaciarCarrito();
      cerrarCarrito();
      setPaso("exito");
    } catch (e: any) {
      console.error("Error guardando pedido:", e);
      console.error("Código error:", e?.code);
      console.error("Mensaje error:", e?.message);
      setPaso("error");
      setErrorMsg(e?.message || "Error desconocido");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="co-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && paso !== "enviando") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar pedido"
    >
      <div className="co-container">

        {/* ── HEADER ── */}
        <div className="co-header">
          <h2 className="co-titulo">
            {paso === "exito" ? "¡Pedido recibido! 🎉" : "Finalizar pedido"}
          </h2>
          {paso !== "enviando" && (
            <button className="co-cerrar" onClick={onClose} aria-label="Cerrar">✕</button>
          )}
        </div>

        {/* ══ PASO: FORMULARIO ══ */}
        {paso === "form" && (
          <>
            <div className="co-body">

              {/* Resumen rápido */}
              <div className="co-resumen">
                <span className="co-resumen-cant">{items.length} {items.length === 1 ? "producto" : "productos"}</span>
                <span className="co-resumen-subtotal">{formatPrecio(subtotal)}</span>
              </div>

              {/* ── Tipo de entrega ── */}
              <div className="co-field-group">
                <label className="co-label">Tipo de entrega</label>
                <div className="co-toggle-row">
                  {(["delivery", "retiro"] as TipoEntrega[]).map((tipo) => (
                    <button
                      key={tipo}
                      className={`co-toggle-btn${form.tipoEntrega === tipo ? " co-toggle-btn--activo" : ""}`}
                      onClick={() => setField("tipoEntrega", tipo)}
                      type="button"
                    >
                      {tipo === "delivery" ? "🛵 Delivery" : "🥡 Takeaway"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Nombre ── */}
              <div className="co-field-group">
                <label className="co-label" htmlFor="co-nombre">Nombre *</label>
                <input
                  id="co-nombre"
                  className={`co-input${errores.nombre ? " co-input--error" : ""}`}
                  type="text"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  maxLength={80}
                />
                {errores.nombre && <span className="co-error">{errores.nombre}</span>}
              </div>

              {/* ── Teléfono (solo delivery) ── */}
              {form.tipoEntrega === "delivery" && (
              <div className="co-field-group">
                <label className="co-label" htmlFor="co-telefono">Teléfono *</label>
                <input
                  id="co-telefono"
                  className={`co-input${errores.telefono ? " co-input--error" : ""}`}
                  type="tel"
                  placeholder="Ej: 011 1234-5678"
                  value={form.telefono}
                  onChange={(e) => setField("telefono", e.target.value)}
                  maxLength={20}
                />
                {errores.telefono && <span className="co-error">{errores.telefono}</span>}
              </div>
              )}

              {/* ── Dirección (solo delivery) ── */}
              {form.tipoEntrega === "delivery" && (
                <div className="co-field-group">
                  <label className="co-label" htmlFor="co-direccion">Dirección *</label>
                  <input
                    id="co-direccion"
                    className={`co-input${errores.direccion ? " co-input--error" : ""}`}
                    type="text"
                    placeholder="Calle, número, piso/depto"
                    value={form.direccion}
                    onChange={(e) => setField("direccion", e.target.value)}
                    maxLength={120}
                  />
                  {errores.direccion && <span className="co-error">{errores.direccion}</span>}
                </div>
              )}

              {/* ── Método de pago ── */}
              <div className="co-field-group">
                <label className="co-label">Método de pago</label>
                <div className="co-pago-grid">
                  {(Object.entries(METODOS_PAGO) as [MetodoPago, typeof METODOS_PAGO[MetodoPago]][]).map(([key, val]) => (
                    <button
                      key={key}
                      className={`co-pago-btn${form.metodoPago === key ? " co-pago-btn--activo" : ""}`}
                      onClick={() => setField("metodoPago", key)}
                      type="button"
                    >
                      <span className="co-pago-emoji">{val.emoji}</span>
                      <span className="co-pago-label">{val.label}</span>
                      {val.descuento && (
                        <span className="co-pago-badge">-{val.descuento}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Observaciones ── */}
              <div className="co-field-group">
                <label className="co-label" htmlFor="co-obs">Observaciones generales</label>
                <textarea
                  id="co-obs"
                  className="co-textarea"
                  placeholder="Ej: timbre roto, llegar antes de las 21hs..."
                  value={form.observacionesGenerales}
                  onChange={(e) => setField("observacionesGenerales", e.target.value)}
                  maxLength={200}
                  rows={2}
                />
              </div>

            </div>

            {/* ── FOOTER con totales ── */}
            <div className="co-footer">
              <div className="co-totales">
                <div className="co-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrecio(subtotal)}</span>
                </div>
                {montoDescuento > 0 && (
                  <div className="co-total-row co-total-row--descuento">
                    <span>Descuento efectivo (10%)</span>
                    <span>- {formatPrecio(montoDescuento)}</span>
                  </div>
                )}
                <div className="co-total-row co-total-row--total">
                  <span>Total</span>
                  <strong>{formatPrecio(total)}</strong>
                </div>
              </div>
              <button className="co-btn-confirmar" onClick={handleEnviar}>
                Confirmar pedido →
              </button>
            </div>
          </>
        )}

        {/* ══ PASO: ENVIANDO ══ */}
        {paso === "enviando" && (
          <div className="co-estado">
            <div className="co-spinner" aria-label="Enviando pedido" />
            <p>Guardando tu pedido...</p>
          </div>
        )}

        {/* ══ PASO: ÉXITO ══ */}
        {paso === "exito" && (
          <div className="co-estado">
            <div className="co-exito-icono">🎉</div>
            <h3>¡Pedido confirmado!</h3>
            <p>Tu pedido fue registrado correctamente.</p>
            {pedidoId && (
              <p className="co-pedido-id">
                ID: <code>{pedidoId.slice(0, 8).toUpperCase()}</code>
              </p>
            )}
            {form.tipoEntrega === "delivery" && form.telefono && (
              <p className="co-exito-sub">
                Nos comunicaremos al <strong>{form.telefono}</strong> para confirmar.
              </p>
            )}
            <button className="co-btn-confirmar" onClick={onClose}>
              ¡Perfecto! 🍔
            </button>
          </div>
        )}

        {/* ══ PASO: ERROR ══ */}
        {paso === "error" && (
          <div className="co-estado">
            <div className="co-exito-icono">😕</div>
            <h3>Algo salió mal</h3>
            <p>No pudimos registrar tu pedido. Intentá de nuevo o contactanos por WhatsApp.</p>
          {errorMsg && <p style={{fontSize:"11px",color:"#e05252",fontFamily:"monospace",wordBreak:"break-all",maxWidth:"300px"}}>{errorMsg}</p>}
            <div className="co-error-btns">
              <button className="co-btn-confirmar" onClick={() => setPaso("form")}>
                Reintentar
              </button>
              <button className="co-btn-secundario" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
