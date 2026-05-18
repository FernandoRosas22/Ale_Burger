// ============================================================
// StoreContext.tsx — Estado global abierto/cerrado del local
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
  const [abierto, setAbiertoLocal] = useState(true);
  const [cargando, setCargando]    = useState(true);

  useEffect(() => {
    const ref = doc(db, "settings", "store");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setAbiertoLocal(snap.data().abierto !== false);
        } else {
          // Primera vez: crear el documento con abierto:true
          setDoc(ref, { abierto: true }).catch(() => {});
          setAbiertoLocal(true);
        }
        setCargando(false);
      },
      (err) => {
        console.warn("StoreContext:", err.message);
        setAbiertoLocal(true);
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  const setAbierto = async (val: boolean) => {
    const ref = doc(db, "settings", "store");
    await setDoc(ref, { abierto: val }, { merge: true });
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
