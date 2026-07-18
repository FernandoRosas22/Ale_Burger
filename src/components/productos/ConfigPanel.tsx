// ============================================================
// ConfigPanel.tsx — Configuración general del local
// Banner, descuentos globales, badges especiales
// ============================================================

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import ToastNotif, { useToasts } from "./ToastNotif";

interface Descuento {
  id: string;
  activo: boolean;
  emoji: string;
  titulo: string;
  descripcion: string;
}

interface ConfigLocal {
  // Banner principal
  bannerActivo:   boolean;
  bannerEmoji:    string;
  bannerDestaque: string;
  bannerSub:      string;
  // Descuentos
  descuentos: Descuento[];
}

const CONFIG_DEFECTO: ConfigLocal = {
  bannerActivo:   true,
  bannerEmoji:    "🎉",
  bannerDestaque: "10% OFF",
  bannerSub:      "pagando en efectivo, todos los días",
  descuentos: [
    { id: "efectivo", activo: true,  emoji: "💵", titulo: "10% OFF en efectivo",    descripcion: "Todos los días, en todos los productos" },
    { id: "combo",    activo: false, emoji: "🍟", titulo: "Combo burger + bebida",   descripcion: "Pedí combo y ahorrá" },
    { id: "promo",    activo: false, emoji: "🔥", titulo: "Promo del día",           descripcion: "" },
  ],
};

export default function ConfigPanel() {
  const [config,    setConfig]    = useState<ConfigLocal>(CONFIG_DEFECTO);
  const [guardando, setGuardando] = useState(false);
  const [cargando,  setCargando]  = useState(true);
  const { toasts, agregar, quitar } = useToasts();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<ConfigLocal>;
        setConfig({
          ...CONFIG_DEFECTO,
          ...data,
          descuentos: data.descuentos ?? CONFIG_DEFECTO.descuentos,
        });
      }
      setCargando(false);
    }, () => setCargando(false));
    return () => unsub();
  }, []);

  const set = <K extends keyof ConfigLocal>(key: K, val: ConfigLocal[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  // ── Descuentos helpers ────────────────────────────────────
  const setDescuento = (id: string, field: keyof Descuento, val: string | boolean) =>
    setConfig((c) => ({
      ...c,
      descuentos: c.descuentos.map((d) => d.id === id ? { ...d, [field]: val } : d),
    }));

  const agregarDescuento = () => {
    const nuevo: Descuento = {
      id:          crypto.randomUUID(),
      activo:      true,
      emoji:       "🏷",
      titulo:      "Nueva promo",
      descripcion: "",
    };
    setConfig((c) => ({ ...c, descuentos: [...c.descuentos, nuevo] }));
  };

  const quitarDescuento = (id: string) =>
    setConfig((c) => ({ ...c, descuentos: c.descuentos.filter((d) => d.id !== id) }));

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

  if (cargando) return <div className="gp-loading"><div className="gp-skeleton" /><div className="gp-skeleton" /></div>;

  return (
    <div className="cp-root">
      <h2 className="cp-titulo">⚙️ Configuración general</h2>

      {/* ══ BANNER PRINCIPAL ══════════════════════════════════ */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>🎉 Banner de la carta</h3>
          <p>Aparece en la sección del menú para todos los clientes en tiempo real.</p>
        </div>

        <div className="cp-preview-label">Vista previa</div>
        {config.bannerActivo ? (
          <div className="cp-banner-preview">
            {config.bannerEmoji && <span>{config.bannerEmoji}</span>}
            {config.bannerDestaque && <strong>{config.bannerDestaque}</strong>}
            {config.bannerSub && <span>{config.bannerSub}</span>}
          </div>
        ) : (
          <div className="cp-banner-preview cp-banner-preview--off">
            Banner desactivado — no aparece en la carta
          </div>
        )}

        <div className="cp-fields">
          <label className="pf-switch-row">
            <div className="pf-switch-info">
              <span className="pf-switch-label">Mostrar banner</span>
              <span className="pf-switch-hint">Activá o desactivá sin borrar el contenido</span>
            </div>
            <div className={`pf-switch${config.bannerActivo ? " pf-switch--on" : ""}`}
              onClick={() => set("bannerActivo", !config.bannerActivo)}
              role="switch" aria-checked={config.bannerActivo} tabIndex={0}>
              <div className="pf-switch-thumb" />
            </div>
          </label>

          <div className="cp-row">
            <div className="cp-field">
              <label className="pf-label">Emoji</label>
              <input className="pf-input" value={config.bannerEmoji}
                onChange={(e) => set("bannerEmoji", e.target.value)}
                placeholder="🎉" maxLength={4} style={{ maxWidth: 72 }} />
            </div>
            <div className="cp-field" style={{ flex: 1 }}>
              <label className="pf-label">Texto destacado (verde grande)</label>
              <input className="pf-input" value={config.bannerDestaque}
                onChange={(e) => set("bannerDestaque", e.target.value)}
                placeholder="10% OFF · PROMO DEL DÍA · 2x1" maxLength={40} />
            </div>
          </div>

          <div className="cp-field">
            <label className="pf-label">Texto secundario</label>
            <input className="pf-input" value={config.bannerSub}
              onChange={(e) => set("bannerSub", e.target.value)}
              placeholder="pagando en efectivo, todos los días" maxLength={100} />
          </div>
        </div>
      </div>

      {/* ══ DESCUENTOS / PROMOS ═══════════════════════════════ */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h3>🏷 Descuentos y promociones</h3>
          <p>Aparecen en el footer del carrito y en la pantalla de éxito del checkout.</p>
        </div>

        <div className="cp-descuentos">
          {config.descuentos.map((d) => (
            <div key={d.id} className={`cp-desc-item${d.activo ? "" : " cp-desc-item--off"}`}>
              <div className="cp-desc-row">
                {/* Toggle activo */}
                <div className={`pf-switch${d.activo ? " pf-switch--on" : ""}`}
                  onClick={() => setDescuento(d.id, "activo", !d.activo)}
                  role="switch" aria-checked={d.activo} tabIndex={0} style={{ flexShrink: 0 }}>
                  <div className="pf-switch-thumb" />
                </div>

                {/* Emoji */}
                <input className="pf-input cp-input-emoji" value={d.emoji}
                  onChange={(e) => setDescuento(d.id, "emoji", e.target.value)}
                  maxLength={4} placeholder="🏷" />

                {/* Título */}
                <input className="pf-input" style={{ flex: 1 }} value={d.titulo}
                  onChange={(e) => setDescuento(d.id, "titulo", e.target.value)}
                  placeholder="Nombre de la promo" maxLength={60} />

                {/* Eliminar */}
                <button className="cp-desc-del" onClick={() => quitarDescuento(d.id)}
                  title="Eliminar">🗑</button>
              </div>

              {/* Descripción */}
              <input className="pf-input" value={d.descripcion}
                onChange={(e) => setDescuento(d.id, "descripcion", e.target.value)}
                placeholder="Descripción (opcional)" maxLength={100} />
            </div>
          ))}
        </div>

        <button className="cp-btn-agregar" onClick={agregarDescuento}>
          + Agregar promoción
        </button>
      </div>

      <button className="cp-btn-guardar" onClick={handleGuardar} disabled={guardando}>
        {guardando ? "Guardando..." : "💾 Guardar todos los cambios"}
      </button>

      <ToastNotif toasts={toasts} onRemove={quitar} />
    </div>
  );
}
