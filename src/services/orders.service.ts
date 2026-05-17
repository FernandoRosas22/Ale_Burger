// ============================================================
// orders.service.ts
// ============================================================

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { Pedido, EstadoPedido } from "@/types/order.types";

const COLECCION = "orders";

// ─── Guardar pedido nuevo (con archivado: false por defecto) ──
export async function guardarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COLECCION), {
    ...pedido,
    archivado: false,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  });
  return ref.id;
}

// ─── Actualizar estado ────────────────────────────────────────
export async function actualizarEstado(id: string, estado: EstadoPedido): Promise<void> {
  await updateDoc(doc(db, COLECCION, id), {
    estado,
    fechaActualizacion: serverTimestamp(),
  });
}

// ─── Cierre de caja: archivar todos los pedidos activos ───────
// Usa batch para hacer todas las escrituras en una sola operación
export async function cerrarCaja(): Promise<number> {
  const q = query(
    collection(db, COLECCION),
    where("archivado", "==", false)
  );
  const snap = await getDocs(q);

  if (snap.empty) return 0;

  // Firestore batch acepta hasta 500 operaciones por batch
  const LIMITE_BATCH = 499;
  const docs = snap.docs;
  let archivados = 0;

  for (let i = 0; i < docs.length; i += LIMITE_BATCH) {
    const batch = writeBatch(db);
    const grupo = docs.slice(i, i + LIMITE_BATCH);
    grupo.forEach((d) => {
      batch.update(d.ref, {
        archivado: true,
        fechaCierre: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });
    });
    await batch.commit();
    archivados += grupo.length;
  }

  return archivados;
}

// ─── Serializar items para Firestore ─────────────────────────
export function serializarItems(items: Pedido["items"]) {
  return items.map((item) => ({
    nombre:          item.nombre,
    emoji:           item.emoji,
    imagen:          item.imagen ?? null,
    cantidad:        item.cantidad,
    precioBase:      item.precioBase,
    precioUnitario:  item.precioUnitario,
    subtotalItem:    item.subtotalItem,
    personalizacion: {
      ingredientesRemovidos: item.personalizacion.ingredientesRemovidos,
      extrasAgregados:       item.personalizacion.extrasAgregados,
      observaciones:         item.personalizacion.observaciones,
    },
  }));
}
