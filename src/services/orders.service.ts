// ============================================================
// orders.service.ts
// Capa de acceso a Firestore — colección "orders"
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { Pedido, EstadoPedido } from "@/types/order.types";

const COLECCION = "orders";

export async function guardarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COLECCION), {
    ...pedido,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarEstado(id: string, estado: EstadoPedido): Promise<void> {
  await updateDoc(doc(db, COLECCION, id), {
    estado,
    fechaActualizacion: serverTimestamp(),
  });
}

export function serializarItems(items: Pedido["items"]) {
  return items.map((item) => ({
    nombre:         item.nombre,
    emoji:          item.emoji,
    imagen:         item.imagen ?? null,
    cantidad:       item.cantidad,
    precioBase:     item.precioBase,
    precioUnitario: item.precioUnitario,
    subtotalItem:   item.subtotalItem,
    personalizacion: {
      ingredientesRemovidos: item.personalizacion.ingredientesRemovidos,
      extrasAgregados:       item.personalizacion.extrasAgregados,
      observaciones:         item.personalizacion.observaciones,
    },
  }));
}
