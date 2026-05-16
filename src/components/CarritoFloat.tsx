import { useCarrito } from "@/context/CarritoContext";

export default function CarritoFloat() {
  const { totalItems, toggleCarrito } = useCarrito();

  return (
    <button
      className="ab-carrito-float"
      onClick={toggleCarrito}
      aria-label={`Abrir carrito — ${totalItems} producto${totalItems !== 1 ? "s" : ""}`}
      title="Ver carrito"
    >
      <span className="ab-carrito-float-icon">🛒</span>
      {totalItems > 0 && (
        <span className="ab-carrito-float-badge" aria-hidden="true">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
