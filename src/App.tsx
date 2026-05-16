import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { CarritoProvider } from "./context/CarritoContext";
import Carrito from "./components/Carrito";

export default function App() {
  return (
    <CarritoProvider>
      <Routes>
        <Route path="/"      element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {/* Carrito lateral — disponible en toda la app excepto /admin */}
      <Carrito />
    </CarritoProvider>
  );
}
