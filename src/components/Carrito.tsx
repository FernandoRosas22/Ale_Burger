// ============================================================
// Carrito.tsx
// Panel lateral del carrito con personalización de ítems
// ============================================================

import { useCarrito, formatPrecio } from "@/context/CarritoContext";
import { whatsappLink } from "@/utils/contact";

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

  const handleWhatsApp = () => {
    if (items.length === 0) return;

    const lineas = items.map((i) => {
      const { ingredientesRemovidos, extrasAgregados, observaciones } = i.personalizacion;

      let detalle = `• ${i.cantidad}x ${i.nombre} — ${formatPrecio(i.precioUnitario * i.cantidad)}`;

      if (ingredientesRemovidos.length > 0) {
        detalle += `\n   🚫 Sin: ${ingredientesRemovidos.map((r) => r.nombre).join(", ")}`;
      }
      if (extrasAgregados.length > 0) {
        detalle += `\n   ➕ Con: ${extrasAgregados.map((e) => e.nombre).join(", ")}`;
      }
      if (observaciones) {
        detalle += `\n   📝 ${observaciones}`;
      }

      return detalle;
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
                  ingredientesRemovidos.length > 0 ||
                  extrasAgregados.length > 0 ||
                  !!observaciones;

                return (
                  <li key={item.cartId} className="carrito-item">
                    {/* Imagen o emoji */}
                    <div className="carrito-item-img-wrap">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="carrito-item-img" loading="lazy" />
                      ) : (
                        <span className="carrito-item-emoji" aria-hidden="true">{item.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="carrito-item-info">
                      <span className="carrito-item-nombre">{item.nombre}</span>
                      <span className="carrito-item-precio-unit">{formatPrecio(item.precioUnitario)} c/u</span>

                      {/* Personalización */}
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

                    {/* Controles cantidad */}
                    <div className="carrito-item-controles">
                      <button
                        className="carrito-btn-cantidad"
                        onClick={() => quitarUno(item.cartId)}
                        aria-label={`Quitar un ${item.nombre}`}
                      >−</button>
                      <span className="carrito-cantidad" aria-live="polite">{item.cantidad}</span>
                      <button
                        className="carrito-btn-cantidad"
                        onClick={() => {
                          // Para agregar más del mismo ítem ya personalizado, sumamos cantidad
                          // dispatching QUITAR_UNO en negativo no existe, así lo hacemos desde fuera:
                          // En este diseño, "+" en carrito = duplicar el mismo item con su personalización
                          // Para simplicidad, solo sumamos uno más con el mismo cartId
                          // La forma correcta es: dispatch UPDATE_CANTIDAD (no implementado aquí)
                          // Alternativa: el usuario vuelve al menú y agrega de nuevo.
                          // Por coherencia con el diseño actual, el "+" re-abre sería complejo;
                          // dejamos solo quitar y eliminar en carrito, el usuario agrega desde el menú.
                        }}
                        aria-label={`Agregar otro ${item.nombre}`}
                        style={{ opacity: 0.3, cursor: "not-allowed" }}
                        disabled
                        title="Para agregar más, usá el menú"
                      >+</button>
                    </div>

                    {/* Subtotal + eliminar */}
                    <div className="carrito-item-subtotal">
                      <span>{formatPrecio(item.precioUnitario * item.cantidad)}</span>
                      <button
                        className="carrito-btn-eliminar"
                        onClick={() => eliminarItem(item.cartId)}
                        aria-label={`Eliminar ${item.nombre} del carrito`}
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
            <button className="carrito-btn-pedido" onClick={handleWhatsApp}>
              Pedir por WhatsApp 🟢
            </button>
            <button className="carrito-btn-vaciar" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
