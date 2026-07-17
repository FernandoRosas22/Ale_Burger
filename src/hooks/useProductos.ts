// ============================================================
// useProductos.ts — Hook para escuchar productos en tiempo real
// ============================================================

import { useEffect, useState } from "react";
import { escucharProductos } from "@/services/productos.service";
import type { Producto, CategoriaProducto } from "@/types/producto.types";

interface UseProductosOpts {
  soloVisibles?: boolean;
  categoria?: CategoriaProducto;
}

export function useProductos(opts: UseProductosOpts = {}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState<string>("");

  useEffect(() => {
    setCargando(true);
    const unsub = escucharProductos(
      (data) => {
        let filtrados = data;
        if (opts.soloVisibles) filtrados = filtrados.filter((p) => p.visible);
        if (opts.categoria)    filtrados = filtrados.filter((p) => p.category === opts.categoria);
        setProductos(filtrados);
        setCargando(false);
        setError("");
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.soloVisibles, opts.categoria]);

  return { productos, cargando, error };
}
