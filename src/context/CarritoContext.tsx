import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { Ingrediente, Extra, MenuItem } from "@/data/menu";
import { type Zona, SIN_ZONA } from "@/data/zonas";

export interface PersonalizacionItem {
  ingredientesRemovidos: Ingrediente[];
  extrasAgregados: Extra[];
  observaciones: string;
}

export interface ProductoCarrito {
  cartId: string;
  id: string;
  nombre: string;
  precioBase: number;
  precioUnitario: number;
  precioStr: string;
  imagen?: string;
  emoji: string;
  cantidad: number;
  personalizacion: PersonalizacionItem;
}

interface EstadoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
  zonaEnvio: Zona;
  direccionEnvio: string;
}

type AccionCarrito =
  | { type: "AGREGAR"; item: ProductoCarrito }
  | { type: "QUITAR_UNO"; cartId: string }
  | { type: "ELIMINAR"; cartId: string }
  | { type: "VACIAR" }
  | { type: "TOGGLE_CARRITO" }
  | { type: "CERRAR_CARRITO" }
  | { type: "SET_ZONA"; zona: Zona }
  | { type: "SET_DIRECCION"; direccion: string };

interface ContextoCarrito {
  items: ProductoCarrito[];
  abierto: boolean;
  totalItems: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  zonaEnvio: Zona;
  direccionEnvio: string;
  agregarAlCarrito: (menuItem: MenuItem, personalizacion: PersonalizacionItem, cantidad: number, precioUnitario: number) => void;
  quitarUno: (cartId: string) => void;
  eliminarItem: (cartId: string) => void;
  vaciarCarrito: () => void;
  toggleCarrito: () => void;
  cerrarCarrito: () => void;
  setZonaEnvio: (zona: Zona) => void;
  setDireccionEnvio: (direccion: string) => void;
}

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

    case "SET_ZONA":
      return { ...estado, zonaEnvio: accion.zona };

    case "SET_DIRECCION":
      return { ...estado, direccionEnvio: accion.direccion };

    default:
      return estado;
  }
}

function cargarDesdeStorage(): EstadoCarrito {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) return { items: JSON.parse(guardado), abierto: false, zonaEnvio: SIN_ZONA, direccionEnvio: "" };
  } catch { /* ignorar */ }
  return { items: [], abierto: false, zonaEnvio: SIN_ZONA, direccionEnvio: "" };
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

const CarritoContext = createContext<ContextoCarrito | null>(null);

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
  const costoEnvio = estado.zonaEnvio.costo;
  const total      = subtotal + costoEnvio;

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
      emoji: menuItem.emoji ?? "🍔",
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
        costoEnvio,
        total,
        zonaEnvio: estado.zonaEnvio,
        direccionEnvio: estado.direccionEnvio,
        agregarAlCarrito,
        quitarUno: (cartId) => dispatch({ type: "QUITAR_UNO", cartId }),
        eliminarItem: (cartId) => dispatch({ type: "ELIMINAR", cartId }),
        vaciarCarrito: () => dispatch({ type: "VACIAR" }),
        toggleCarrito: () => dispatch({ type: "TOGGLE_CARRITO" }),
        cerrarCarrito: () => dispatch({ type: "CERRAR_CARRITO" }),
        setZonaEnvio: (zona) => dispatch({ type: "SET_ZONA", zona }),
        setDireccionEnvio: (direccion) => dispatch({ type: "SET_DIRECCION", direccion }),
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito(): ContextoCarrito {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
