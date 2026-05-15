import { useState } from "react";
import type { MenuItem } from "@/data/menu";
import { useCarrito, parsePrecio } from "@/context/CarritoContext";

type Props = { item: MenuItem };

export default function MenuCard({ item }: Props) {
  const { agregarAlCarrito } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  const handleAgregar = () => {
    agregarAlCarrito({
      id: item.nombre, // nombre como id único (son todos distintos)
      nombre: item.nombre,
      precio: parsePrecio(item.precio),
      precioStr: item.precio,
      imagen: item.img,
      emoji: item.emoji,
    });
    // Feedback visual durante 1.2 segundos
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <article className={`ab-card ${item.destacado ? "ab-card-hot" : ""}`}>
      <div className="ab-card-img">
        {item.img ? (
          <img src={item.img} alt={item.nombre} loading="lazy" />
        ) : (
          <span className="ab-emoji" aria-hidden="true">{item.emoji}</span>
        )}
        <div className="ab-precio-wrap">
          {item.precioAnt && <span className="ab-precio-ant">{item.precioAnt}</span>}
          <span className="ab-precio">{item.precio}</span>
        </div>
      </div>
      <div className="ab-card-body">
        <h3>{item.nombre}</h3>
        {item.desc && <p>{item.desc}</p>}
        <div className="ab-card-tags">
          {item.tag && <span className="ab-tag-chip">{item.tag}</span>}
        </div>
        <div className="ab-card-actions">
          {/* Botón principal: agregar al carrito */}
          <button
            className={`btn-agregar-carrito${agregado ? " btn-agregar-carrito--agregado" : ""}`}
            onClick={handleAgregar}
            disabled={agregado}
            aria-label={`Agregar ${item.nombre} al carrito`}
          >
            {agregado ? "✓ Agregado" : "🛒 Agregar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
}
