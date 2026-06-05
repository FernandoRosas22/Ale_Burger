import { ZONAS, SIN_ZONA } from "@/data/zonas";
import { useCarrito, formatPrecio } from "@/context/CarritoContext";

export default function ZonaSelector() {
  const { zonaEnvio, setZonaEnvio } = useCarrito();

  return (
    <div className="zona-selector">
      <h3 className="zona-selector__titulo">🛵 Zona de envío</h3>
      <p className="zona-selector__sub">Seleccioná tu zona para calcular el costo</p>

      <div className="zona-selector__grid">
        <button
          className={`zona-btn ${zonaEnvio.id === SIN_ZONA.id ? "zona-btn--activa" : ""}`}
          onClick={() => setZonaEnvio(SIN_ZONA)}
        >
          <span className="zona-btn__nombre">🏠 Retiro en local</span>
          <span className="zona-btn__precio">Gratis</span>
        </button>

        {ZONAS.map((zona) => (
          <button
            key={zona.id}
            className={`zona-btn ${zonaEnvio.id === zona.id ? "zona-btn--activa" : ""}`}
            style={{ borderColor: zonaEnvio.id === zona.id ? zona.color : undefined }}
            onClick={() => setZonaEnvio(zona)}
          >
            <span className="zona-btn__dot" style={{ background: zona.color }} />
            <span className="zona-btn__nombre">{zona.nombre}</span>
            <span className="zona-btn__precio">{formatPrecio(zona.costo)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}