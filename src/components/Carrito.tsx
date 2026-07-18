import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";
import { useStore } from "@/context/StoreContext";
import CheckoutModal from "./CheckoutModal";
import ZonaSelector from "./ZonaSelector";

export default function Carrito() {
  const [descuentosActivos, setDescuentosActivos] = useState<{emoji:string; titulo:string}[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (snap) => {
      if (snap.exists()) {
        const d = (snap.data()?.descuentos ?? []) as {activo:boolean; emoji:string; titulo:string}[];
        setDescuentosActivos(d.filter((x) => x.activo));
      }
    });
    return () => unsub();
  }, []);
  const {
    items,
    abierto,
    subtotal,
    costoEnvio,
    total,
    zonaEnvio,
    quitarUno,
    eliminarItem,
    vaciarCarrito,
    cerrarCarrito,
  } = useCarrito();

  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const { abierto: localAbierto } = useStore();

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
            <>
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

              {/* Selector de zona */}
              <ZonaSelector />
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="carrito-footer">

            {/* Resumen de costos */}
            <div className="carrito-resumen">
              <div className="carrito-resumen__fila">
                <span>Subtotal</span>
                <span>{formatPrecio(subtotal)}</span>
              </div>
              <div className="carrito-resumen__fila">
                <span>Envío — {zonaEnvio.nombre}</span>
                <span>{costoEnvio === 0 ? "Gratis" : formatPrecio(costoEnvio)}</span>
              </div>
              <div className="carrito-resumen__fila carrito-resumen__fila--total">
                <span>Total</span>
                <span>{formatPrecio(total)}</span>
              </div>
            </div>

            {descuentosActivos.length > 0 && (
              <div className="carrito-descuentos">
                {descuentosActivos.map((d, i) => (
                  <p key={i} className="carrito-footer-nota">{d.emoji} {d.titulo}</p>
                ))}
              </div>
            )}

            <button
              className="carrito-btn-pedido"
              onClick={() => localAbierto && setCheckoutAbierto(true)}
              disabled={!localAbierto}
              style={!localAbierto ? { opacity: 0.4, cursor: "not-allowed" } : {}}
              title={!localAbierto ? "El local está cerrado" : ""}
            >
              {localAbierto ? "Finalizar pedido 🛵" : "🔒 Local cerrado"}
            </button>

            <button className="carrito-btn-vaciar" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>

      <CheckoutModal
        isOpen={checkoutAbierto}
        onClose={() => setCheckoutAbierto(false)}
      />
    </>
  );
}
