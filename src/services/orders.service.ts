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
  getDocs,
  getDoc,
  query,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { Pedido, EstadoPedido } from "@/types/order.types";

const COLECCION = "orders";

// ─── Guardar pedido nuevo ─────────────────────────────────────
export async function guardarPedido(pedido: Omit<Pedido, "id">): Promise<string> {
  // Verificar estado del local antes de guardar
  const storeSnap = await getDoc(doc(db, "settings", "store"));
  if (storeSnap.exists() && storeSnap.data().abierto === false) {
    throw new Error("LOCAL_CERRADO");
  }

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

// ─── Cierre de caja ───────────────────────────────────────────
// Trae TODOS los pedidos y archiva los que no tienen archivado:true
// Así funciona con pedidos viejos que no tienen el campo
export async function cerrarCaja(): Promise<number> {
  // Sin orderBy para evitar conflictos con fechas en distintos formatos
  const snap = await getDocs(query(collection(db, COLECCION)));

  // Filtramos los que NO están archivados (incluyendo los que no tienen el campo)
  const aArchivar = snap.docs.filter(d => {
    const data = d.data();
    return data.archivado !== true;
  });

  if (aArchivar.length === 0) return 0;

  const LIMITE = 499;
  let archivados = 0;

  for (let i = 0; i < aArchivar.length; i += LIMITE) {
    const batch = writeBatch(db);
    const grupo = aArchivar.slice(i, i + LIMITE);
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

// ─── Serializar items ─────────────────────────────────────────
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
