// ============================================================
// Carrito.tsx
// Panel lateral del carrito (drawer) con animación suave
// ============================================================

import { useCarrito, formatPrecio } from "@/context/CarritoContext";
import { whatsappLink } from "@/utils/contact";

export default function Carrito() {
  const {
    items,
    abierto,
    subtotal,
    agregarAlCarrito,
    quitarUno,
    eliminarItem,
    vaciarCarrito,
    cerrarCarrito,
  } = useCarrito();

  const handleWhatsApp = () => {
    if (items.length === 0) return;
    const lineas = items
      .map((i) => `• ${i.cantidad}x ${i.nombre} — ${formatPrecio(i.precio * i.cantidad)}`)
      .join("\n");
    const msg = `Hola AleBurgers! 🍔 Quiero hacer este pedido:\n\n${lineas}\n\n*Total: ${formatPrecio(subtotal)}*\n\n¿Está disponible?`;
    window.open(whatsappLink(msg), "_blank");
  };

  return (
    <>
      {/* Overlay oscuro detrás del panel */}
      <div
        className={`carrito-overlay${abierto ? " carrito-overlay--visible" : ""}`}
        onClick={cerrarCarrito}
        aria-hidden="true"
      />

      {/* Panel lateral */}
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
          <button
            className="carrito-cerrar"
            onClick={cerrarCarrito}
            aria-label="Cerrar carrito"
          >
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
              {items.map((item) => (
                <li key={item.id} className="carrito-item">
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
                    <span className="carrito-item-precio-unit">{formatPrecio(item.precio)} c/u</span>
                  </div>

                  {/* Controles cantidad */}
                  <div className="carrito-item-controles">
                    <button
                      className="carrito-btn-cantidad"
                      onClick={() => quitarUno(item.id)}
                      aria-label={`Quitar un ${item.nombre}`}
                    >
                      −
                    </button>
                    <span className="carrito-cantidad" aria-live="polite">{item.cantidad}</span>
                    <button
                      className="carrito-btn-cantidad"
                      onClick={() => agregarAlCarrito({
                        id: item.id,
                        nombre: item.nombre,
                        precio: item.precio,
                        precioStr: item.precioStr,
                        imagen: item.imagen,
                        emoji: item.emoji,
                      })}
                      aria-label={`Agregar otro ${item.nombre}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="carrito-item-subtotal">
                    <span>{formatPrecio(item.precio * item.cantidad)}</span>
                    <button
                      className="carrito-btn-eliminar"
                      onClick={() => eliminarItem(item.id)}
                      aria-label={`Eliminar ${item.nombre} del carrito`}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
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
            <p className="carrito-footer-nota">
              * 10% OFF pagando en efectivo
            </p>
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
