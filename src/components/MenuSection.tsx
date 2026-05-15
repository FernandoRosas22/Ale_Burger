import { useState } from "react";
import { menu } from "@/data/menu";
import type { MenuItem } from "@/data/menu";
import MenuCard from "./MenuCard";
import ProductModal from "./ProductModal";

export default function MenuSection() {
  const [itemSeleccionado, setItemSeleccionado] = useState<MenuItem | null>(null);
  const [modalAbierto, setModalAbierto]         = useState(false);

  const abrirModal = (item: MenuItem) => {
    setItemSeleccionado(item);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    // Limpiamos el item con delay para no cortar la animación de cierre
    setTimeout(() => setItemSeleccionado(null), 350);
  };

  return (
    <section id="menu" className="ab-section">
      <div className="ab-menu-header">
        <p className="ab-section-tag">Lo que hacemos</p>
        <h2 className="ab-section-title">NUESTRO <span>MENÚ</span></h2>
        <p>Burgers smasheadas, combos, bebidas y acompañamientos. Todo artesanal, hecho al momento.</p>
        <div className="ab-promo-banner">
          <span>🎉</span>
          <strong>10% OFF</strong>
          <span>pagando en efectivo, todos los días</span>
        </div>
        <nav className="ab-cat-nav" aria-label="Categorías del menú">
          {menu.map((c) => (
            <a key={c.id} href={`#cat-${c.id}`}>{c.titulo}</a>
          ))}
        </nav>
      </div>

      {menu.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="ab-cat">
          <header className="ab-cat-head">
            <h3 className="ab-cat-title">{cat.titulo}</h3>
            {cat.subtitulo && <p>{cat.subtitulo}</p>}
          </header>
          <div className="ab-scroller">
            <div className="ab-scroller-track">
              {cat.items.map((it) => (
                <MenuCard key={it.nombre} item={it} onAbrirModal={abrirModal} />
              ))}
            </div>
          </div>
        </div>
      ))}

      <p className="ab-menu-disclaimer">
        * Precios y disponibilidad sujetos a cambios. Consultá por WhatsApp o pedí online.
      </p>

      {/* Modal montado una sola vez, fuera del loop */}
      <ProductModal
        item={itemSeleccionado}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </section>
  );
}
