import type { MenuItem } from "@/data/menu";
import { PEDIDOS_URL, whatsappLink } from "@/utils/contact";

type Props = { item: MenuItem };

export default function MenuCard({ item }: Props) {
  const orderViaWhatsApp = () =>
    window.open(
      whatsappLink(`Hola AleBurgers! 🍔 Quiero pedir 1x ${item.nombre} (${item.precio}). ¿Está disponible?`),
      "_blank",
    );

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
          <button className="ab-card-btn" onClick={orderViaWhatsApp}>🛒 WhatsApp</button>
          <a className="ab-card-btn ab-card-btn-alt" href={PEDIDOS_URL} target="_blank" rel="noreferrer">
            Pedir online
          </a>
        </div>
      </div>
    </article>
  );
}
