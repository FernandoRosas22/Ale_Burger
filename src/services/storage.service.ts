// ============================================================
// storage.service.ts — Subida y eliminación de imágenes
// Comprime automáticamente antes de subir (max 800px, 0.82 quality)
// ============================================================

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/firebase";

const MAX_DIMENSION = 800;
const JPEG_QUALITY  = 0.82;
const MAX_SIZE_MB   = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Validar archivo ──────────────────────────────────────────
export function validarImagen(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Solo se permiten imágenes JPG, PNG o WebP.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen no puede superar ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

// ─── Comprimir imagen en canvas ───────────────────────────────
export function comprimirImagen(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Reducir si supera MAX_DIMENSION manteniendo proporción
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width  = MAX_DIMENSION;
        } else {
          width  = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas no disponible"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Error al comprimir imagen"));
          resolve(blob);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = url;
  });
}

// ─── Subir imagen a Firebase Storage ──────────────────────────
export async function subirImagen(
  file: File,
  carpeta: string = "products"
): Promise<{ url: string; ref: string }> {
  const blob     = await comprimirImagen(file);
  const ext      = "jpg"; // siempre jpeg después de comprimir
  const nombre   = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path     = `${carpeta}/${nombre}`;
  const storRef  = ref(storage, path);

  await uploadBytes(storRef, blob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(storRef);
  return { url, ref: path };
}

// ─── Eliminar imagen de Firebase Storage ─────────────────────
export async function eliminarImagen(refPath: string): Promise<void> {
  if (!refPath) return;
  try {
    const storRef = ref(storage, refPath);
    await deleteObject(storRef);
  } catch (e: any) {
    // Si ya no existe (object-not-found), ignorar
    if (e?.code !== "storage/object-not-found") throw e;
  }
}
