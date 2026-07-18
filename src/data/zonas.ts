export interface Zona {
  id: string;
  nombre: string;
  costo: number;
  color: string;
  barrios: string[]; // palabras clave para detección automática
}

export const ZONAS: Zona[] = [
  {
    id: "zona1", nombre: "ZONA 1", costo: 2000, color: "#e74c3c",
    barrios: ["agustin ferrari", "ferrari", "la pradera", "pradera", "reconquista", "bauness", "albatros", "atalaya", "san joaquin", "joaquin"],
  },
  {
    id: "zona2", nombre: "ZONA 2", costo: 1500, color: "#1a237e",
    barrios: ["lomas", "lomas del mirador", "mirador", "san justo", "justo"],
  },
  {
    id: "zona3", nombre: "ZONA 3", costo: 2500, color: "#283593",
    barrios: ["tapiales", "aldo bonzi", "bonzi", "ciudad evita", "evita"],
  },
  {
    id: "zona4", nombre: "ZONA 4", costo: 2500, color: "#e91e63",
    barrios: ["isidro casanova", "casanova", "la union", "union", "gregorio de laferrere", "laferrere"],
  },
  {
    id: "zona5", nombre: "ZONA 5", costo: 3000, color: "#2e7d32",
    barrios: ["ramos mejia", "ramos", "haedo", "castelar"],
  },
  {
    id: "zona6", nombre: "ZONA 6", costo: 3000, color: "#6a1b9a",
    barrios: ["villa del parque", "villa luro", "flores", "floresta", "velez", "liniers"],
  },
  {
    id: "zona7", nombre: "ZONA 7", costo: 3500, color: "#e65100",
    barrios: ["moron", "morón", "palermo", "belgrano", "villa urquiza"],
  },
  {
    id: "zona8", nombre: "ZONA 8", costo: 3500, color: "#00838f",
    barrios: ["merlo", "paso del rey", "paso", "libertad", "pontevedra"],
  },
  {
    id: "zona9", nombre: "ZONA 9", costo: 3000, color: "#558b2f",
    barrios: ["ituzaingo", "ituzaingó", "villa manuelita", "manuelita", "complejo esperanza"],
  },
  {
    id: "zona10", nombre: "ZONA 10", costo: 3500, color: "#795548",
    barrios: ["el palomar", "palomar", "ciudadela", "tres de febrero", "caseros"],
  },
];

export const SIN_ZONA: Zona = {
  id: "sin_zona",
  nombre: "Retiro en local",
  costo: 0,
  color: "#999",
  barrios: [],
};

// Detecta zona automáticamente a partir de la dirección escrita
export function detectarZona(direccion: string): Zona | null {
  const texto = direccion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const zona of ZONAS) {
    for (const barrio of zona.barrios) {
      const barrioNorm = barrio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (texto.includes(barrioNorm)) return zona;
    }
  }
  return null;
}
