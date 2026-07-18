// ============================================================
// MenuSection.tsx — Lee productos Y banner desde Firestore
// ============================================================

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useProductos } from "@/hooks/useProductos";
import { menu } from "@/data/menu";
import type { MenuItem } from "@/data/menu";
import { CATEGORIAS, productoToMenuItem } from "@/types/producto.types";
import MenuCard from "./MenuCard";
import ProductModal from "./ProductModal";

interface ConfigLocal {
  bannerActivo:   boolean;
  bannerEmoji:    string;
  bannerDestaque: string;
  bannerSub:      string;
}

const BANNER_DEFECTO: ConfigLocal = {
  bannerActivo:   true,
  bannerEmoji:    "🎉",
  bannerDestaque: "10% OFF",
  bannerSub:      "pagando en efectivo, todos los días",
};

export default function MenuSection() {
  const [itemSeleccionado, setItemSeleccionado] = useState<MenuItem | null>(null);
  const [modalAbierto,     setModalAbierto]     = useState(false);
  const [banner,           setBanner]           = useState<ConfigLocal>(BANNER_DEFECTO);
  const { productos, cargando } = useProductos({ soloVisibles: true });

  // Escuchar banner en tiempo real desde Firestore
  useEffect(() => {
    const ref = doc(db, "settings", "config");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setBanner({ ...BANNER_DEFECTO, ...snap.data() as ConfigLocal });
    });
    return () => unsub();
  }, []);

  const abrirModal  = (item: MenuItem) => { setItemSeleccionado(item); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setTimeout(() => setItemSeleccionado(null), 350); };

  // Si hay productos en Firestore usarlos, sino fallback a menu.ts
  const usandoFirestore = !cargando && productos.length > 0;

  const categorias = usandoFirestore
    ? Object.entries(CATEGORIAS)
        .map(([catId, titulo]) => ({
          id: catId,
          titulo,
          items: productos.filter((p) => p.category === catId).map(productoToMenuItem),
        }))
        .filter((c) => c.items.length > 0)
    : menu;

  return (
    <section id="menu" className="ab-section">
      <div className="ab-menu-header">
        <p className="ab-section-tag">Lo que hacemos</p>
        <h2 className="ab-section-title">NUESTRO <span>MENÚ</span></h2>
        <p>Burgers smasheadas, combos, bebidas y acompañamientos. Todo artesanal, hecho al momento.</p>

        {/* Banner dinámico desde Firestore */}
        {banner.bannerActivo && (
          <div className="ab-promo-banner">
            {banner.bannerEmoji && <span>{banner.bannerEmoji}</span>}
            {banner.bannerDestaque && <strong>{banner.bannerDestaque}</strong>}
            {banner.bannerSub && <span>{banner.bannerSub}</span>}
          </div>
        )}

        <nav className="ab-cat-nav" aria-label="Categorías del menú">
          {categorias.map((c) => (
            <a key={c.id} href={`#cat-${c.id}`}>{c.titulo}</a>
          ))}
        </nav>
      </div>

      {cargando && (
        <div className="ab-menu-loading">
          {[1,2,3].map((i) => <div key={i} className="ab-menu-skeleton" />)}
        </div>
      )}

      {!cargando && categorias.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="ab-cat">
          <header className="ab-cat-head">
            <h3 className="ab-cat-title">{cat.titulo}</h3>
            {"subtitulo" in cat && cat.subtitulo && <p>{cat.subtitulo as string}</p>}
          </header>
          <div className="ab-scroller">
            <div className="ab-scroller-track">
              {cat.items.map((it) => (
                <MenuCard key={it.nombre} item={it as MenuItem} onAbrirModal={abrirModal} />
              ))}
            </div>
          </div>
        </div>
      ))}

      <p className="ab-menu-disclaimer">
        * Precios y disponibilidad sujetos a cambios. Consultá por WhatsApp o pedí online.
      </p>

      <ProductModal item={itemSeleccionado} isOpen={modalAbierto} onClose={cerrarModal} />
    </section>
  );
}
