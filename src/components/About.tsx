import burger from "@/assets/hamburguesa-hero.jpg";

const STATS = [
  { num: "100%", label: "Artesanal" },
  { num: "+15", label: "Burgers" },
  { num: "★5", label: "Valoración" },
];

export default function About() {
  return (
    <section id="nosotros" className="ab-section ab-nosotros">
      <div className="ab-nosotros-grid">
        <div className="ab-nosotros-text">
          <p className="ab-section-tag">Quiénes somos</p>
          <h2 className="ab-section-title">
            PASIÓN POR LA<br /><span>BUENA BURGER</span>
          </h2>
          <p>
            En AleBurgers hacemos hamburguesas artesanales con ingredientes frescos seleccionados,
            preparadas al momento con todo el amor y la dedicación que merece cada pedido.
            Somos un emprendimiento que nació de la pasión por la buena comida.
          </p>
          <p>
            Cada hamburguesa es única, preparada con pan brioche, carne de calidad y los mejores
            toppings. Sin apuros, sin atajos — solo sabor real.
          </p>
          <div className="ab-stats">
            {STATS.map((s) => (
              <div className="ab-stat" key={s.label}>
                <div className="ab-stat-num">{s.num}</div>
                <div className="ab-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ab-nosotros-img">
          <img src={burger} alt="Hamburguesa AleBurgers" />
          <div className="ab-badge">100%<br />CASERO</div>
        </div>
      </div>
    </section>
  );
}
