// ============================================================
// ProductoFormModal.tsx — Formulario crear/editar producto
// ============================================================

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ImagenUploader from "./ImagenUploader";
import {
  FORM_PRODUCTO_INICIAL,
  CATEGORIAS,
  toSlug,
  type FormProducto,
  type Producto,
  type IngredienteProducto,
  type TamanioProducto,
} from "@/types/producto.types";
import { crearProducto, actualizarProducto } from "@/services/productos.service";
import { formatPrecio } from "@/context/CarritoContext";

interface ProductoFormModalProps {
  producto: Producto | null; // null = crear nuevo
  isOpen: boolean;
  onClose: () => void;
  onGuardado: (msg: string) => void;
}

export default function ProductoFormModal({
  producto,
  isOpen,
  onClose,
  onGuardado,
}: ProductoFormModalProps) {
  const [form,      setForm]      = useState<FormProducto>(FORM_PRODUCTO_INICIAL);
  const [errores,   setErrores]   = useState<Partial<Record<keyof FormProducto, string>>>({});
  const [guardando, setGuardando] = useState(false);

  // ─── Inputs temporales para ingredientes/tamaños ──────────
  const [ingInput,  setIngInput]  = useState("");
  const [tamNombre, setTamNombre] = useState("");
  const [tamPrecio, setTamPrecio] = useState("");

  // Populate form al editar
  useEffect(() => {
    if (!isOpen) return;
    if (producto) {
      const { id, createdAt, updatedAt, ...rest } = producto;
      setForm({ ...FORM_PRODUCTO_INICIAL, ...rest });
    } else {
      setForm(FORM_PRODUCTO_INICIAL);
    }
    setErrores({});
    setIngInput("");
    setTamNombre("");
    setTamPrecio("");
  }, [isOpen, producto?.id]);

  // Escape para cerrar
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen && !guardando) onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, guardando, onClose]);

  // Auto-generar slug desde nombre
  const handleNombre = (val: string) => {
    setForm((f) => ({ ...f, name: val, slug: toSlug(val) }));
    if (errores.name) setErrores((e) => ({ ...e, name: undefined }));
  };

  const setField = <K extends keyof FormProducto>(key: K, val: FormProducto[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errores[key]) setErrores((e) => ({ ...e, [key]: undefined }));
  };

  // ─── Validación ───────────────────────────────────────────
  function validar(): boolean {
    const errs: typeof errores = {};
    if (!form.name.trim())        errs.name     = "El nombre es obligatorio";
    if (form.price <= 0)          errs.price    = "El precio debe ser mayor a 0";
    if (!form.category)           errs.category = "Elegí una categoría";
    setErrores(errs);
    return Object.keys(errs).length === 0;
  }

  // ─── Guardar ─────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      if (producto) {
        await actualizarProducto(producto.id, form);
        onGuardado("Producto actualizado ✓");
      } else {
        await crearProducto(form);
        onGuardado("Producto creado ✓");
      }
      onClose();
    } catch (e: any) {
      setErrores({ name: "Error al guardar: " + (e?.message ?? "Intentá de nuevo") });
    } finally {
      setGuardando(false);
    }
  };

  // ─── Ingredientes ─────────────────────────────────────────
  const agregarIngrediente = () => {
    const nombre = ingInput.trim();
    if (!nombre) return;
    const nuevo: IngredienteProducto = { id: toSlug(nombre), nombre };
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, nuevo] }));
    setIngInput("");
  };

  const quitarIngrediente = (id: string) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((i) => i.id !== id) }));
  };

  // ─── Tamaños ──────────────────────────────────────────────
  const agregarTamanio = () => {
    const nombre = tamNombre.trim();
    const precio = Number(tamPrecio);
    if (!nombre || precio <= 0) return;
    const nuevo: TamanioProducto = { id: toSlug(nombre), nombre: nombre.toUpperCase(), precio };
    setForm((f) => ({ ...f, sizes: [...f.sizes, nuevo] }));
    setTamNombre("");
    setTamPrecio("");
  };

  const quitarTamanio = (id: string) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s.id !== id) }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="pf-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pf-container">

        {/* Header */}
        <div className="pf-header">
          <h2 className="pf-titulo">
            {producto ? "✏️ Editar producto" : "➕ Nuevo producto"}
          </h2>
          {!guardando && (
            <button className="pf-cerrar" onClick={onClose} aria-label="Cerrar">✕</button>
          )}
        </div>

        {/* Body */}
        <div className="pf-body">

          {/* ── Imagen ── */}
          <div className="pf-section">
            <label className="pf-label">Imagen</label>
            <ImagenUploader
              imageUrl={form.imageUrl}
              imageRef={form.imageRef}
              onChange={(url, ref) => setForm((f) => ({ ...f, imageUrl: url, imageRef: ref }))}
              disabled={guardando}
            />
          </div>

          {/* ── Nombre ── */}
          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-name">Nombre *</label>
            <input
              id="pf-name"
              className={`pf-input${errores.name ? " pf-input--error" : ""}`}
              value={form.name}
              onChange={(e) => handleNombre(e.target.value)}
              placeholder="Ej: Golden Burger"
              maxLength={80}
              disabled={guardando}
            />
            {errores.name && <span className="pf-error">{errores.name}</span>}
          </div>

          {/* ── Descripción ── */}
          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-desc">Descripción</label>
            <textarea
              id="pf-desc"
              className="pf-textarea"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ingredientes, características..."
              maxLength={300}
              rows={3}
              disabled={guardando}
            />
          </div>

          {/* ── Precio y Precio anterior ── */}
          <div className="pf-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-price">Precio *</label>
              <input
                id="pf-price"
                className={`pf-input${errores.price ? " pf-input--error" : ""}`}
                type="number"
                min={0}
                value={form.price || ""}
                onChange={(e) => setField("price", Number(e.target.value))}
                placeholder="14500"
                disabled={guardando}
              />
              {form.price > 0 && (
                <span className="pf-preview-precio">{formatPrecio(form.price)}</span>
              )}
              {errores.price && <span className="pf-error">{errores.price}</span>}
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-price-old">Precio anterior (tachado)</label>
              <input
                id="pf-price-old"
                className="pf-input"
                type="number"
                min={0}
                value={form.priceOld || ""}
                onChange={(e) => setField("priceOld", Number(e.target.value) || undefined)}
                placeholder="17500"
                disabled={guardando}
              />
              {form.priceOld && form.priceOld > 0 && (
                <span className="pf-preview-precio pf-preview-precio--ant">{formatPrecio(form.priceOld)}</span>
              )}
            </div>
          </div>

          {/* ── Categoría ── */}
          <div className="pf-field">
            <label className="pf-label">Categoría *</label>
            <div className="pf-cat-grid">
              {(Object.entries(CATEGORIAS) as [string, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`pf-cat-btn${form.category === key ? " pf-cat-btn--activo" : ""}`}
                  onClick={() => setField("category", key as any)}
                  disabled={guardando}
                >
                  {label}
                </button>
              ))}
            </div>
            {errores.category && <span className="pf-error">{errores.category}</span>}
          </div>

          {/* ── Tag / Badge ── */}
          <div className="pf-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-tag">Badge / Tag</label>
              <input
                id="pf-tag"
                className="pf-input"
                value={form.tag || ""}
                onChange={(e) => setField("tag", e.target.value)}
                placeholder="🔥 Top, 10% OFF, Nuevo..."
                maxLength={30}
                disabled={guardando}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-emoji">Emoji (fallback)</label>
              <input
                id="pf-emoji"
                className="pf-input"
                value={form.emoji || ""}
                onChange={(e) => setField("emoji", e.target.value)}
                placeholder="🍔"
                maxLength={4}
                disabled={guardando}
              />
            </div>
          </div>

          {/* ── Orden ── */}
          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-order">Orden de aparición</label>
            <input
              id="pf-order"
              className="pf-input"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setField("order", Number(e.target.value))}
              disabled={guardando}
            />
            <span className="pf-hint">Número menor = aparece primero</span>
          </div>

          {/* ── Switches ── */}
          <div className="pf-switches">
            {([
              ["available", "Disponible", "Si está agotado, se muestra deshabilitado"],
              ["visible",   "Visible en la carta", "Si está oculto, no aparece para los clientes"],
              ["featured",  "Destacado", "Aparece con borde naranja especial"],
            ] as [keyof FormProducto, string, string][]).map(([key, label, hint]) => (
              <label key={key} className="pf-switch-row">
                <div className="pf-switch-info">
                  <span className="pf-switch-label">{label}</span>
                  <span className="pf-switch-hint">{hint}</span>
                </div>
                <div
                  className={`pf-switch${form[key] ? " pf-switch--on" : ""}`}
                  onClick={() => setField(key, !form[key] as any)}
                  role="switch"
                  aria-checked={!!form[key]}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setField(key, !form[key] as any)}
                >
                  <div className="pf-switch-thumb" />
                </div>
              </label>
            ))}
          </div>

          {/* ── Ingredientes removibles ── */}
          <div className="pf-section">
            <label className="pf-label">Ingredientes (que el cliente puede pedir sacar)</label>
            <div className="pf-tags-wrap">
              {form.ingredients.map((ing) => (
                <span key={ing.id} className="pf-tag">
                  {ing.nombre}
                  <button onClick={() => quitarIngrediente(ing.id)} type="button" aria-label={`Quitar ${ing.nombre}`}>✕</button>
                </span>
              ))}
            </div>
            <div className="pf-add-row">
              <input
                className="pf-input"
                value={ingInput}
                onChange={(e) => setIngInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarIngrediente())}
                placeholder="Ej: Pickles"
                maxLength={40}
                disabled={guardando}
              />
              <button type="button" className="pf-btn-add" onClick={agregarIngrediente} disabled={guardando}>
                + Agregar
              </button>
            </div>
          </div>

          {/* ── Tamaños ── */}
          <div className="pf-section">
            <label className="pf-label">Tamaños / Variantes de precio</label>
            {form.sizes.length > 0 && (
              <div className="pf-sizes-list">
                {form.sizes.map((s) => (
                  <div key={s.id} className="pf-size-row">
                    <span className="pf-size-nombre">{s.nombre}</span>
                    <span className="pf-size-precio">{formatPrecio(s.precio)}</span>
                    <button type="button" onClick={() => quitarTamanio(s.id)} className="pf-btn-remove" aria-label={`Quitar ${s.nombre}`}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="pf-add-row">
              <input
                className="pf-input"
                value={tamNombre}
                onChange={(e) => setTamNombre(e.target.value)}
                placeholder="Ej: SIMPLE"
                maxLength={20}
                disabled={guardando}
              />
              <input
                className="pf-input pf-input--sm"
                type="number"
                min={0}
                value={tamPrecio}
                onChange={(e) => setTamPrecio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarTamanio())}
                placeholder="Precio"
                disabled={guardando}
              />
              <button type="button" className="pf-btn-add" onClick={agregarTamanio} disabled={guardando}>
                + Agregar
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pf-footer">
          <button className="pf-btn-cancelar" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="pf-btn-guardar" onClick={handleGuardar} disabled={guardando}>
            {guardando
              ? (producto ? "Guardando..." : "Creando...")
              : (producto ? "Guardar cambios" : "Crear producto")}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
