// Página temporal de prueba de estrés — solo para testing
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

const BURGERS = ["CHEESE BURGER", "NAPOLITANA", "HBQ", "LA FITZ ROY", "BACON JAM"];
const NOMBRES = ["Juan García", "María López", "Carlos Pérez", "Ana Martínez", "Luis Rodríguez"];
const CALLES  = ["Av. Rivadavia 1234", "San Martín 567", "Belgrano 890", "Mitre 321"];
const PAGOS   = ["efectivo", "transferencia", "debito", "credito"];

function rand(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randNum(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generarPedido() {
  const tipo  = Math.random() > 0.5 ? "delivery" : "retiro";
  const pago  = rand(PAGOS);
  const cant  = randNum(1, 3);
  const precioBase = randNum(10000, 16000);
  const precioUnit = precioBase + (Math.random() > 0.5 ? 800 : 0);
  const subtotal   = precioUnit * cant;
  const descuento  = pago === "efectivo" ? Math.round(subtotal * 0.1) : 0;

  return {
    cliente: {
      nombre: rand(NOMBRES), telefono: `011 ${randNum(1000,9999)}-${randNum(1000,9999)}`,
      direccion: tipo === "delivery" ? rand(CALLES) : "",
      tipoEntrega: tipo, metodoPago: pago, observacionesGenerales: "",
    },
    items: [{ nombre: rand(BURGERS), emoji: "🍔", cantidad: cant,
      precioBase, precioUnitario: precioUnit, subtotalItem: subtotal,
      personalizacion: { ingredientesRemovidos: [], extrasAgregados: [], observaciones: "" },
    }],
    subtotal, descuento, total: subtotal - descuento,
    estado: "pendiente", fechaCreacion: new Date().toISOString(), _esPrueba: true,
  };
}

export default function StressTest() {
  const [corriendo, setCorriendo] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; fallos: number; ms: number } | null>(null);
  const [cantidad, setCantidad]   = useState(50);

  const correr = async () => {
    setCorriendo(true);
    setResultado(null);
    const inicio = Date.now();
    const promesas = Array.from({ length: cantidad }, () =>
      addDoc(collection(db, "orders"), generarPedido()).then(() => true).catch(() => false)
    );
    const res = await Promise.all(promesas);
    const ms  = Date.now() - inicio;
    setResultado({ ok: res.filter(Boolean).length, fallos: res.filter(r => !r).length, ms });
    setCorriendo(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#111", color:"#fff", fontFamily:"Nunito,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:24, padding:32 }}>
      <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, margin:0, color:"#ff6b00" }}>🍔 Prueba de Estrés</h1>
      <p style={{ color:"#888", margin:0 }}>Manda pedidos simultáneos a Firestore y mide el tiempo</p>

      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        {[20, 50, 100].map(n => (
          <button key={n} onClick={() => setCantidad(n)}
            style={{ padding:"8px 20px", borderRadius:8, border:`2px solid ${cantidad===n?"#ff6b00":"#333"}`, background:cantidad===n?"rgba(255,107,0,0.15)":"transparent", color:cantidad===n?"#ff6b00":"#888", fontWeight:800, cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>
            {n} pedidos
          </button>
        ))}
      </div>

      <button onClick={correr} disabled={corriendo}
        style={{ padding:"14px 40px", borderRadius:12, border:"none", background: corriendo?"#444":"#ff6b00", color:"#fff", fontWeight:900, fontSize:16, cursor:corriendo?"not-allowed":"pointer", fontFamily:"inherit", minWidth:200 }}>
        {corriendo ? `Enviando ${cantidad} pedidos...` : `▶ Lanzar ${cantidad} pedidos`}
      </button>

      {corriendo && (
        <div style={{ color:"#ff6b00", fontSize:14 }}>⏳ Esperando respuesta de Firestore...</div>
      )}

      {resultado && (
        <div style={{ background:"#1a1a1a", border:"1.5px solid #2a2a2a", borderRadius:16, padding:"28px 40px", textAlign:"center", minWidth:300 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{resultado.fallos === 0 ? "🎉" : "⚠️"}</div>
          <div style={{ fontSize:22, fontWeight:900, color: resultado.fallos===0?"#22c55e":"#e8a020", marginBottom:16 }}>
            {resultado.fallos === 0 ? "¡Todo perfecto!" : "Hubo algunos fallos"}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:15 }}>
            <div>✅ <strong style={{color:"#22c55e"}}>{resultado.ok}</strong> pedidos guardados</div>
            {resultado.fallos > 0 && <div>❌ <strong style={{color:"#e05252"}}>{resultado.fallos}</strong> fallaron</div>}
            <div>⏱ Tiempo total: <strong style={{color:"#ff6b00"}}>{resultado.ms}ms ({(resultado.ms/1000).toFixed(2)}s)</strong></div>
            <div>⚡ Promedio: <strong style={{color:"#ff6b00"}}>{(resultado.ms/cantidad).toFixed(0)}ms por pedido</strong></div>
          </div>
          <p style={{ fontSize:12, color:"#555", marginTop:16, marginBottom:0 }}>
            Los pedidos de prueba tienen _esPrueba: true — podés borrarlos desde Firebase Console
          </p>
        </div>
      )}

      <a href="/admin" style={{ color:"#555", fontSize:13, textDecoration:"none", marginTop:8 }}>← Volver al admin</a>
    </div>
  );
}
