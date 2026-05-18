// ============================================================
// StoreClosedBanner.tsx — Banner visible cuando local está cerrado
// ============================================================
import { useStore } from "@/context/StoreContext";
import "@/styles/store-status.css";

export default function StoreClosedBanner() {
  const { abierto, cargando } = useStore();

  if (cargando || abierto) return null;

  return (
    <div className="store-closed-banner" role="alert">
      <div className="banner-emoji">🍔</div>
      <h3>Estamos cerrados</h3>
      <p>
        Horario de atención:<br />
        <strong>19:30 a 00:00 hs</strong>
      </p>
    </div>
  );
}
