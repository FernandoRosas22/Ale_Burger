// ============================================================
// MigrarProductos.tsx — Botón que migra menu.ts → Firestore
// Se usa UNA SOLA VEZ. Después de migrar, desaparece solo.
// ============================================================

import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { menu } from "@/data/menu";
import { toSlug } from "@/types/producto.types";

// Mapeo categoria id → CategoriaProducto
const CAT_MAP: Record<string, string> = {
  promos:    "promos",
  burgers:   "burgers",
  bebidas:   "bebidas",
  acompanar: "acompanar",
};

export default function MigrarProductos({ onMigrado }: { onMigrado: () => void }) {
  const [estado,   setEstado]   = useState<"idle" | "migrando" | "listo" | "error">("idle");
  const [progreso, setProgreso] = useState("");
  const [error,    setError]    = useState("");

  const handleMigrar = async () => {
    setEstado("migrando");
    setError("");

    try {
      // Verificar si ya hay productos
      const snap = await getDocs(collection(db, "products"));
      if (!snap.empty) {
        setEstado("listo");
        setProgreso(`Ya hay ${snap.size} productos en Firestore. No es necesario migrar.`);
        setTimeout(onMigrado, 2000);
        return;
      }

      let orden = 0;
      let total = 0;

      for (const categoria of menu) {
        const catId = CAT_MAP[categoria.id] ?? "burgers";

        for (const item of categoria.items) {
          setProgreso(`Migrando: ${item.nombre}...`);

          // Precio base: usar el primer tamaño si tiene, si no parsear el string
          const precioBase = item.tamanios?.[0]?.precio
            ?? (Number((item.precio ?? "$0").replace(/[$.]/g, "").replace(",", ".")) || 0);

          const precioAntBase = item.tamanios?.[0]?.precioAnt
            ?? (item.precioAnt ? (Number(item.precioAnt.replace(/[$.]/g, "").replace(",", ".")) || undefined) : undefined);

          await addDoc(collection(db, "products"), {
            name:        item.nombre,
            slug:        toSlug(item.nombre),
            description: item.desc ?? "",
            price:       precioBase,
            priceOld:    precioAntBase ?? null,
            category:    catId,
            imageUrl:    item.img ?? "",   // URL del asset de Vite (funciona para mostrar)
            imageRef:    "",
            ingredients: item.ingredientes ?? [],
            extras:      [],
            sizes:       item.tamanios?.map((t) => ({
              id:       t.id,
              nombre:   t.nombre,
              precio:   t.precio,
              precioAnt: t.precioAnt ?? null,
            })) ?? [],
            available: true,
            featured:  item.destacado ?? false,
            visible:   true,
            order:     orden++,
            tag:       item.tag ?? "",
            emoji:     item.emoji ?? "🍔",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          total++;
        }
      }

      setEstado("listo");
      setProgreso(`✅ ${total} productos migrados correctamente.`);
      setTimeout(onMigrado, 2000);

    } catch (e: any) {
      setEstado("error");
      setError(e?.message ?? "Error desconocido");
    }
  };

  if (estado === "idle") {
    return (
      <div className="migrar-banner">
        <div className="migrar-info">
          <span className="migrar-icon">📦</span>
          <div>
            <strong>Importar productos actuales</strong>
            <p>Tus {menu.reduce((a, c) => a + c.items.length, 0)} productos del menú se van a cargar en Firestore para que puedas editarlos desde acá.</p>
          </div>
        </div>
        <button className="migrar-btn" onClick={handleMigrar}>
          Importar ahora
        </button>
      </div>
    );
  }

  if (estado === "migrando") {
    return (
      <div className="migrar-banner migrar-banner--loading">
        <div className="migrar-spinner" />
        <span>{progreso || "Migrando productos..."}</span>
      </div>
    );
  }

  if (estado === "listo") {
    return (
      <div className="migrar-banner migrar-banner--ok">
        <span>✅ {progreso}</span>
      </div>
    );
  }

  return (
    <div className="migrar-banner migrar-banner--error">
      <span>❌ Error: {error}</span>
      <button className="migrar-btn" onClick={() => setEstado("idle")}>Reintentar</button>
    </div>
  );
}
