export interface Zona {
  id: string;
  nombre: string;
  costo: number;
  color: string;
  barrios: string[];
}

export const ZONAS: Zona[] = [
  {
    id: "zona1", nombre: "ZONA 1", costo: 2000, color: "#e74c3c",
    barrios: [
      // Agustín Ferrari y alrededores inmediatos (zona más cercana al local)
      "agustin ferrari", "ferrari", "reconquista", "bauness", "albatros",
      "atalaya", "la pradera", "pradera", "san joaquin", "joaquin",
      "aristobulo", "erasmo", "plutarco", "carcavallo", "boyaca",
      "arturo morse", "luchetti", "tarqui", "podesta", "ampere",
      "amunategui", "artigas", "jose pillado", "pillado",
      // Calles típicas del barrio Ferrari
      "genova", "génova", "turin", "turín", "milan", "milán",
      "roma", "napoles", "nápoles", "venezia", "venecia",
      "florencia", "bologna", "bolonia", "verona", "padua",
      "sicilia", "calabria", "palermo ferrari",
      "mariano acosta", "acosta",
    ],
  },
  {
    id: "zona2", nombre: "ZONA 2", costo: 1500, color: "#1a237e",
    barrios: [
      "lomas del mirador", "lomas de mirador", "mirador",
      "san justo", "justo", "villa del parque matanza",
      "ciudadela", "villa luzuriaga", "luzuriaga",
      "tapiales", "aldo bonzi", "bonzi",
    ],
  },
  {
    id: "zona3", nombre: "ZONA 3", costo: 2500, color: "#283593",
    barrios: [
      "ciudad evita", "evita", "la union", "union",
      "villa celina", "celina", "villa madero", "madero",
      "tablada", "la tablada",
    ],
  },
  {
    id: "zona4", nombre: "ZONA 4", costo: 2500, color: "#e91e63",
    barrios: [
      "isidro casanova", "casanova", "rafael castillo", "castillo",
      "gregorio de laferrere", "laferrere", "gonzalez catan", "catan",
      "virrey del pino", "virrey",
    ],
  },
  {
    id: "zona5", nombre: "ZONA 5", costo: 3000, color: "#2e7d32",
    barrios: [
      "ramos mejia", "ramos", "haedo", "moron", "morón",
      "el palomar", "palomar", "castelar", "villa sarmiento",
    ],
  },
  {
    id: "zona6", nombre: "ZONA 6", costo: 3000, color: "#6a1b9a",
    barrios: [
      "ituzaingo", "ituzaingó", "villa manuelita", "manuelita",
      "complejo esperanza", "esperanza", "obligado",
      "san antonio de padua", "padua", "san antonio",
    ],
  },
  {
    id: "zona7", nombre: "ZONA 7", costo: 3500, color: "#e65100",
    barrios: [
      "merlo", "libertad merlo", "pontevedra", "paso del rey",
      "paso rey", "parque san martin", "parque san martín",
      "mariano acosta norte", "santa rosa merlo",
    ],
  },
  {
    id: "zona8", nombre: "ZONA 8", costo: 3500, color: "#00838f",
    barrios: [
      "moreno", "francisco alvarez", "alvarez", "cuartel v",
      "cuartel 5", "la reja", "trujui", "paso del rey norte",
    ],
  },
  {
    id: "zona9", nombre: "ZONA 9", costo: 3000, color: "#558b2f",
    barrios: [
      "santa catalina", "san catalina", "el horno", "horno",
      "el zorzal", "zorzal", "las americas", "americas",
      "jose marmol ferrari", "km 34", "kilómetro 34",
    ],
  },
  {
    id: "zona10", nombre: "ZONA 10", costo: 3500, color: "#795548",
    barrios: [
      "hurlingham", "william morris", "morris", "villa tesei", "tesei",
      "ciudadela norte", "tres de febrero", "el palomar norte",
    ],
  },
];

export const SIN_ZONA: Zona = {
  id: "sin_zona",
  nombre: "Retiro en local",
  costo: 0,
  color: "#999",
  barrios: [],
};

// Detecta zona a partir de la dirección escrita por el cliente
export function detectarZona(direccion: string): Zona | null {
  const texto = direccion
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[.,#\-]/g, " ");       // normalizar separadores

  for (const zona of ZONAS) {
    for (const barrio of zona.barrios) {
      const b = barrio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (texto.includes(b)) return zona;
    }
  }
  return null;
}
