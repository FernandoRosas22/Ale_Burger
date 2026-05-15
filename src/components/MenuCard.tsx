import type { MenuItem } from "@/data/menu";

type Props = {
  item: MenuItem;
  onAbrirModal: (item: MenuItem) => void;
};

export default function MenuCard({ item, onAbrirModal }: Props) {
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
          <button
            className="btn-agregar-carrito"
            onClick={() => onAbrirModal(item)}
            aria-label={`Personalizar y agregar ${item.nombre}`}
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
