// ============================================================
// ConfigPanel.tsx — Configuración general del local
// Banner de descuento, texto promo, etc. Todo editable desde acá.
// ============================================================

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import ToastNotif, { useToasts } from "./ToastNotif";

interface ConfigLocal {
  bannerActivo:  boolean;
  bannerEmoji:   string;
  bannerTexto:   string;
  bannerDestaque: string; // texto en negrita/color
  bannerSub:     string;  // texto secundario
}

const CONFIG_DEFECTO: ConfigLocal = {
  bannerActivo:   true,
  bannerEmoji:    "🎉",
  bannerDestaque: "10% OFF",
  bannerTexto:    "",
  bannerSub:      "pagando en efectivo, todos los días",
};

export default function ConfigPanel() {
  const [config,    setConfig]    = useState<ConfigLocal>(CONFIG_DEFECTO);
  const [guardando, setGuardando] = useState(false);
  const [cargando,  setCargando]  = useState(true);
  const { toasts, agregar, quitar } = useToasts();

  // Escuchar config en tiempo real
  useEffect(() => {
    const ref = doc(db, "settings", "config");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setConfig({ ...CONFIG_DEFECTO, ...snap.data() as ConfigLocal });
      }
      setCargando(false);
    }, () => setCargando(false));
    return () => unsub();
  }, []);

  const setField = <K extends keyof ConfigLocal>(key: K, val: ConfigLocal[K]) => {
    setConfig((c) => ({ ...c, [key]: val }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await setDoc(doc(db, "settings", "config"), config, { merge: true });
      agregar("Configuración guardada ✓", "ok");
    } catch (e: any) {
      agregar("Error al guardar: " + e.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  // Preview del banner
  const preview = config.bannerActivo ? (
    <div className="cp-banner-preview">
      <span>{config.bannerEmoji}</span>
      {config.bannerTexto && <span>{config.bannerTexto}</span>}
      {config.bannerDestaque && <strong>{config.bannerDestaque}</strong>}
      {config.bannerSub && <span>{config.bannerSub}</span>}
    </div>
  ) : (
    <div className="cp-banner-preview cp-banner-preview--off">
      Banner desactivado — no aparece en la carta
    </div>
  );

  if (cargando) return <div className="gp-loading"><div className="gp-skeleton" /></div>;

  return (
    <div className="cp-root">
      <h2 className="cp-titulo">⚙️ Configuración general</h2>

      {/* ── Banner de descuento ── */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>Banner de descuento</h3>
          <p>Aparece en la sección del menú para todos los clientes.</p>
        </div>

        {/* Preview en tiempo real */}
        <div className="cp-preview-label">Vista previa</div>
        {preview}

        <div className="cp-fields">
          {/* Activar/desactivar */}
          <label className="pf-switch-row">
            <div className="pf-switch-info">
              <span className="pf-switch-label">Mostrar banner</span>
              <span className="pf-switch-hint">Activá o desactivá el banner sin borrarlo</span>
            </div>
            <div
              className={`pf-switch${config.bannerActivo ? " pf-switch--on" : ""}`}
              onClick={() => setField("bannerActivo", !config.bannerActivo)}
              role="switch"
              aria-checked={config.bannerActivo}
              tabIndex={0}
            >
              <div className="pf-switch-thumb" />
            </div>
          </label>

          {/* Emoji */}
          <div className="cp-field">
            <label className="pf-label">Emoji</label>
            <input
              className="pf-input"
              value={config.bannerEmoji}
              onChange={(e) => setField("bannerEmoji", e.target.value)}
              placeholder="🎉"
              maxLength={4}
              style={{ maxWidth: "80px" }}
            />
          </div>

          {/* Texto principal en negrita (el "10% OFF") */}
          <div className="cp-field">
            <label className="pf-label">Texto destacado (en verde)</label>
            <input
              className="pf-input"
              value={config.bannerDestaque}
              onChange={(e) => setField("bannerDestaque", e.target.value)}
              placeholder="10% OFF"
              maxLength={30}
            />
            <span className="pf-hint">Ej: 10% OFF · PROMO DEL DÍA · 2x1</span>
          </div>

          {/* Texto secundario */}
          <div className="cp-field">
            <label className="pf-label">Texto secundario</label>
            <input
              className="pf-input"
              value={config.bannerSub}
              onChange={(e) => setField("bannerSub", e.target.value)}
              placeholder="pagando en efectivo, todos los días"
              maxLength={80}
            />
          </div>
        </div>
      </div>

      <button
        className="cp-btn-guardar"
        onClick={handleGuardar}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <ToastNotif toasts={toasts} onRemove={quitar} />
    </div>
  );
}
