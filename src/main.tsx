import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/aleburgers.css";
import "./styles/carrito.css";
import "./styles/product-modal.css";
import "./styles/checkout-modal.css";
import "./styles/store-status.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
