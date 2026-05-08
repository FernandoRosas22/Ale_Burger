import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { useScrolled } from "@/hooks/useScrolled";

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
          <li><a href="#pedidos" className="ab-nav-cta">🍔 Pedir ahora</a></li>
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
        <a href="#pedidos" onClick={close} style={{ color: "var(--naranja)" }}>
          🍔 Pedir ahora
        </a>
      </div>
    </>
  );
}
