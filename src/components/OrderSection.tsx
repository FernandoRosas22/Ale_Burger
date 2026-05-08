import WhatsAppIcon from "./WhatsAppIcon";
import { PEDIDOS_URL, whatsappLink } from "@/utils/contact";

export default function OrderSection() {
  return (
    <section id="pedidos" className="ab-section">
      <div className="ab-pedidos-inner">
        <p className="ab-section-tag">¿Querés comer?</p>
        <h2 className="ab-section-title">HACÉ TU <span>PEDIDO</span></h2>
        <p>Pedí por WhatsApp y recibí tu burger favorita directo en tu puerta.</p>
        <div className="ab-pedidos-card">
          <div className="ab-wsp-icon"><WhatsAppIcon size={40} /></div>
          <h3>PEDÍ POR WHATSAPP</h3>
          <p>Mandanos un mensaje con tu pedido. Estamos disponibles todos los días.</p>
          <div className="ab-chips">
            <span className="ab-chip">🕐 JUEVES A LUNES</span>
            <span className="ab-chip">🕢 19:30 A 23:30hs</span>
          </div>
          <a
            href={whatsappLink("Hola AleBurgers! Quiero hacer un pedido 🍔")}
            target="_blank"
            rel="noreferrer"
            className="ab-btn-wsp"
          >
            Pedir por WhatsApp
          </a>
          <a href={PEDIDOS_URL} target="_blank" rel="noreferrer" className="ab-btn-online">
            🛍️ Pedir online (10% OFF en efectivo)
          </a>
        </div>
      </div>
    </section>
  );
}
