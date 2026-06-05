import fondo from '../assets/Fondo.png';

export default function Hero() {
  return (
    <section className="ab-hero">
      <img
        src={Fondo}
        alt="AleBurgers - Hamburguesas Smash"
        className="ab-hero-img"
      />
      <a href="#menu" className="ab-btn-primary">Ver Menú</a>
    </section>
  );
}
