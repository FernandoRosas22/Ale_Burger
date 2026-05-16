import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";
import Carrito from "./components/Carrito";

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <Routes>
          <Route path="/"       element={<Home />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/admin"  element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Carrito />
      </CarritoProvider>
    </AuthProvider>
  );
}
