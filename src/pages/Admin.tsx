// ============================================================
// Admin.tsx — Panel de comandas con cierre de caja
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
import { actualizarEstado, cerrarCaja } from "@/services/orders.service";
import {
  ESTADOS_PEDIDO,
  METODOS_PAGO,
  type Pedido,
  type EstadoPedido,
} from "@/types/order.types";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import "@/styles/store-status.css";
import "@/styles/admin.css";

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
  return n?.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }) ?? "—";
}

const ORDEN_ESTADOS: EstadoPedido[] = ["pendiente", "preparando", "listo", "entregado", "cancelado"];

// ─── Modal de confirmación cierre de caja ─────────────────────
function ModalCierreCaja({ cantidad, onConfirmar, onCancelar, cargando }: {
  cantidad: number;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando: boolean;
}) {
  return (
    <div className="cc-overlay">
      <div className="cc-modal">
        <div className="cc-icono">🧾</div>
        <h2 className="cc-titulo">¿Cerrar caja?</h2>
        <p className="cc-desc">
          Se van a archivar <strong>{cantidad}</strong> pedido{cantidad !== 1 ? "s" : ""}.
          Desaparecerán de la vista operativa pero quedarán guardados en el historial de Firebase.
        </p>
        <p className="cc-desc cc-desc--warn">Esta acción no se puede deshacer.</p>
        <div className="cc-btns">
          <button className="cc-btn-confirmar" onClick={onConfirmar} disabled={cargando}>
            {cargando ? "Cerrando caja..." : "Sí, cerrar caja"}
          </button>
          <button className="cc-btn-cancelar" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Comanda individual ───────────────────────────────────────
function Comanda({ pedido, onCambiarEstado }: {
  pedido: Pedido & { id: string };
  onCambiarEstado: (id: string, estado: EstadoPedido) => void;
}) {
  const est  = ESTADOS_PEDIDO[pedido.estado] ?? ESTADOS_PEDIDO.pendiente;
  const pago = METODOS_PAGO[pedido.cliente?.metodoPago];

  return (
    <article className="cmd-card" data-estado={pedido.estado}>
      <header className="cmd-header">
        <div className="cmd-header-left">
          <span className="cmd-estado-dot" style={{ background: est.color }} />
          <span className="cmd-estado-label" style={{ color: est.color }}>{est.emoji} {est.label}</span>
        </div>
        <span className="cmd-fecha">{formatFecha((pedido as any).fechaCreacion)}</span>
      </header>

      <div className="cmd-cliente">
        <span className="cmd-nombre">{pedido.cliente?.nombre ?? "—"}</span>
        <span className="cmd-tel">{pedido.cliente?.telefono ?? "—"}</span>
        <span className="cmd-entrega">
          {pedido.cliente?.tipoEntrega === "delivery" ? "🛵 Delivery" : "🥡 Takeaway"}
          {pago && <> · {pago.emoji} {pago.label}</>}
        </span>
        {pedido.cliente?.tipoEntrega === "delivery" && pedido.cliente?.direccion && (
          <span className="cmd-dir">📍 {pedido.cliente.direccion}</span>
        )}
        {pedido.cliente?.observacionesGenerales && (
          <span className="cmd-obs-gral">💬 {pedido.cliente.observacionesGenerales}</span>
        )}
      </div>

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

      <div className="cmd-acciones">
        {ORDEN_ESTADOS.filter((e) => e !== pedido.estado).map((e) => {
          const info = ESTADOS_PEDIDO[e];
          return (
            <button key={e} className="cmd-btn-estado"
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
  const { abierto, setAbierto } = useStore();

  const [pedidos, setPedidos]             = useState<(Pedido & { id: string })[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [filtro, setFiltro]               = useState<EstadoPedido | "todos">("todos");
  const [error, setError]                 = useState("");
  const [modalCierre, setModalCierre]     = useState(false);
  const [cerrandoCaja, setCerrandoCaja]   = useState(false);
  const [cierreMsj, setCierreMsj]         = useState("");

  // Solo pedidos NO archivados — realtime
  useEffect(() => {
    // Sin where() para evitar índice compuesto.
    // Filtramos archivado===false en el cliente para compatibilidad
    // con pedidos viejos que no tienen el campo.
    const q = query(
      collection(db, "orders"),
      orderBy("fechaCreacion", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() })) as (Pedido & { id: string })[];
        // archivado !== true cubre: false, undefined, null (pedidos viejos sin el campo)
        const activos = data.filter((p) => p.archivado !== true);
        setPedidos(activos);
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
    try { await actualizarEstado(id, estado); }
    catch (e) { console.error("Error actualizando estado:", e); }
  };

  const handleCerrarCaja = async () => {
    setCerrandoCaja(true);
    try {
      const n = await cerrarCaja();
      setModalCierre(false);
      setCierreMsj(`✅ Caja cerrada. ${n} pedido${n !== 1 ? "s" : ""} archivado${n !== 1 ? "s" : ""}.`);
      setTimeout(() => setCierreMsj(""), 5000);
    } catch (e) {
      console.error("Error cerrando caja:", e);
      setCierreMsj("❌ Error al cerrar caja. Intentá de nuevo.");
      setTimeout(() => setCierreMsj(""), 5000);
      setModalCierre(false);
    } finally {
      setCerrandoCaja(false);
    }
  };

  const pedidosFiltrados = filtro === "todos"
    ? pedidos
    : pedidos.filter((p) => p.estado === filtro);

  const contarPorEstado = (e: EstadoPedido) => pedidos.filter((p) => p.estado === e).length;

  return (
    <div className="adm-root">

      {/* Topbar */}
      <header className="adm-topbar">
        <h1 className="adm-titulo">🍔 Comandas</h1>
        <span className="adm-total-badge">{pedidos.length} pedidos</span>

        {/* Toggle abierto/cerrado */}
        <button
          className={`adm-store-toggle ${abierto ? "adm-store-toggle--abierto" : "adm-store-toggle--cerrado"}`}
          onClick={async () => {
            try {
              await setAbierto(!abierto);
            } catch(e: any) {
              alert("Error al cambiar estado: " + (e?.message || "Verificá las reglas de Firestore"));
            }
          }}
          title={abierto ? "Click para cerrar local" : "Click para abrir local"}
        >
          <span className={`adm-store-dot ${abierto ? "adm-store-dot--abierto" : "adm-store-dot--cerrado"}`} />
          {abierto ? "🟢 Local abierto" : "🔴 Local cerrado"}
        </button>

        {/* Cierre de caja */}
        <button
          className="adm-cierre-btn"
          onClick={() => setModalCierre(true)}
          disabled={pedidos.length === 0}
          title={pedidos.length === 0 ? "No hay pedidos activos" : "Cerrar caja"}
        >
          🧾 Cerrar caja
        </button>

        <a href="/historial" className="adm-logout-btn" style={{ textDecoration:"none" }}>📋 Historial</a>
        <button className="adm-logout-btn" onClick={logout} title="Cerrar sesión">Salir ↩</button>
      </header>

      {/* Banner mensaje post-cierre */}
      {cierreMsj && (
        <div className="adm-banner">{cierreMsj}</div>
      )}

      {/* Filtros */}
      <div className="adm-filtros">
        <button
          className={`adm-filtro-btn${filtro === "todos" ? " adm-filtro-btn--activo" : ""}`}
          onClick={() => setFiltro("todos")}
        >Todos</button>
        {ORDEN_ESTADOS.map((e) => {
          const info = ESTADOS_PEDIDO[e];
          const n    = contarPorEstado(e);
          return (
            <button key={e}
              className={`adm-filtro-btn${filtro === e ? " adm-filtro-btn--activo" : ""}`}
              style={filtro === e ? { borderColor: info.color, color: info.color } : {}}
              onClick={() => setFiltro(e)}
            >
              {info.emoji} {info.label} {n > 0 && <span className="adm-filtro-n">{n}</span>}
            </button>
          );
        })}
      </div>

      {/* Comandas */}
      <main className="adm-main">
        {cargando  && <div className="adm-msg">Cargando pedidos...</div>}
        {error     && <div className="adm-msg adm-msg--error">{error}</div>}
        {!cargando && !error && pedidosFiltrados.length === 0 && (
          <div className="adm-msg">
            {pedidos.length === 0
              ? "No hay pedidos activos. ¡Todo listo para empezar! 🍔"
              : `No hay pedidos con estado "${ESTADOS_PEDIDO[filtro as EstadoPedido]?.label}".`}
          </div>
        )}
        <div className="adm-grid">
          {pedidosFiltrados.map((p) => (
            <Comanda key={p.id} pedido={p} onCambiarEstado={handleCambiarEstado} />
          ))}
        </div>
      </main>

      {/* Modal confirmación cierre */}
      {modalCierre && (
        <ModalCierreCaja
          cantidad={pedidos.length}
          onConfirmar={handleCerrarCaja}
          onCancelar={() => setModalCierre(false)}
          cargando={cerrandoCaja}
        />
      )}
    </div>
  );
}
