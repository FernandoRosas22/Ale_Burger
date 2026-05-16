// ============================================================
// Login.tsx — Página de acceso al panel admin
// ============================================================
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "@/styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Email o contraseña incorrectos.");
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
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={cargando}>
            {cargando ? "Entrando..." : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}
