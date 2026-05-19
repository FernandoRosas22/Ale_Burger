// ============================================================
// Login.tsx — Con bloqueo tras 5 intentos fallidos
// ============================================================
import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "@/styles/login.css";

const MAX_INTENTOS  = 5;
const BLOQUEO_MIN   = 15; // minutos de bloqueo
const STORAGE_KEY   = "ale_login_intentos";

interface IntentoData {
  count: number;
  bloqueadoHasta?: number; // timestamp ms
}

function getIntentos(): IntentoData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0 };
  } catch { return { count: 0 }; }
}

function setIntentos(data: IntentoData) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetIntentos() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [intentosRestantes, setIntentosRestantes] = useState(MAX_INTENTOS);

  // Verificar estado de bloqueo al cargar y cada segundo
  useEffect(() => {
    const verificar = () => {
      const data = getIntentos();
      if (data.bloqueadoHasta && Date.now() < data.bloqueadoHasta) {
        setBloqueado(true);
        setTiempoRestante(Math.ceil((data.bloqueadoHasta - Date.now()) / 1000));
      } else {
        setBloqueado(false);
        setIntentosRestantes(MAX_INTENTOS - (data.count || 0));
        if (data.bloqueadoHasta && Date.now() >= data.bloqueadoHasta) {
          resetIntentos();
        }
      }
    };

    verificar();
    const interval = setInterval(verificar, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;

    const data = getIntentos();
    setError("");
    setCargando(true);

    try {
      await login(email, password);
      resetIntentos();
      navigate("/gestion-interna");
    } catch {
      const nuevosIntentos = (data.count || 0) + 1;

      if (nuevosIntentos >= MAX_INTENTOS) {
        const bloqueadoHasta = Date.now() + BLOQUEO_MIN * 60 * 1000;
        setIntentos({ count: nuevosIntentos, bloqueadoHasta });
        setBloqueado(true);
        setError(`Demasiados intentos fallidos. Bloqueado por ${BLOQUEO_MIN} minutos.`);
      } else {
        setIntentos({ count: nuevosIntentos });
        const restantes = MAX_INTENTOS - nuevosIntentos;
        setIntentosRestantes(restantes);
        setError(`Email o contraseña incorrectos. ${restantes} intento${restantes !== 1 ? "s" : ""} restante${restantes !== 1 ? "s" : ""}.`);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">🍔</div>
        <h1 className="login-titulo">AleBurgers</h1>
        <p className="login-sub">Panel de administración</p>

        {bloqueado ? (
          <div className="login-bloqueado">
            <div className="login-bloqueado-icono">🔒</div>
            <p>Acceso bloqueado temporalmente</p>
            <div className="login-countdown">{formatTiempo(tiempoRestante)}</div>
            <small>Demasiados intentos fallidos. Intentá de nuevo en {BLOQUEO_MIN} minutos.</small>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aleburgers.com"
                required
                autoComplete="email"
                disabled={cargando}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={cargando}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            {intentosRestantes < MAX_INTENTOS && intentosRestantes > 0 && !error && (
              <p className="login-advertencia">
                ⚠️ {intentosRestantes} intento{intentosRestantes !== 1 ? "s" : ""} restante{intentosRestantes !== 1 ? "s" : ""}
              </p>
            )}

            <button className="login-btn" type="submit" disabled={cargando}>
              {cargando ? "Verificando..." : "Entrar →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
