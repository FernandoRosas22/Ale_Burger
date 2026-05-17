// ============================================================
// order.types.ts
// Interfaces del sistema de pedidos — escalable para panel admin
// ============================================================

import type { PersonalizacionItem } from "@/context/CarritoContext";

// ─── Estado del pedido ────────────────────────────────────────
export type EstadoPedido = "pendiente" | "preparando" | "listo" | "entregado" | "cancelado";

export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string; emoji: string }> = {
  pendiente:  { label: "Pendiente",  color: "#e8a020", emoji: "⏳" },
  preparando: { label: "Preparando", color: "#3b82f6", emoji: "👨‍🍳" },
  listo:      { label: "Listo",      color: "#22c55e", emoji: "✅" },
  entregado:  { label: "Entregado",  color: "#6b7280", emoji: "🎉" },
  cancelado:  { label: "Cancelado",  color: "#ef4444", emoji: "❌" },
};

// ─── Tipo de entrega ──────────────────────────────────────────
export type TipoEntrega = "delivery" | "retiro";

// ─── Método de pago ───────────────────────────────────────────
export type MetodoPago = "efectivo" | "transferencia" | "debito" | "credito";

export const METODOS_PAGO: Record<MetodoPago, { label: string; emoji: string; descuento?: number }> = {
  efectivo:      { label: "Efectivo",      emoji: "💵", descuento: 10 },
  transferencia: { label: "Transferencia", emoji: "📲" },
  debito:        { label: "Débito",        emoji: "💳" },
  credito:       { label: "Crédito",       emoji: "💳" },
};

// ─── Cliente ──────────────────────────────────────────────────
export interface DatosCliente {
  nombre: string;
  telefono: string;
  direccion: string;
  tipoEntrega: TipoEntrega;
  metodoPago: MetodoPago;
  observacionesGenerales: string;
}

// ─── Ítem guardado en Firestore ───────────────────────────────
export interface ItemPedido {
  nombre: string;
  emoji: string;
  imagen?: string;
  cantidad: number;
  precioBase: number;
  precioUnitario: number;
  subtotalItem: number;
  personalizacion: PersonalizacionItem;
}

// ─── Pedido completo ──────────────────────────────────────────
export interface Pedido {
  id?: string;
  cliente: DatosCliente;
  items: ItemPedido[];
  subtotal: number;
  descuento: number;
  total: number;
  estado: EstadoPedido;
  fechaCreacion: string;
  fechaActualizacion?: string;
  archivado?: boolean;
  fechaCierre?: string;
  notas?: string;
}

// ─── Formulario local ─────────────────────────────────────────
export interface FormCheckout {
  nombre: string;
  telefono: string;
  direccion: string;
  tipoEntrega: TipoEntrega;
  metodoPago: MetodoPago;
  observacionesGenerales: string;
}

export const FORM_CHECKOUT_INICIAL: FormCheckout = {
  nombre: "",
  telefono: "",
  direccion: "",
  tipoEntrega: "delivery",
  metodoPago: "efectivo",
  observacionesGenerales: "",
};

export type ErroresCheckout = Partial<Record<keyof FormCheckout, string>>;
