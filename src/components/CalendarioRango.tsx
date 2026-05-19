// ============================================================
// CalendarioRango.tsx — Calendario visual para selección de rango
// ============================================================
import { useState } from "react";

interface Props {
  desde: string; // "YYYY-MM-DD" o ""
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
}

function ymdLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_SEMANA = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

export default function CalendarioRango({ desde, hasta, onChange }: Props) {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [hover, setHover] = useState("");

  // Primer día del mes y cuántos días tiene
  const primerDia = new Date(anio, mes, 1);
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  // Lunes=0 ... Domingo=6
  let offsetInicio = primerDia.getDay() - 1;
  if (offsetInicio < 0) offsetInicio = 6;

  const handleDia = (ymd: string) => {
    if (!desde || (desde && hasta)) {
      // Empezar nueva selección
      onChange(ymd, "");
    } else {
      // Ya tenemos inicio, ahora definir fin
      if (ymd < desde) {
        onChange(ymd, desde);
      } else {
        onChange(desde, ymd);
      }
    }
  };

  const estaEnRango = (ymd: string) => {
    const fin = hasta || hover;
    if (!desde || !fin) return false;
    const [d, f] = desde < fin ? [desde, fin] : [fin, desde];
    return ymd > d && ymd < f;
  };

  const esDesde = (ymd: string) => ymd === desde;
  const esHasta = (ymd: string) => ymd === hasta;
  const esFuturo = (ymd: string) => ymd > ymdLocal(hoy);

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a-1); }
    else setMes(m => m-1);
  };
  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a+1); }
    else setMes(m => m+1);
  };

  // Construir celdas
  const celdas: (string|null)[] = [];
  for (let i = 0; i < offsetInicio; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) {
    celdas.push(ymdLocal(new Date(anio, mes, d)));
  }

  const labelRango = () => {
    if (!desde) return "Tocá un día para empezar";
    if (desde && !hasta) return `Desde ${desde.split("-").reverse().join("/")} — Tocá otro día para el fin`;
    return `${desde.split("-").reverse().join("/")} → ${hasta.split("-").reverse().join("/")}`;
  };

  return (
    <div className="cal-wrap">
      {/* Nav mes */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={mesAnterior}>‹</button>
        <span className="cal-nav-titulo">{MESES[mes]} {anio}</span>
        <button className="cal-nav-btn" onClick={mesSiguiente}>›</button>
      </div>

      {/* Días de semana */}
      <div className="cal-grid">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="cal-header-dia">{d}</div>
        ))}

        {/* Celdas */}
        {celdas.map((ymd, i) => {
          if (!ymd) return <div key={`e-${i}`} className="cal-celda cal-celda--vacia" />;
          const futuro   = esFuturo(ymd);
          const esHoy    = ymd === ymdLocal(hoy);
          const inicio   = esDesde(ymd);
          const fin      = esHasta(ymd);
          const rango    = estaEnRango(ymd);
          const hoover   = !hasta && hover && ymd === hover;

          return (
            <div
              key={ymd}
              className={[
                "cal-celda",
                futuro   ? "cal-celda--futuro"  : "",
                esHoy    ? "cal-celda--hoy"     : "",
                inicio   ? "cal-celda--inicio"  : "",
                fin      ? "cal-celda--fin"      : "",
                rango    ? "cal-celda--rango"    : "",
                hoover   ? "cal-celda--hover"    : "",
              ].join(" ").trim()}
              onClick={() => !futuro && handleDia(ymd)}
              onMouseEnter={() => { if (desde && !hasta) setHover(ymd); }}
              onMouseLeave={() => setHover("")}
            >
              {parseInt(ymd.slice(8))}
            </div>
          );
        })}
      </div>

      {/* Label selección */}
      <div className="cal-label">{labelRango()}</div>

      {/* Botón limpiar */}
      {(desde || hasta) && (
        <button className="cal-clear" onClick={() => onChange("","")}>✕ Limpiar selección</button>
      )}
    </div>
  );
}
