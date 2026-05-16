// ============================================================
// Admin.tsx — Panel de comandas
// Lee pedidos de Firestore en tiempo real y los muestra compactos
// ============================================================

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { actualizarEstado } from "@/services/orders.service";
import {
  ESTADOS_PEDIDO,
  METODOS_PAGO,
  type Pedido,
  type EstadoPedido,
} from "@/types/order.types";
import "@/styles/admin.css";
import { useAuth } from "@/context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────
function formatFecha(val: Timestamp | string | undefined): string {
  if (!val) return "—";
  const date = val instanceof Timestamp ? val.toDate() : new Date(val);
  return date.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatPrecio(n: number): string {
  return n?.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }) ?? "—";
}

const ORDEN_ESTADOS: EstadoPedido[] = ["pendiente", "preparando", "listo", "entregado", "cancelado"];

// ─── Comanda individual ───────────────────────────────────────
function Comanda({ pedido, onCambiarEstado }: {
  pedido: Pedido & { id: string };
  onCambiarEstado: (id: string, estado: EstadoPedido) => void;
}) {
  const est = ESTADOS_PEDIDO[pedido.estado] ?? ESTADOS_PEDIDO.pendiente;
  const pago = METODOS_PAGO[pedido.cliente?.metodoPago];

  return (
    <article className="cmd-card" data-estado={pedido.estado}>

      {/* ── Encabezado ── */}
      <header className="cmd-header">
        <div className="cmd-header-left">
          <span className="cmd-estado-dot" style={{ background: est.color }} />
          <span className="cmd-estado-label" style={{ color: est.color }}>{est.emoji} {est.label}</span>
        </div>
        <span className="cmd-fecha">{formatFecha((pedido as any).fechaCreacion)}</span>
      </header>

      {/* ── Cliente ── */}
      <div className="cmd-cliente">
        <span className="cmd-nombre">{pedido.cliente?.nombre ?? "—"}</span>
        <span className="cmd-tel">{pedido.cliente?.telefono ?? "—"}</span>
        <span className="cmd-entrega">
          {pedido.cliente?.tipoEntrega === "delivery" ? "🛵 Delivery" : "🏠 Retiro"}
          {pago && <> · {pago.emoji} {pago.label}</>}
        </span>
        {pedido.cliente?.tipoEntrega === "delivery" && pedido.cliente?.direccion && (
          <span className="cmd-dir">📍 {pedido.cliente.direccion}</span>
        )}
        {pedido.cliente?.observacionesGenerales && (
          <span className="cmd-obs-gral">💬 {pedido.cliente.observacionesGenerales}</span>
        )}
      </div>

      {/* ── Items ── */}
      <ul className="cmd-items">
        {pedido.items?.map((item, i) => {
          const { ingredientesRemovidos, extrasAgregados, observaciones } = item.personalizacion ?? {};
          return (
            <li key={i} className="cmd-item">
              <div className="cmd-item-top">
                <span className="cmd-item-cant">{item.cantidad}×</span>
                <span className="cmd-item-nombre">{item.nombre}</span>
                <span className="cmd-item-precio">{formatPrecio(item.subtotalItem)}</span>
              </div>
              {(ingredientesRemovidos?.length > 0 || extrasAgregados?.length > 0 || observaciones) && (
                <div className="cmd-item-custom">
                  {ingredientesRemovidos?.length > 0 && (
                    <span className="cmd-tag cmd-tag--sin">🚫 {ingredientesRemovidos.map((r: any) => r.nombre).join(", ")}</span>
                  )}
                  {extrasAgregados?.length > 0 && (
                    <span className="cmd-tag cmd-tag--con">➕ {extrasAgregados.map((e: any) => e.nombre).join(", ")}</span>
                  )}
                  {observaciones && (
                    <span className="cmd-tag cmd-tag--obs">📝 {observaciones}</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* ── Totales ── */}
      <div className="cmd-totales">
        {pedido.descuento > 0 && (
          <div className="cmd-total-row cmd-total-row--desc">
            <span>Descuento</span><span>−{formatPrecio(pedido.descuento)}</span>
          </div>
        )}
        <div className="cmd-total-row cmd-total-row--final">
          <span>Total</span><strong>{formatPrecio(pedido.total)}</strong>
        </div>
      </div>

      {/* ── Cambiar estado ── */}
      <div className="cmd-acciones">
        {ORDEN_ESTADOS.filter((e) => e !== pedido.estado).map((e) => {
          const info = ESTADOS_PEDIDO[e];
          return (
            <button
              key={e}
              className="cmd-btn-estado"
              style={{ borderColor: info.color, color: info.color }}
              onClick={() => onCambiarEstado(pedido.id, e)}
            >
              {info.emoji} {info.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}

// ─── Página Admin ─────────────────────────────────────────────
export default function Admin() {
  const { logout } = useAuth();
  const [pedidos, setPedidos]     = useState<(Pedido & { id: string })[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [filtro, setFiltro]       = useState<EstadoPedido | "todos">("todos");
  const [error, setError]         = useState("");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("fechaCreacion", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as (Pedido & { id: string })[];
        setPedidos(data);
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudo cargar los pedidos. Verificá las credenciales de Firebase.");
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  const handleCambiarEstado = async (id: string, estado: EstadoPedido) => {
    try {
      await actualizarEstado(id, estado);
    } catch (e) {
      console.error("Error actualizando estado:", e);
    }
  };

  const pedidosFiltrados = filtro === "todos"
    ? pedidos
    : pedidos.filter((p) => p.estado === filtro);

  const contarPorEstado = (e: EstadoPedido) => pedidos.filter((p) => p.estado === e).length;

  return (
    <div className="adm-root">
      <header className="adm-topbar">
        <h1 className="adm-titulo">🍔 Comandas</h1>
        <span className="adm-total-badge">{pedidos.length} pedidos</span>
        <button className="adm-logout-btn" onClick={logout} title="Cerrar sesión">Salir ↩</button>
      </header>

      {/* Filtros */}
      <div className="adm-filtros">
        <button
          className={`adm-filtro-btn${filtro === "todos" ? " adm-filtro-btn--activo" : ""}`}
          onClick={() => setFiltro("todos")}
        >Todos</button>
        {ORDEN_ESTADOS.map((e) => {
          const info = ESTADOS_PEDIDO[e];
          const n = contarPorEstado(e);
          return (
            <button
              key={e}
              className={`adm-filtro-btn${filtro === e ? " adm-filtro-btn--activo" : ""}`}
              style={filtro === e ? { borderColor: info.color, color: info.color } : {}}
              onClick={() => setFiltro(e)}
            >
              {info.emoji} {info.label} {n > 0 && <span className="adm-filtro-n">{n}</span>}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <main className="adm-main">
        {cargando && <div className="adm-msg">Cargando pedidos...</div>}
        {error   && <div className="adm-msg adm-msg--error">{error}</div>}
        {!cargando && !error && pedidosFiltrados.length === 0 && (
          <div className="adm-msg">No hay pedidos {filtro !== "todos" ? `con estado "${ESTADOS_PEDIDO[filtro as EstadoPedido]?.label}"` : ""}.</div>
        )}
        <div className="adm-grid">
          {pedidosFiltrados.map((p) => (
            <Comanda key={p.id} pedido={p} onCambiarEstado={handleCambiarEstado} />
          ))}
        </div>
      </main>
    </div>
  );
}
