import { INSTAGRAM_URL } from "@/utils/contact";

export default function SocialSection() {
  return (
    <section id="redes" className="ab-section ab-redes">
      <div className="ab-redes-inner">
        <p className="ab-section-tag">Seguinos</p>
        <h2 className="ab-section-title">REDES <span>SOCIALES</span></h2>
        <p>Seguinos para ver las últimas novedades, promos y las mejores fotos de nuestras burgers.</p>
        <div className="ab-redes-btns">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="ab-red ab-red-ig">Instagram</a>
          <a href="#" className="ab-red ab-red-fb">Facebook</a>
          <a href="#" className="ab-red ab-red-tk">TikTok</a>
        </div>
      </div>
    </section>
  );
}
