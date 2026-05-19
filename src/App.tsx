import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Historial from "./pages/Historial";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import RutaProtegida from "./components/RutaProtegida";
import Carrito from "./components/Carrito";

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
      <CarritoProvider>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/acceso"       element={<Login />} />
          <Route path="/gestion-interna" element={<RutaProtegida><Admin /></RutaProtegida>} />
          <Route path="/gestion-interna/historial" element={<RutaProtegida><Historial /></RutaProtegida>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
        <Carrito />
      </CarritoProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
