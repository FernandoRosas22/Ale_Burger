// ============================================================
// leafletSetup.ts — Debe importarse SIEMPRE antes que "leaflet-draw"
// leaflet-draw es un plugin clásico que busca `L` en window global.
// Este módulo garantiza que window.L exista antes de que se ejecute
// el código de leaflet-draw (el orden de imports de ES modules lo
// permite: este módulo se resuelve y ejecuta completo antes que
// cualquier import posterior en el archivo que lo usa).
// ============================================================

import * as L from "leaflet";

(window as any).L = L;

// Fix de íconos rotos de Leaflet en bundlers tipo Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default L;
