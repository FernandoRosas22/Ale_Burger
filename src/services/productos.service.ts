// ============================================================
// productos.service.ts — CRUD Firestore para colección products/
// ============================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { eliminarImagen } from "@/services/storage.service";
import type { Producto, FormProducto } from "@/types/producto.types";

const COL = "products";

// ─── Escuchar productos en tiempo real ───────────────────────
export function escucharProductos(
  callback: (productos: Producto[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(collection(db, COL), orderBy("order", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Producto[];
      callback(data);
    },
    (err) => onError?.(err)
  );
}

// ─── Crear producto ───────────────────────────────────────────
export async function crearProducto(form: FormProducto): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...form,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Actualizar producto ──────────────────────────────────────
export async function actualizarProducto(
  id: string,
  data: Partial<FormProducto>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Eliminar producto (+ imagen en Storage) ─────────────────
export async function eliminarProducto(id: string): Promise<void> {
  const snap = await getDoc(doc(db, COL, id));
  if (snap.exists()) {
    const imageRef = snap.data()?.imageRef as string | undefined;
    if (imageRef) await eliminarImagen(imageRef);
  }
  await deleteDoc(doc(db, COL, id));
}

// ─── Duplicar producto ────────────────────────────────────────
export async function duplicarProducto(producto: Producto): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...rest } = producto;
  const ref = await addDoc(collection(db, COL), {
    ...rest,
    name: `${rest.name} (copia)`,
    slug: `${rest.slug}-copia`,
    visible: false, // empieza oculto para que lo revise antes de publicar
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Cambiar visibilidad ──────────────────────────────────────
export async function toggleVisible(id: string, visible: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { visible, updatedAt: serverTimestamp() });
}

// ─── Cambiar disponibilidad ───────────────────────────────────
export async function toggleDisponible(id: string, available: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { available, updatedAt: serverTimestamp() });
}
