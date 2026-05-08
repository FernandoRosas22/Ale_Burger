import { MAPS_EMBED_URL, MAPS_PLACE_URL } from "@/utils/contact";

export default function LocationSection() {
  return (
    <section id="ubicacion" className="ab-section ab-ubicacion">
      <div className="ab-menu-header">
        <p className="ab-section-tag">Dónde encontrarnos</p>
        <h2 className="ab-section-title">NUESTRA <span>UBICACIÓN</span></h2>
        <p>Vení a buscar tu pedido o pedí delivery. Te esperamos.</p>
      </div>
      <div className="ab-mapa-wrap">
        <iframe
          title="AleBurgers en Google Maps"
          src={MAPS_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a className="ab-mapa-btn" href={MAPS_PLACE_URL} target="_blank" rel="noreferrer">
          📍 Cómo llegar
        </a>
      </div>
    </section>
  );
}
