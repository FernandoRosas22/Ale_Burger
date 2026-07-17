// ============================================================
// storage.service.ts — Subida via Cloudinary (gratis, sin tarjeta)
// Plan gratuito: 25GB storage, 25GB bandwidth/mes
// ============================================================

const CLOUD_NAME   = "aleburgers";   // ← vas a configurar esto
const UPLOAD_PRESET = "aleburgers_productos"; // ← preset unsigned

const MAX_DIMENSION = 900;
const JPEG_QUALITY  = 0.85;
const MAX_SIZE_MB   = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── Validar archivo ──────────────────────────────────────────
export function validarImagen(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Solo se permiten imágenes JPG, PNG o WebP.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return `La imagen no puede superar ${MAX_SIZE_MB}MB.`;
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
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION; }
        else { width = Math.round(width * MAX_DIMENSION / height); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas no disponible"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Error al comprimir")),
        "image/jpeg", JPEG_QUALITY
      );
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = url;
  });
}

// ─── Subir imagen a Cloudinary ────────────────────────────────
export async function subirImagen(
  file: File,
  _carpeta: string = "products"
): Promise<{ url: string; ref: string }> {
  const blob = await comprimirImagen(file);
  const fd   = new FormData();
  fd.append("file", blob, "imagen.jpg");
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "aleburgers/products");

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "Error al subir imagen a Cloudinary");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    ref: data.public_id, // usamos public_id como "ref" para poder borrar después
  };
}

// ─── Eliminar imagen de Cloudinary (requiere server, omitimos por ahora) ──
export async function eliminarImagen(_refPath: string): Promise<void> {
  // La eliminación desde el cliente requiere firma del servidor.
  // Por ahora se omite — las imágenes viejas quedan en Cloudinary
  // (el plan gratuito tiene 25GB, más que suficiente para un restaurante).
  return;
}
