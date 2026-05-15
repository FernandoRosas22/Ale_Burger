// ============================================================
// CarritoContext.tsx
// Estado global del carrito usando React Context + localStorage
// ============================================================

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

// ─── Tipos ───────────────────────────────────────────────────
export interface ProductoCarrito {
  id: string;        // nombre usado como id único
  nombre: string;
  precio: number;    // precio numérico (sin el $)
  precioStr: string; // precio formateado original
  imagen?: string;
  emoji: string;
  cantidad: number;
}

interface EstadoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
}

type AccionCarrito =
  | { type: "AGREGAR"; producto: Omit<ProductoCarrito, "cantidad"> }
  | { type: "QUITAR_UNO"; id: string }
  | { type: "ELIMINAR"; id: string }
  | { type: "VACIAR" }
  | { type: "TOGGLE_CARRITO" }
  | { type: "CERRAR_CARRITO" };

interface ContextoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
  totalItems: number;
  subtotal: number;
  agregarAlCarrito: (producto: Omit<ProductoCarrito, "cantidad">) => void;
  quitarUno: (id: string) => void;
  eliminarItem: (id: string) => void;
  vaciarCarrito: () => void;
  toggleCarrito: () => void;
  cerrarCarrito: () => void;
}

// ─── Reducer ─────────────────────────────────────────────────
const STORAGE_KEY = "aleburgers_carrito";

function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
  switch (accion.type) {
    case "AGREGAR": {
      const existente = estado.items.find((i) => i.id === accion.producto.id);
      const nuevosItems = existente
        ? estado.items.map((i) =>
            i.id === accion.producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
          )
        : [...estado.items, { ...accion.producto, cantidad: 1 }];
      return { ...estado, items: nuevosItems };
    }
    case "QUITAR_UNO": {
      const item = estado.items.find((i) => i.id === accion.id);
      if (!item) return estado;
      const nuevosItems =
        item.cantidad === 1
          ? estado.items.filter((i) => i.id !== accion.id)
          : estado.items.map((i) =>
              i.id === accion.id ? { ...i, cantidad: i.cantidad - 1 } : i
            );
      return { ...estado, items: nuevosItems };
    }
    case "ELIMINAR":
      return { ...estado, items: estado.items.filter((i) => i.id !== accion.id) };
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
  } catch { /* ignorar error de parse */ }
  return { items: [], abierto: false };
}

// Convierte string de precio "$13.050" → 13050
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

  // Persistir en localStorage cada vez que cambien los items
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.items));
  }, [estado.items]);

  // Cerrar carrito con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CERRAR_CARRITO" });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Bloquear scroll del body cuando el carrito está abierto
  useEffect(() => {
    document.body.style.overflow = estado.abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [estado.abierto]);

  const totalItems = estado.items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = estado.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items: estado.items,
        abierto: estado.abierto,
        totalItems,
        subtotal,
        agregarAlCarrito: (producto) => dispatch({ type: "AGREGAR", producto }),
        quitarUno: (id) => dispatch({ type: "QUITAR_UNO", id }),
        eliminarItem: (id) => dispatch({ type: "ELIMINAR", id }),
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
