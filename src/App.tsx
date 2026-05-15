import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { CarritoProvider } from "./context/CarritoContext";
import Carrito from "./components/Carrito";

export default function App() {
  return (
    <CarritoProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      {/* Panel lateral del carrito — disponible en toda la app */}
      <Carrito />
    </CarritoProvider>
  );
}
