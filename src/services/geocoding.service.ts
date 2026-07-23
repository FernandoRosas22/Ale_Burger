// ============================================================
// geocoding.service.ts — Geocodificación de direcciones
// Google Maps Geocoding API (reemplaza a Nominatim/OSM)
// ============================================================
//
// Requiere VITE_GOOGLE_MAPS_API_KEY en las variables de entorno
// (ver .env.example). La key debe estar restringida por HTTP
// referrer en Google Cloud Console antes de ir a producción.

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Mismo recuadro que el sesgo del autocomplete en ZonaSelector.tsx,
// centrado en AleBurgers (Agustín Ferrari, Merlo). Lo usamos también
// acá para sesgar la Geocoding API hacia la zona real de reparto —
// sin esto, "Buenos Aires" en el texto de búsqueda puede confundirse
// con la Ciudad de Buenos Aires (CABA) en vez del conurbano oeste.
const AREA_SERVICIO_BOUNDS = "-34.8705,-58.9447|-34.5705,-58.6447"; // sur,oeste|norte,este

export interface ResultadoGeocoding {
  lat: number;
  lng: number;
  direccionFormateada: string;
  localidad?: string;
}

/**
 * Geocodifica una dirección usando Google Maps Geocoding API.
 * Devuelve null si no encuentra resultados o hay error de red/config.
 * Mantiene la misma forma de uso que el servicio anterior
 * (geocodificarDireccion de zonas.service.ts) para minimizar el
 * impacto en los componentes que lo consumen.
 */
export async function geocodificarDireccion(
  direccion: string
): Promise<ResultadoGeocoding | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error(
      "[geocoding] Falta VITE_GOOGLE_MAPS_API_KEY — configurala en .env.local (dev) y en Vercel (prod)."
    );
    return null;
  }

  // Sesgamos la búsqueda a Buenos Aires / Argentina para evitar
  // matches ambiguos con calles homónimas de otros países.
  const query = encodeURIComponent(`${direccion}, Buenos Aires, Argentina`);
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${query}` +
    `&region=ar` +
    `&bounds=${AREA_SERVICIO_BOUNDS}` +
    `&components=country:AR` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      console.warn(
        `[geocoding] Google Geocoding API respondió "${data.status}" para: "${direccion}"` +
        (data.error_message ? ` — ${data.error_message}` : "")
      );
      return null;
    }

    const resultado = data.results[0];
    const { lat, lng } = resultado.geometry.location;

    const localidadComponente = resultado.address_components.find((c: any) =>
      c.types.includes("locality") || c.types.includes("sublocality")
    );

    return {
      lat,
      lng,
      direccionFormateada: resultado.formatted_address,
      localidad: localidadComponente?.long_name,
    };
  } catch (e) {
    console.error("[geocoding] Error de red al geocodificar:", e);
    return null;
  }
}
