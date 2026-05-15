import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { useScrolled } from "@/hooks/useScrolled";
import { useCarrito } from "@/context/CarritoContext";

const LINKS = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#menu", label: "Menú" },
  { href: "#videos", label: "Videos" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#redes", label: "Redes" },
];

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { totalItems, toggleCarrito } = useCarrito();

  return (
    <>
      <nav className={`ab-nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="ab-nav-logo">
          <img src={logo} alt="AleBurgers" />
          <span>ALEBURGERS</span>
        </a>
        <ul className="ab-nav-links">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
          <li>
            <button
              className="carrito-nav-btn"
              onClick={toggleCarrito}
              aria-label={`Abrir carrito — ${totalItems} producto${totalItems !== 1 ? "s" : ""}`}
            >
              🛒 Carrito
              {totalItems > 0 && (
                <span className="carrito-badge" aria-hidden="true">
                  {totalItems}
                </span>
              )}
            </button>
          </li>
        </ul>
        <button
          className="ab-hamburger"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`ab-mobile ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
        ))}
        <button
          className="carrito-nav-btn"
          onClick={() => { toggleCarrito(); close(); }}
          style={{ fontSize: "1.1rem", padding: "14px 28px" }}
        >
          🛒 Mi carrito
          {totalItems > 0 && (
            <span className="carrito-badge" aria-hidden="true">{totalItems}</span>
          )}
        </button>
      </div>
    </>
  );
}
