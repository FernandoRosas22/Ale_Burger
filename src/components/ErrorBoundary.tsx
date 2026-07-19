// ============================================================
// ErrorBoundary.tsx — Evita que un error en un módulo tumbe
// toda la aplicación. Muestra un mensaje de recuperación local.
// ============================================================

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  nombre?: string; // nombre del módulo, para el mensaje
}

interface State {
  hayError: boolean;
  mensaje: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hayError: false, mensaje: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hayError: true, mensaje: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Error en ${this.props.nombre ?? "módulo"}:`, error, info);
  }

  handleReintentar = () => {
    this.setState({ hayError: false, mensaje: "" });
  };

  render() {
    if (this.state.hayError) {
      return (
        <div className="error-boundary">
          <span className="error-boundary-icon">⚠️</span>
          <h3>Algo falló al cargar {this.props.nombre ?? "esta sección"}</h3>
          <p className="error-boundary-detalle">{this.state.mensaje}</p>
          <button className="error-boundary-btn" onClick={this.handleReintentar}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
