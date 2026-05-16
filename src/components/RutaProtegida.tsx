// ============================================================
// RutaProtegida.tsx — Redirige a /login si no hay sesión
// ============================================================
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#111", color: "#ff6b00", fontFamily: "sans-serif" }}>
        Cargando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
