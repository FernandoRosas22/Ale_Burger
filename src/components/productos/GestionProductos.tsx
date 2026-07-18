// ============================================================
// GestionProductos.tsx — Pestaña de productos dentro del panel admin
// ============================================================

import { useState, useMemo } from "react";
import { useProductos } from "@/hooks/useProductos";
import {
  eliminarProducto,
  duplicarProducto,
  toggleVisible,
  toggleDisponible,
  actualizarProducto,
} from "@/services/productos.service";
import ProductoFormModal from "./ProductoFormModal";
import ToastNotif, { useToasts } from "./ToastNotif";
import MigrarProductos from "./MigrarProductos";
import { CATEGORIAS, type Producto, type CategoriaProducto } from "@/types/producto.types";
import { formatPrecio } from "@/context/CarritoContext";

export default function GestionProductos() {
  const { productos, cargando, error } = useProductos();
  const { toasts, agregar, quitar }    = useToasts();

  const [busqueda,      setBusqueda]      = useState("");
  const [filtroCateg,   setFiltroCateg]   = useState<CategoriaProducto | "todos">("todos");
  const [productoEdit,  setProductoEdit]  = useState<Producto | null>(null);
  const [modalAbierto,  setModalAbierto]  = useState(false);
  const [confirmElim,   setConfirmElim]   = useState<Producto | null>(null);
  const [eliminando,    setEliminando]    = useState(false);

  // ─── Filtrado ─────────────────────────────────────────────
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusq  = p.name.toLowerCase().includes(busqueda.toLowerCase());
      const matchCateg = filtroCateg === "todos" || p.category === filtroCateg;
      return matchBusq && matchCateg;
    });
  }, [productos, busqueda, filtroCateg]);

  // ─── Acciones ─────────────────────────────────────────────
  const handleNuevo = () => {
    setProductoEdit(null);
    setModalAbierto(true);
  };

  const handleEditar = (p: Producto) => {
    setProductoEdit(p);
    setModalAbierto(true);
  };

  const handleDuplicar = async (p: Producto) => {
    try {
      await duplicarProducto(p);
      agregar(`"${p.name}" duplicado como borrador ✓`, "ok");
    } catch {
      agregar("Error al duplicar", "error");
    }
  };

  const handleToggleVisible = async (p: Producto) => {
    try {
      await toggleVisible(p.id, !p.visible);
      agregar(`"${p.name}" ${!p.visible ? "visible" : "oculto"} ✓`, "ok");
    } catch {
      agregar("Error al cambiar visibilidad", "error");
    }
  };

  const handleToggleDisponible = async (p: Producto) => {
    try {
      await toggleDisponible(p.id, !p.available);
      agregar(`"${p.name}" marcado como ${!p.available ? "disponible" : "agotado"} ✓`, "ok");
    } catch {
      agregar("Error al cambiar disponibilidad", "error");
    }
  };

  const handleSetTag = async (p: Producto, tag: string) => {
    try {
      await actualizarProducto(p.id, { tag });
      agregar(tag ? `Badge "${tag}" aplicado ✓` : "Badge removido ✓", "ok");
    } catch {
      agregar("Error al actualizar badge", "error");
    }
  };

  const handleEliminarConfirmar = async () => {
    if (!confirmElim) return;
    setEliminando(true);
    try {
      await eliminarProducto(confirmElim.id);
      agregar(`"${confirmElim.name}" eliminado`, "ok");
      setConfirmElim(null);
    } catch {
      agregar("Error al eliminar", "error");
    } finally {
      setEliminando(false);
    }
  };

  const [migrado, setMigrado] = useState(false);

  // Mostrar banner de migración si no hay productos y ya terminó de cargar
  const mostrarMigracion = !cargando && !error && productos.length === 0 && !migrado;
  const stats = useMemo(() => ({
    total:      productos.length,
    visibles:   productos.filter((p) => p.visible).length,
    agotados:   productos.filter((p) => !p.available).length,
    destacados: productos.filter((p) => p.featured).length,
  }), [productos]);

  return (
    <div className="gp-root">

      {/* ── Stats rápidas ── */}
      <div className="gp-stats">
        <div className="gp-stat"><span className="gp-stat-n">{stats.total}</span><span>Total</span></div>
        <div className="gp-stat"><span className="gp-stat-n gp-stat-n--ok">{stats.visibles}</span><span>Visibles</span></div>
        <div className="gp-stat"><span className="gp-stat-n gp-stat-n--warn">{stats.agotados}</span><span>Agotados</span></div>
        <div className="gp-stat"><span className="gp-stat-n gp-stat-n--star">{stats.destacados}</span><span>Destacados</span></div>
      </div>

      {/* ── Barra de herramientas ── */}
      <div className="gp-toolbar">
        <input
          className="gp-busqueda"
          type="search"
          placeholder="🔍 Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="gp-select"
          value={filtroCateg}
          onChange={(e) => setFiltroCateg(e.target.value as any)}
        >
          <option value="todos">Todas las categorías</option>
          {(Object.entries(CATEGORIAS) as [string, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button className="gp-btn-nuevo" onClick={handleNuevo}>
          ➕ Nuevo producto
        </button>
      </div>

      {/* ── Contenido ── */}
      {cargando && (
        <div className="gp-loading">
          {[1,2,3,4].map((i) => <div key={i} className="gp-skeleton" />)}
        </div>
      )}

      {error && (
        <div className="gp-error">
          ⚠️ {error}
          {error.includes("indexes") && (
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Necesitás crear un índice en Firestore para el campo "order". Seguí el link del error en la consola del navegador.
            </p>
          )}
        </div>
      )}

      {/* ── Banner de migración (solo cuando no hay productos) ── */}
      {mostrarMigracion && (
        <MigrarProductos onMigrado={() => setMigrado(true)} />
      )}

      {!cargando && !error && productosFiltrados.length === 0 && !mostrarMigracion && (
        <div className="gp-vacio">
          {productos.length === 0
            ? <>
                <span style={{ fontSize: "2.5rem" }}>🍔</span>
                <p>Todavía no hay productos.</p>
                <button className="gp-btn-nuevo" onClick={handleNuevo}>Crear el primero</button>
              </>
            : <p>No hay productos que coincidan con la búsqueda.</p>
          }
        </div>
      )}

      {/* ── Tabla de productos ── */}
      {!cargando && productosFiltrados.length > 0 && (
        <div className="gp-tabla-wrap">
          <table className="gp-tabla">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id} className={`gp-row${!p.visible ? " gp-row--oculto" : ""}${p.featured ? " gp-row--featured" : ""}`}>

                  {/* Imagen */}
                  <td className="gp-td-img">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="gp-miniatura" loading="lazy" />
                      : <span className="gp-miniatura-emoji">{p.emoji || "🍔"}</span>
                    }
                  </td>

                  {/* Nombre */}
                  <td className="gp-td-nombre">
                    <span className="gp-nombre">{p.name}</span>
                    {p.tag && <span className="gp-tag-chip">{p.tag}</span>}
                    {p.featured && <span className="gp-badge-star">⭐</span>}
                    {!p.visible && <span className="gp-badge-oculto">Oculto</span>}
                  </td>

                  {/* Categoría */}
                  <td className="gp-td-cat">
                    <span className="gp-categ">{CATEGORIAS[p.category]}</span>
                  </td>

                  {/* Precio */}
                  <td className="gp-td-precio">
                    {p.priceOld && <span className="gp-precio-ant">{formatPrecio(p.priceOld)}</span>}
                    <span className="gp-precio">{formatPrecio(p.price)}</span>
                  </td>

                  {/* Estado */}
                  <td className="gp-td-estado">
                    <div className="gp-estados">
                      <button
                        className={`gp-toggle${p.available ? " gp-toggle--on" : " gp-toggle--off"}`}
                        onClick={() => handleToggleDisponible(p)}
                        title={p.available ? "Disponible — click para agotar" : "Agotado — click para activar"}
                      >
                        {p.available ? "✅ Disp." : "❌ Agotado"}
                      </button>
                      <button
                        className={`gp-toggle${p.visible ? " gp-toggle--on" : " gp-toggle--off"}`}
                        onClick={() => handleToggleVisible(p)}
                        title={p.visible ? "Visible — click para ocultar" : "Oculto — click para mostrar"}
                      >
                        {p.visible ? "👁 Visible" : "🙈 Oculto"}
                      </button>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="gp-td-acciones">
                    <button className="gp-accion gp-accion--edit"  onClick={() => handleEditar(p)}    title="Editar">✏️</button>
                    <button className="gp-accion gp-accion--dup"   onClick={() => handleDuplicar(p)}  title="Duplicar">📋</button>
                    {/* Badges rápidos */}
                    <button
                      className={`gp-accion${p.tag === "🔥 Más vendido" ? " gp-accion--badge-on" : ""}`}
                      onClick={() => handleSetTag(p, p.tag === "🔥 Más vendido" ? "" : "🔥 Más vendido")}
                      title="Marcar como Más vendido"
                    >🔥</button>
                    <button
                      className={`gp-accion${p.tag === "✨ Nuevo" ? " gp-accion--badge-on" : ""}`}
                      onClick={() => handleSetTag(p, p.tag === "✨ Nuevo" ? "" : "✨ Nuevo")}
                      title="Marcar como Nuevo"
                    >✨</button>
                    <button
                      className={`gp-accion${p.tag === "🏷 Oferta" ? " gp-accion--badge-on" : ""}`}
                      onClick={() => handleSetTag(p, p.tag === "🏷 Oferta" ? "" : "🏷 Oferta")}
                      title="Marcar como Oferta"
                    >🏷</button>
                    <button className="gp-accion gp-accion--del"   onClick={() => setConfirmElim(p)}  title="Eliminar">🗑</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal formulario ── */}
      <ProductoFormModal
        producto={productoEdit}
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardado={(msg) => agregar(msg, "ok")}
      />

      {/* ── Modal confirmación eliminar ── */}
      {confirmElim && (
        <div className="gp-confirm-overlay">
          <div className="gp-confirm-modal">
            <div className="gp-confirm-icon">🗑</div>
            <h3>¿Eliminar "{confirmElim.name}"?</h3>
            <p>Se eliminará el producto y su imagen de Storage.<br />Esta acción no se puede deshacer.</p>
            <div className="gp-confirm-btns">
              <button
                className="gp-confirm-btn gp-confirm-btn--del"
                onClick={handleEliminarConfirmar}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                className="gp-confirm-btn gp-confirm-btn--cancel"
                onClick={() => setConfirmElim(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <ToastNotif toasts={toasts} onRemove={quitar} />

    </div>
  );
}
