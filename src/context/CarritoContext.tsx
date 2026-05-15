// ============================================================
// CarritoContext.tsx
// Estado global del carrito usando React Context + localStorage
// ============================================================

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { Ingrediente, Extra, MenuItem } from "@/data/menu";

// ─── Tipos ───────────────────────────────────────────────────
export interface PersonalizacionItem {
  ingredientesRemovidos: Ingrediente[];
  extrasAgregados: Extra[];
  observaciones: string;
}

export interface ProductoCarrito {
  cartId: string;      // id único por entrada en carrito (para soportar misma burger con distintas personalizaciones)
  id: string;          // nombre del producto (id original)
  nombre: string;
  precioBase: number;
  precioUnitario: number; // precioBase + extras
  precioStr: string;
  imagen?: string;
  emoji: string;
  cantidad: number;
  personalizacion: PersonalizacionItem;
}

interface EstadoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
}

type AccionCarrito =
  | { type: "AGREGAR"; item: ProductoCarrito }
  | { type: "QUITAR_UNO"; cartId: string }
  | { type: "ELIMINAR"; cartId: string }
  | { type: "VACIAR" }
  | { type: "TOGGLE_CARRITO" }
  | { type: "CERRAR_CARRITO" };

interface ContextoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
  totalItems: number;
  subtotal: number;
  agregarAlCarrito: (menuItem: MenuItem, personalizacion: PersonalizacionItem, cantidad: number, precioUnitario: number) => void;
  quitarUno: (cartId: string) => void;
  eliminarItem: (cartId: string) => void;
  vaciarCarrito: () => void;
  toggleCarrito: () => void;
  cerrarCarrito: () => void;
}

// ─── Reducer ─────────────────────────────────────────────────
const STORAGE_KEY = "aleburgers_carrito_v2";

function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.type) {
    case "AGREGAR":
      return { ...estado, items: [...estado.items, accion.item] };

    case "QUITAR_UNO": {
      const item = estado.items.find((i) => i.cartId === accion.cartId);
      if (!item) return estado;
      const nuevosItems =
        item.cantidad === 1
          ? estado.items.filter((i) => i.cartId !== accion.cartId)
          : estado.items.map((i) =>
              i.cartId === accion.cartId ? { ...i, cantidad: i.cantidad - 1 } : i
            );
      return { ...estado, items: nuevosItems };
    }

    case "ELIMINAR":
      return { ...estado, items: estado.items.filter((i) => i.cartId !== accion.cartId) };

    case "VACIAR":
      return { ...estado, items: [] };

    case "TOGGLE_CARRITO":
      return { ...estado, abierto: !estado.abierto };

    case "CERRAR_CARRITO":
      return { ...estado, abierto: false };

    default:
      return estado;
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function cargarDesdeStorage(): EstadoCarrito {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) return { items: JSON.parse(guardado), abierto: false };
  } catch { /* ignorar */ }
  return { items: [], abierto: false };
}

export function parsePrecio(precioStr: string): number {
  return Number(precioStr.replace(/[$.]/g, "").replace(",", ".")) || 0;
}

export function formatPrecio(n: number): string {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

// ─── Context ─────────────────────────────────────────────────
const CarritoContext = createContext<ContextoCarrito | null>(null);

// ─── Provider ────────────────────────────────────────────────
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(carritoReducer, undefined, cargarDesdeStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.items));
  }, [estado.items]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CERRAR_CARRITO" });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = estado.abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [estado.abierto]);

  const totalItems = estado.items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal   = estado.items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);

  const agregarAlCarrito = (
    menuItem: MenuItem,
    personalizacion: PersonalizacionItem,
    cantidad: number,
    precioUnitario: number
  ) => {
    const precioBase = parsePrecio(menuItem.precio);
    const newItem: ProductoCarrito = {
      cartId: crypto.randomUUID(),
      id: menuItem.nombre,
      nombre: menuItem.nombre,
      precioBase,
      precioUnitario,
      precioStr: menuItem.precio,
      imagen: menuItem.img,
      emoji: menuItem.emoji,
      cantidad,
      personalizacion,
    };
    dispatch({ type: "AGREGAR", item: newItem });
  };

  return (
    <CarritoContext.Provider
      value={{
        items: estado.items,
        abierto: estado.abierto,
        totalItems,
        subtotal,
        agregarAlCarrito,
        quitarUno: (cartId) => dispatch({ type: "QUITAR_UNO", cartId }),
        eliminarItem: (cartId) => dispatch({ type: "ELIMINAR", cartId }),
        vaciarCarrito: () => dispatch({ type: "VACIAR" }),
        toggleCarrito: () => dispatch({ type: "TOGGLE_CARRITO" }),
        cerrarCarrito: () => dispatch({ type: "CERRAR_CARRITO" }),
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────
export function useCarrito(): ContextoCarrito {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
