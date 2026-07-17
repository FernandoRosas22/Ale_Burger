// ============================================================
// producto.types.ts — Tipos del módulo de gestión de productos
// ============================================================

import type { Timestamp } from "firebase/firestore";

export type CategoriaProducto = "promos" | "burgers" | "bebidas" | "acompanar";

export const CATEGORIAS: Record<CategoriaProducto, string> = {
  promos:    "Promos & Combos",
  burgers:   "Hamburguesas",
  bebidas:   "Bebidas",
  acompanar: "Para Acompañar",
};

export interface IngredienteProducto {
  id: string;
  nombre: string;
}

export interface ExtraProducto {
  id: string;
  nombre: string;
  precio: number;
}

export interface TamanioProducto {
  id: string;
  nombre: string;
  precio: number;
  precioAnt?: number;
}

// ─── Documento en Firestore products/ ────────────────────────
export interface Producto {
  id: string;            // Firestore doc ID
  name: string;          // Nombre visible
  slug: string;          // URL-friendly (generado automático)
  description: string;
  price: number;         // Precio base numérico
  priceOld?: number;     // Precio anterior tachado
  category: CategoriaProducto;
  imageUrl: string;      // URL pública de Firebase Storage
  imageRef: string;      // Path en Storage para poder borrarla
  ingredients: IngredienteProducto[];
  extras: ExtraProducto[];
  sizes: TamanioProducto[];
  available: boolean;    // Disponible / Agotado
  featured: boolean;     // Destacado
  visible: boolean;      // Visible en la carta
  order: number;         // Orden de aparición
  tag?: string;          // Badge ej: "🔥 Top", "10% OFF"
  emoji?: string;        // Fallback si no hay imagen
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─── Formulario local (sin id ni timestamps) ──────────────────
export type FormProducto = Omit<Producto, "id" | "createdAt" | "updatedAt">;

export const FORM_PRODUCTO_INICIAL: FormProducto = {
  name:        "",
  slug:        "",
  description: "",
  price:       0,
  priceOld:    undefined,
  category:    "burgers",
  imageUrl:    "",
  imageRef:    "",
  ingredients: [],
  extras:      [],
  sizes:       [],
  available:   true,
  featured:    false,
  visible:     true,
  order:       0,
  tag:         "",
  emoji:       "🍔",
};

// Helper: nombre → slug
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper: Producto → MenuItem compatible con el carrito existente
export function productoToMenuItem(p: Producto) {
  return {
    nombre:      p.name,
    desc:        p.description,
    precio:      `$${p.price.toLocaleString("es-AR")}`,
    precioAnt:   p.priceOld ? `$${p.priceOld.toLocaleString("es-AR")}` : undefined,
    tag:         p.tag,
    emoji:       p.emoji,
    destacado:   p.featured,
    img:         p.imageUrl || undefined,
    ingredientes: p.ingredients,
    tamanios:    p.sizes.length > 0 ? p.sizes : undefined,
  };
}
