// ============================================================
// zonas.service.ts — CRUD Firestore para colección zones/
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { ZonaPoligono, FormZona } from "@/types/zona.types";

const COL = "zones";

// ─── Escuchar zonas en tiempo real ───────────────────────────
export function escucharZonas(
  callback: (zonas: ZonaPoligono[]) => void,
  onError?: (e: Error) => void
): () => void {
  // Sin orderBy para evitar requerir índice compuesto
  const q = query(collection(db, COL));
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() })) as ZonaPoligono[];
      // Ordenar por prioridad client-side
      data.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      callback(data);
    },
    (err) => onError?.(err)
  );
}

// ─── Crear zona ───────────────────────────────────────────────
export async function crearZona(form: FormZona): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...form,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Actualizar zona ──────────────────────────────────────────
export async function actualizarZona(
  id: string,
  data: Partial<FormZona>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Eliminar zona ────────────────────────────────────────────
export async function eliminarZona(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

// ─── Duplicar zona ────────────────────────────────────────────
export async function duplicarZona(zona: ZonaPoligono): Promise<string> {
  const { id, createdAt, updatedAt, ...rest } = zona;
  const ref = await addDoc(collection(db, COL), {
    ...rest,
    name:     `${rest.name} (copia)`,
    active:   false,
    priority: rest.priority + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Toggle activa/inactiva ───────────────────────────────────
export async function toggleZonaActiva(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { active, updatedAt: serverTimestamp() });
}

