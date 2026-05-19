// ============================================================
// Historial.tsx — Ventas archivadas con filtros de fecha
// ============================================================

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { METODOS_PAGO, type Pedido } from "@/types/order.types";
import "@/styles/historial.css";
import CalendarioRango from "@/components/CalendarioRango";

// ─── Helpers ──────────────────────────────────────────────────
function formatPrecio(n: number) {
  return (n ?? 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}
function formatFecha(val: Timestamp | string | undefined): string {
  if (!val) return "—";
  const d = val instanceof Timestamp ? val.toDate() : new Date(val);
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function toDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate();
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}
function ymd(d: Date) {
  // Usar fecha local (no UTC) para evitar desfase de zona horaria
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function startOfDay(d: Date) {
  const r = new Date(d); r.setHours(0,0,0,0); return r;
}
function endOfDay(d: Date) {
  const r = new Date(d); r.setHours(23,59,59,999); return r;
}

// ─── Tipos de filtro ──────────────────────────────────────────
type FiltroTipo = "hoy" | "semana" | "mes" | "personalizado";

function getRango(tipo: FiltroTipo, desde: string, hasta: string): [Date, Date] {
  const hoy = new Date();
  if (tipo === "hoy")    return [startOfDay(hoy), endOfDay(hoy)];
  if (tipo === "semana") {
    const lun = new Date(hoy);
    const day = hoy.getDay();
    lun.setDate(hoy.getDate() - (day === 0 ? 6 : day - 1));
    lun.setHours(0,0,0,0);
    return [lun, endOfDay(hoy)];
  }
  if (tipo === "mes") {
    return [new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0,0,0,0), endOfDay(hoy)];
  }
  // "T00:00:00" sin Z para que lo interprete en hora local, no UTC
  const d = desde ? startOfDay(new Date(desde + "T00:00:00")) : startOfDay(hoy);
  const h = hasta  ? endOfDay(new Date(hasta  + "T00:00:00")) : endOfDay(hoy);
  return [d, h];
}

// ─── Estadísticas del conjunto de pedidos ─────────────────────
function calcStats(peds: (Pedido & { id: string })[]) {
  const total        = peds.reduce((s,p) => s + (p.total ?? 0), 0);
  const descuentos   = peds.reduce((s,p) => s + (p.descuento ?? 0), 0);
  const efectivo     = peds.filter(p => p.cliente?.metodoPago === "efectivo").reduce((s,p) => s+(p.total??0),0);
  const transf       = peds.filter(p => p.cliente?.metodoPago === "transferencia").reduce((s,p) => s+(p.total??0),0);
  const ticket       = peds.length ? Math.round(total / peds.length) : 0;

  const items: Record<string, number> = {};
  peds.forEach(p => p.items?.forEach(i => { items[i.nombre] = (items[i.nombre]??0) + i.cantidad; }));
  const topItems = Object.entries(items).sort((a,b) => b[1]-a[1]);

  return { total, descuentos, efectivo, transf, ticket, topItems, count: peds.length };
}

// ─── Card de stats ────────────────────────────────────────────
function StatsCard({ peds }: { peds: (Pedido & { id: string })[] }) {
  const s = calcStats(peds);
  if (!peds.length) return null;
  return (
    <div className="hist-stats-card">
      <div className="hist-stats-grid">
        <div className="hist-stat">
          <span>💰 Total</span>
          <strong className="hist-stat--naranja">{formatPrecio(s.total)}</strong>
        </div>
        <div className="hist-stat">
          <span>🧾 Pedidos</span>
          <strong>{s.count}</strong>
        </div>
        <div className="hist-stat">
          <span>🎫 Ticket prom.</span>
          <strong>{formatPrecio(s.ticket)}</strong>
        </div>
        <div className="hist-stat">
          <span>🏷 Descuentos</span>
          <strong className="hist-stat--desc">−{formatPrecio(s.descuentos)}</strong>
        </div>
        {s.efectivo > 0 && (
          <div className="hist-stat">
            <span>💵 Efectivo</span>
            <strong className="hist-stat--verde">{formatPrecio(s.efectivo)}</strong>
          </div>
        )}
        {s.transf > 0 && (
          <div className="hist-stat">
            <span>📲 Transferencia</span>
            <strong className="hist-stat--azul">{formatPrecio(s.transf)}</strong>
          </div>
        )}
      </div>

      {/* Productos vendidos */}
      {s.topItems.length > 0 && (
        <div className="hist-productos">
          <div className="hist-productos-titulo">🍔 Productos vendidos</div>
          <div className="hist-productos-lista">
            {s.topItems.map(([nombre, cant]) => (
              <div key={nombre} className="hist-producto-row">
                <span className="hist-producto-nombre">{nombre}</span>
                <span className="hist-producto-cant">{cant}×</span>
                <span className="hist-producto-precio">
                  {formatPrecio(
                    peds.flatMap(p => p.items ?? [])
                      .filter(i => i.nombre === nombre)
                      .reduce((s, i) => s + i.subtotalItem, 0)
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lista de pedidos del rango ───────────────────────────────
function ListaPedidos({ peds }: { peds: (Pedido & { id: string })[] }) {
  if (!peds.length) return null;
  return (
    <details className="hist-detalle">
      <summary className="hist-detalle-summary">Ver {peds.length} pedido{peds.length!==1?"s":""} detallados</summary>
      <div className="hist-pedidos-lista">
        {peds.map(p => {
          const pago = METODOS_PAGO[p.cliente?.metodoPago];
          return (
            <div key={p.id} className="hist-pedido-row">
              <div className="hist-pedido-left">
                <span className="hist-pedido-nombre">{p.cliente?.nombre ?? "—"}</span>
                <span className="hist-pedido-detalle">
                  {p.items?.map(i => `${i.cantidad}× ${i.nombre}`).join(" · ")}
                </span>
                <span className="hist-pedido-meta">
                  {p.cliente?.tipoEntrega === "delivery" ? "🛵" : "🥡"}
                  {pago && <> · {pago.emoji} {pago.label}</>}
                  {" · "}{formatFecha((p as any).fechaCreacion)}
                </span>
              </div>
              <span className="hist-pedido-total">{formatPrecio(p.total)}</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}

// ─── Página principal ─────────────────────────────────────────
export default function Historial() {
  const { logout } = useAuth();
  const [todos, setTodos]         = useState<(Pedido & { id: string })[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState("");

  // Filtros
  const [filtroTipo, setFiltroTipo]   = useState<FiltroTipo>("mes");
  const [desde, setDesde]             = useState("");
  const [hasta, setHasta]             = useState("");

  // Cargar todos los archivados una vez
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("fechaCreacion", "desc"));
    const unsub = onSnapshot(q,
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as (Pedido & { id: string })[];
        setTodos(data.filter(p => p.archivado === true));
        setCargando(false);
      },
      err => { console.error(err); setError("No se pudo cargar el historial."); setCargando(false); }
    );
    return () => unsub();
  }, []);

  // Filtrar por rango
  const pedidosFiltrados = useMemo(() => {
    const [ini, fin] = getRango(filtroTipo, desde, hasta);
    return todos.filter(p => {
      const d = toDate((p as any).fechaCreacion);
      if (!d) return false;
      return d >= ini && d <= fin;
    });
  }, [todos, filtroTipo, desde, hasta]);

  // Agrupar por día para la vista
  const porDia = useMemo(() => {
    const mapa: Record<string, (Pedido & { id: string })[]> = {};
    pedidosFiltrados.forEach(p => {
      const d = toDate((p as any).fechaCreacion);
      const key = d ? ymd(d) : "sin-fecha";
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(p);
    });
    return Object.entries(mapa).sort((a,b) => b[0].localeCompare(a[0]));
  }, [pedidosFiltrados]);

  const labelRango = () => {
    const [ini, fin] = getRango(filtroTipo, desde, hasta);
    const opts: Intl.DateTimeFormatOptions = { day:"2-digit", month:"2-digit", year:"numeric" };
    return `${ini.toLocaleDateString("es-AR", opts)} — ${fin.toLocaleDateString("es-AR", opts)}`;
  };

  return (
    <div className="hist-root">
      <header className="adm-topbar">
        <h1 className="adm-titulo">📋 Historial</h1>
        <span className="adm-total-badge">{todos.length} archivados</span>
        <a href="/admin" className="adm-volver-btn">← Comandas</a>
        <button className="adm-logout-btn" onClick={logout}>Salir ↩</button>
      </header>

      {/* ── Filtros ── */}
      <div className="hist-filtros">
        <div className="hist-filtros-btns">
          {(["hoy","semana","mes","personalizado"] as FiltroTipo[]).map(t => (
            <button
              key={t}
              className={`hist-filtro-btn${filtroTipo===t?" hist-filtro-btn--activo":""}`}
              onClick={() => setFiltroTipo(t)}
            >
              {t==="hoy"?"Hoy":t==="semana"?"Esta semana":t==="mes"?"Este mes":"Personalizado"}
            </button>
          ))}
        </div>

        {filtroTipo === "personalizado" && (
          <CalendarioRango
            desde={desde}
            hasta={hasta}
            onChange={(d, h) => { setDesde(d); setHasta(h); }}
          />
        )}

        <div className="hist-rango-label">
          📅 {labelRango()} · <strong>{pedidosFiltrados.length}</strong> pedido{pedidosFiltrados.length!==1?"s":""}
        </div>
      </div>

      {/* ── Stats del período ── */}
      <div style={{ padding: "0 16px" }}>
        <StatsCard peds={pedidosFiltrados} />
      </div>

      <main className="adm-main">
        {cargando && <div className="adm-msg">Cargando historial...</div>}
        {error    && <div className="adm-msg adm-msg--error">{error}</div>}
        {!cargando && !error && pedidosFiltrados.length === 0 && (
          <div className="adm-msg">No hay pedidos en este período.</div>
        )}

        {/* Por día */}
        <div className="hist-grupos">
          {porDia.map(([dia, peds]) => {
            const s = calcStats(peds);
            const fecha = new Date(dia + "T12:00:00");
            const label = fecha.toLocaleDateString("es-AR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
            return (
              <div key={dia} className="hist-grupo">
                <div className="hist-grupo-header">
                  <div className="hist-grupo-dia">{label}</div>
                  <div className="hist-grupo-total">{formatPrecio(s.total)}</div>
                </div>
                <div className="hist-cierre">
                  {/* Mini stats del día */}
                  <div className="hist-breakdown">
                    <div className="hist-breakdown-row">
                      <span>🧾 {peds.length} pedido{peds.length!==1?"s":""} · 🎫 Ticket prom. {formatPrecio(s.ticket)}</span>
                    </div>
                    {s.efectivo > 0 && (
                      <div className="hist-breakdown-row hist-breakdown-row--efectivo">
                        <span>💵 Efectivo ({peds.filter(p=>p.cliente?.metodoPago==="efectivo").length})</span>
                        <strong>{formatPrecio(s.efectivo)}</strong>
                      </div>
                    )}
                    {s.transf > 0 && (
                      <div className="hist-breakdown-row hist-breakdown-row--transferencia">
                        <span>📲 Transferencia ({peds.filter(p=>p.cliente?.metodoPago==="transferencia").length})</span>
                        <strong>{formatPrecio(s.transf)}</strong>
                      </div>
                    )}
                    {s.descuentos > 0 && (
                      <div className="hist-breakdown-row hist-breakdown-row--desc">
                        <span>🏷 Descuentos</span>
                        <span>−{formatPrecio(s.descuentos)}</span>
                      </div>
                    )}
                  </div>

                  {/* Productos del día */}
                  <div className="hist-top">
                    <div className="hist-top-titulo">🍔 Vendido este día</div>
                    {s.topItems.map(([nombre, cant]) => (
                      <div key={nombre} className="hist-top-row">
                        <span>{nombre}</span>
                        <span className="hist-top-cant">{cant}×</span>
                      </div>
                    ))}
                  </div>

                  {/* Pedidos expandibles */}
                  <ListaPedidos peds={peds} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
