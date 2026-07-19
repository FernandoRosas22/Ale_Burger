// ============================================================
// leafletSetup.ts — Debe importarse SIEMPRE antes que "leaflet-draw"
//
// IMPORTANTE: se usa `import L from "leaflet"` (default import), NO
// `import * as L from "leaflet"`. La razón: `import * as L` crea un
// objeto de namespace de ES Modules, que el motor de JS congela
// (no-extensible) por especificación. leaflet-draw necesita agregar
// propiedades nuevas a L (ej. L.drawVersion), y con el namespace
// congelado eso lanza: "Cannot add property drawVersion, object is
// not extensible". El import por defecto entrega el objeto real de
// Leaflet (mutable), evitando el problema.
// ============================================================

import L from "leaflet";

(window as any).L = L;

// Fix de íconos rotos de Leaflet en bundlers tipo Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default L;
