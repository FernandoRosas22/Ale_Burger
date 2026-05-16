// ============================================================
// Carrito.tsx — Panel lateral con checkout integrado
// ============================================================

import { useState } from "react";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";
import { whatsappLink } from "@/utils/contact";
import CheckoutModal from "./CheckoutModal";

export default function Carrito() {
  const {
    items,
    abierto,
    subtotal,
    quitarUno,
    eliminarItem,
    vaciarCarrito,
    cerrarCarrito,
  } = useCarrito();

  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  const handleWhatsApp = () => {
    if (items.length === 0) return;
    const lineas = items.map((i) => {
      const { ingredientesRemovidos, extrasAgregados, observaciones } = i.personalizacion;
      let d = `• ${i.cantidad}x ${i.nombre} — ${formatPrecio(i.precioUnitario * i.cantidad)}`;
      if (ingredientesRemovidos.length > 0)
        d += `\n   🚫 Sin: ${ingredientesRemovidos.map((r) => r.nombre).join(", ")}`;
      if (extrasAgregados.length > 0)
        d += `\n   ➕ Con: ${extrasAgregados.map((e) => e.nombre).join(", ")}`;
      if (observaciones) d += `\n   📝 ${observaciones}`;
      return d;
    });
    const msg = `Hola AleBurgers! 🍔 Quiero hacer este pedido:\n\n${lineas.join("\n\n")}\n\n*Total: ${formatPrecio(subtotal)}*\n\n¿Está disponible?`;
    window.open(whatsappLink(msg), "_blank");
  };

  return (
    <>
      <div
        className={`carrito-overlay${abierto ? " carrito-overlay--visible" : ""}`}
        onClick={cerrarCarrito}
        aria-hidden="true"
      />

      <aside
        className={`carrito-panel${abierto ? " carrito-panel--abierto" : ""}`}
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="carrito-header">
          <h2 className="carrito-titulo">
            <span aria-hidden="true">🛒</span> Tu pedido
          </h2>
          <button className="carrito-cerrar" onClick={cerrarCarrito} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="carrito-body">
          {items.length === 0 ? (
            <div className="carrito-vacio">
              <span className="carrito-vacio-emoji" aria-hidden="true">🍔</span>
              <p>Tu carrito está vacío</p>
              <small>Agregá una burger y empecemos</small>
            </div>
          ) : (
            <ul className="carrito-lista" aria-label="Productos en el carrito">
              {items.map((item) => {
                const { ingredientesRemovidos, extrasAgregados, observaciones } = item.personalizacion;
                const tieneDetalle =
                  ingredientesRemovidos.length > 0 || extrasAgregados.length > 0 || !!observaciones;

                return (
                  <li key={item.cartId} className="carrito-item">
                    <div className="carrito-item-img-wrap">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="carrito-item-img" loading="lazy" />
                      ) : (
                        <span className="carrito-item-emoji" aria-hidden="true">{item.emoji}</span>
                      )}
                    </div>

                    <div className="carrito-item-info">
                      <span className="carrito-item-nombre">{item.nombre}</span>
                      <span className="carrito-item-precio-unit">{formatPrecio(item.precioUnitario)} c/u</span>

                      {tieneDetalle && (
                        <div className="carrito-item-custom">
                          {ingredientesRemovidos.length > 0 && (
                            <span className="carrito-custom-tag carrito-custom-tag--sin">
                              🚫 Sin: {ingredientesRemovidos.map((r) => r.nombre).join(", ")}
                            </span>
                          )}
                          {extrasAgregados.length > 0 && (
                            <span className="carrito-custom-tag carrito-custom-tag--con">
                              ➕ {extrasAgregados.map((e) => e.nombre).join(", ")}
                            </span>
                          )}
                          {observaciones && (
                            <span className="carrito-custom-tag carrito-custom-tag--obs">
                              📝 {observaciones}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="carrito-item-controles">
                      <button
                        className="carrito-btn-cantidad"
                        onClick={() => quitarUno(item.cartId)}
                        aria-label={`Quitar un ${item.nombre}`}
                      >−</button>
                      <span className="carrito-cantidad" aria-live="polite">{item.cantidad}</span>
                      <button
                        className="carrito-btn-cantidad"
                        disabled
                        style={{ opacity: 0.3, cursor: "not-allowed" }}
                        title="Para agregar más, usá el menú"
                      >+</button>
                    </div>

                    <div className="carrito-item-subtotal">
                      <span>{formatPrecio(item.precioUnitario * item.cantidad)}</span>
                      <button
                        className="carrito-btn-eliminar"
                        onClick={() => eliminarItem(item.cartId)}
                        aria-label={`Eliminar ${item.nombre}`}
                        title="Eliminar"
                      >🗑</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="carrito-footer">
            <div className="carrito-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrecio(subtotal)}</strong>
            </div>
            <p className="carrito-footer-nota">* 10% OFF pagando en efectivo</p>

            {/* CTA principal → checkout */}
            <button
              className="carrito-btn-pedido"
              onClick={() => setCheckoutAbierto(true)}
            >
              Finalizar pedido 🛵
            </button>

            {/* Alternativa rápida → WhatsApp */}
            <button className="carrito-btn-wsp" onClick={handleWhatsApp}>
              Pedir por WhatsApp 🟢
            </button>

            <button className="carrito-btn-vaciar" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>

      {/* Checkout modal — fuera del aside para no tener z-index issues */}
      <CheckoutModal
        isOpen={checkoutAbierto}
        onClose={() => setCheckoutAbierto(false)}
      />
    </>
  );
}
