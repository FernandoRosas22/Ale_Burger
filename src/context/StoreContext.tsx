// ============================================================
// StoreContext.tsx — Estado global abierto/cerrado del local
// Lee y escucha en tiempo real el doc settings/store en Firestore
// ============================================================
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface StoreContextType {
  abierto: boolean;
  cargando: boolean;
  setAbierto: (val: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbiertoLocal]   = useState(true);
  const [cargando, setCargando]       = useState(true);

  useEffect(() => {
    const ref = doc(db, "settings", "store");
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          setAbiertoLocal(snap.data().abierto !== false);
        } else {
          // Documento no existe todavía → crear con abierto:true
          setDoc(ref, { abierto: true });
          setAbiertoLocal(true);
        }
        setCargando(false);
      },
      (err) => {
        console.error("StoreContext error:", err);
        setAbiertoLocal(true); // fallback: si falla, dejamos abrir
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  const setAbierto = async (val: boolean) => {
    await setDoc(doc(db, "settings", "store"), { abierto: val });
  };

  return (
    <StoreContext.Provider value={{ abierto, cargando, setAbierto }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
