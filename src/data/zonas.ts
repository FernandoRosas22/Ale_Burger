export interface Zona {
  id: string;
  nombre: string;
  costo: number;
  color: string;
}

export const ZONAS: Zona[] = [
  { id: "zona1",  nombre: "ZONA 1",  costo: 2000, color: "#e74c3c" },
  { id: "zona2",  nombre: "ZONA 2",  costo: 1500, color: "#1a237e" },
  { id: "zona3",  nombre: "ZONA 3",  costo: 2500, color: "#283593" },
  { id: "zona4",  nombre: "ZONA 4",  costo: 2500, color: "#e91e63" },
  { id: "zona5",  nombre: "ZONA 5",  costo: 3000, color: "#2e7d32" },
  { id: "zona6",  nombre: "ZONA 6",  costo: 3000, color: "#6a1b9a" },
  { id: "zona7",  nombre: "ZONA 7",  costo: 3500, color: "#e65100" },
  { id: "zona8",  nombre: "ZONA 8",  costo: 3500, color: "#00838f" },
  { id: "zona9",  nombre: "ZONA 9",  costo: 3000, color: "#558b2f" },
  { id: "zona10", nombre: "ZONA 10", costo: 3500, color: "#795548" },
];

export const SIN_ZONA: Zona = {
  id: "sin_zona",
  nombre: "Retiro en local",
  costo: 0,
  color: "#999",
};