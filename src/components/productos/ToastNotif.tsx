// ============================================================
// ToastNotif.tsx — Notificaciones toast reutilizables
// ============================================================

import { useEffect } from "react";

export type ToastTipo = "ok" | "error" | "info";

export interface Toast {
  id: string;
  mensaje: string;
  tipo: ToastTipo;
}

interface ToastNotifProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastNotif({ toasts, onRemove }: ToastNotifProps) {
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icon = toast.tipo === "ok" ? "✅" : toast.tipo === "error" ? "❌" : "ℹ️";

  return (
    <div className={`toast toast--${toast.tipo}`} role="alert">
      <span className="toast-icon">{icon}</span>
      <span className="toast-msg">{toast.mensaje}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Cerrar">✕</button>
    </div>
  );
}

// ─── Hook para manejar toasts ─────────────────────────────────
import { useState, useCallback } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const agregar = useCallback((mensaje: string, tipo: ToastTipo = "ok") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
  }, []);

  const quitar = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, agregar, quitar };
}
