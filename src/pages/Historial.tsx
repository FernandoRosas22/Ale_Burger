// ============================================================
// Historial.tsx — Pedidos archivados con resumen de ventas
// ============================================================

import { useEffect, useState, useMemo } from "react";
import {
  collection, onSnapshot, orderBy, query, Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { METODOS_PAGO, type Pedido } from "@/types/order.types";
import "@/styles/historial.css";

// ─── Helpers ──────────────────────────────────────────────────
function formatPrecio(n: number): string {
  return (n ?? 0).toLocaleString("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  });
}

function formatFecha(val: Timestamp | string | undefined): string {
  if (!val) return "—";
  const d = val instanceof Timestamp ? val.toDate() : new Date(val);
  return d.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function fechaDia(val: Timestamp | string | undefined): string {
  if (!val) return "Sin fecha";
  const d = val instanceof Timestamp ? val.toDate() : new Date(val);
  return d.toLocaleDateString("es-AR", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function fechaCierre(val: Timestamp | string | undefined): string {
  if (!val) return "";
  const d = val instanceof Timestamp ? val.toDate() : new Date(val);
  return d.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Tarjeta resumen de un cierre ─────────────────────────────
function ResumenCierre({ pedidos, fechaCierreStr }: {
  pedidos: (Pedido & { id: string })[];
  fechaCierreStr: string;
}) {
  const efectivo      = pedidos.filter(p => p.cliente?.metodoPago === "efectivo");
  const transferencia = pedidos.filter(p => p.cliente?.metodoPago === "transferencia");
  const debito        = pedidos.filter(p => p.cliente?.metodoPago === "debito");
  const credito       = pedidos.filter(p => p.cliente?.metodoPago === "credito");

  const totalEfectivo      = efectivo.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalTransferencia = transferencia.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalDebito        = debito.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalCredito       = credito.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalGeneral       = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalDescuentos    = pedidos.reduce((s, p) => s + (p.descuento ?? 0), 0);

  // Items más vendidos
  const conteoItems: Record<string, number> = {};
  pedidos.forEach(p => {
    p.items?.forEach(item => {
      conteoItems[item.nombre] = (conteoItems[item.nombre] ?? 0) + item.cantidad;
    });
  });
  const topItems = Object.entries(conteoItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="hist-cierre">
      <div className="hist-cierre-header">
        <div className="hist-cierre-titulo">
          <span className="hist-cierre-icono">🧾</span>
          <div>
            <div className="hist-cierre-fecha">{fechaCierreStr}</div>
            <div className="hist-cierre-sub">{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="hist-cierre-total-grande">{formatPrecio(totalGeneral)}</div>
      </div>

      {/* Breakdown por método de pago */}
      <div className="hist-breakdown">
        {efectivo.length > 0 && (
          <div className="hist-breakdown-row hist-breakdown-row--efectivo">
            <span>💵 Efectivo <span className="hist-cant">({efectivo.length})</span></span>
            <strong>{formatPrecio(totalEfectivo)}</strong>
          </div>
        )}
        {transferencia.length > 0 && (
          <div className="hist-breakdown-row hist-breakdown-row--transferencia">
            <span>📲 Transferencia <span className="hist-cant">({transferencia.length})</span></span>
            <strong>{formatPrecio(totalTransferencia)}</strong>
          </div>
        )}
        {debito.length > 0 && (
          <div className="hist-breakdown-row">
            <span>💳 Débito <span className="hist-cant">({debito.length})</span></span>
            <strong>{formatPrecio(totalDebito)}</strong>
          </div>
        )}
        {credito.length > 0 && (
          <div className="hist-breakdown-row">
            <span>💳 Crédito <span className="hist-cant">({credito.length})</span></span>
            <strong>{formatPrecio(totalCredito)}</strong>
          </div>
        )}
        {totalDescuentos > 0 && (
          <div className="hist-breakdown-row hist-breakdown-row--desc">
            <span>🏷 Descuentos aplicados</span>
            <span>−{formatPrecio(totalDescuentos)}</span>
          </div>
        )}
      </div>

      {/* Top items */}
      {topItems.length > 0 && (
        <div className="hist-top">
          <div className="hist-top-titulo">🍔 Más vendido</div>
          {topItems.map(([nombre, cant]) => (
            <div key={nombre} className="hist-top-row">
              <span>{nombre}</span>
              <span className="hist-top-cant">{cant}x</span>
            </div>
          ))}
        </div>
      )}

      {/* Lista de pedidos del cierre */}
      <details className="hist-detalle">
        <summary className="hist-detalle-summary">Ver pedidos ({pedidos.length})</summary>
        <div className="hist-pedidos-lista">
          {pedidos.map((p) => {
            const pago = METODOS_PAGO[p.cliente?.metodoPago];
            return (
              <div key={p.id} className="hist-pedido-row">
                <div className="hist-pedido-left">
                  <span className="hist-pedido-nombre">{p.cliente?.nombre ?? "—"}</span>
                  <span className="hist-pedido-detalle">
                    {p.items?.map(i => `${i.cantidad}× ${i.nombre}`).join(" · ")}
                  </span>
                  <span className="hist-pedido-meta">
                    {p.cliente?.tipoEntrega === "delivery" ? "🛵" : "🏠"}
                    {pago && <> · {pago.emoji} {pago.label}</>}
                    · {formatFecha((p as any).fechaCreacion)}
                  </span>
                </div>
                <span className="hist-pedido-total">{formatPrecio(p.total)}</span>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

// ─── Página Historial ─────────────────────────────────────────
export default function Historial() {
  const { logout } = useAuth();
  const [pedidos, setPedidos]   = useState<(Pedido & { id: string })[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("fechaCreacion", "desc"));
    const unsub = onSnapshot(q,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as (Pedido & { id: string })[];
        // Solo los archivados
        setPedidos(data.filter(p => p.archivado === true));
        setCargando(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudo cargar el historial.");
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  // Agrupar por fechaCierre (día)
  const grupos = useMemo(() => {
    const mapa: Record<string, { pedidos: (Pedido & { id: string })[]; fechaCierreStr: string }> = {};
    pedidos.forEach(p => {
      const cierre = (p as any).fechaCierre;
      const dia = cierre instanceof Timestamp
        ? cierre.toDate().toLocaleDateString("es-AR")
        : cierre
          ? new Date(cierre).toLocaleDateString("es-AR")
          : "Sin fecha de cierre";

      const str = cierre instanceof Timestamp
        ? fechaCierre(cierre)
        : cierre ? fechaCierre(cierre) : "Sin fecha";

      if (!mapa[dia]) mapa[dia] = { pedidos: [], fechaCierreStr: str };
      mapa[dia].pedidos.push(p);
    });
    return Object.entries(mapa);
  }, [pedidos]);

  // Totales globales
  const totalGlobal       = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);
  const totalEfectivoG    = pedidos.filter(p => p.cliente?.metodoPago === "efectivo").reduce((s, p) => s + (p.total ?? 0), 0);
  const totalTransG       = pedidos.filter(p => p.cliente?.metodoPago === "transferencia").reduce((s, p) => s + (p.total ?? 0), 0);
  const totalDebitoG      = pedidos.filter(p => p.cliente?.metodoPago === "debito").reduce((s, p) => s + (p.total ?? 0), 0);
  const totalCreditoG     = pedidos.filter(p => p.cliente?.metodoPago === "credito").reduce((s, p) => s + (p.total ?? 0), 0);

  return (
    <div className="hist-root">
      <header className="adm-topbar">
        <h1 className="adm-titulo">📋 Historial</h1>
        <span className="adm-total-badge">{pedidos.length} pedidos archivados</span>
        <a href="/admin" className="adm-logout-btn" style={{ textDecoration: "none" }}>← Comandas</a>
        <button className="adm-logout-btn" onClick={logout}>Salir ↩</button>
      </header>

      {/* Resumen global */}
      {pedidos.length > 0 && (
        <div className="hist-global">
          <div className="hist-global-titulo">💰 Total acumulado</div>
          <div className="hist-global-monto">{formatPrecio(totalGlobal)}</div>
          <div className="hist-global-breakdown">
            {totalEfectivoG > 0 && (
              <div className="hist-global-item">
                <span>💵 Efectivo</span>
                <strong>{formatPrecio(totalEfectivoG)}</strong>
              </div>
            )}
            {totalTransG > 0 && (
              <div className="hist-global-item">
                <span>📲 Transferencia</span>
                <strong>{formatPrecio(totalTransG)}</strong>
              </div>
            )}
            {totalDebitoG > 0 && (
              <div className="hist-global-item">
                <span>💳 Débito</span>
                <strong>{formatPrecio(totalDebitoG)}</strong>
              </div>
            )}
            {totalCreditoG > 0 && (
              <div className="hist-global-item">
                <span>💳 Crédito</span>
                <strong>{formatPrecio(totalCreditoG)}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="adm-main">
        {cargando && <div className="adm-msg">Cargando historial...</div>}
        {error    && <div className="adm-msg adm-msg--error">{error}</div>}
        {!cargando && !error && pedidos.length === 0 && (
          <div className="adm-msg">No hay cierres de caja registrados todavía.</div>
        )}
        <div className="hist-grupos">
          {grupos.map(([dia, { pedidos: peds, fechaCierreStr }]) => (
            <div key={dia} className="hist-grupo">
              <div className="hist-grupo-dia">{dia}</div>
              <ResumenCierre pedidos={peds} fechaCierreStr={fechaCierreStr} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
