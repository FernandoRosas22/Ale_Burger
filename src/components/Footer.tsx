import logo from "@/assets/logo.jpg";
import { INSTAGRAM_URL } from "@/utils/contact";

export default function Footer() {
  return (
    <footer className="ab-footer">
      <div className="ab-footer-logo">
        <img src={logo} alt="AleBurgers" />
        <span>ALEBURGERS</span>
      </div>
      <p>© {new Date().getFullYear()} AleBurgers. Hecho con 🍔 en Buenos Aires.</p>
      <p>
        Seguinos en{" "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">@aleburgers.ok</a>
      </p>
    </footer>
  );
}
