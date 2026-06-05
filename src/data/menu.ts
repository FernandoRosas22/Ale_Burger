import cocaCola500 from "@/assets/coca-cola-500.jpg";
import cocaCola175 from "@/assets/coca-cola-175.jpg";
import fanta500 from "@/assets/fanta-500.jpg";
import cuartitoale from "@/assets/CUARTITO.ALE.jpg";
import napolitana from "@/assets/NAPOLITANA.jpg";
import hbq from "@/assets/HBQ.jpg";
import tukiburger from "@/assets/TUKI.BURGER.jpg";
import deluxecrispy from "@/assets/DELUXE.CRISPY.jpg";
import cheeseburger from "@/assets/CHEESE.BURGER.jpg";
import cheesebacon from "@/assets/CHEESE.BACON.jpg";
import lafitzroy from "@/assets/LA.FITZ.ROY.jpg";
import bigmac from "@/assets/BIG.MAC.jpg";
import notburger from "@/assets/NOT.BURGER.jpg";
import americanburger from "@/assets/AMERICAN.BURGER.jpg";
import sweetburger from "@/assets/SWEET.BURGER.jpg";
import baconjam from "@/assets/BACON.JAM.jpg";
import chickenale from "@/assets/CHICKEN.ALE.jpg";
import bandejadepapa from "@/assets/BANDEJA.DE.PAPA.jpg";
import burgers3x2 from "@/assets/3x2.BURGERS.DOBLES.jpg";
import promomenucena from "@/assets/PROMO.MENÚ.CENA.jpg";
import goldenburger from "@/assets/GOLDEN.BURGER.jpg";
import sliders from "@/assets/SLIDERS.jpg";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface Ingrediente {
  id: string;
  nombre: string;
}

export interface Tamanio {
  id: string;
  nombre: string;
  precio: number;
  precioAnt?: number;
}

export type MenuItem = {
  nombre: string;
  desc?: string;
  precio: string;
  precioAnt?: string;
  tag?: string;
  emoji?: string;
  destacado?: boolean;
  img?: string;
  ingredientes?: Ingrediente[];
  tamanios?: Tamanio[];
};

export type MenuCategory = {
  id: string;
  titulo: string;
  subtitulo?: string;
  items: MenuItem[];
};

// ─── Tamaños comunes para burgers ─────────────────────────────────────────────
const TAMANIOS_BURGERS: Tamanio[] = [
  { id: "simple", nombre: "SIMPLE", precio: 14500 },
  { id: "doble",  nombre: "DOBLE",  precio: 17500 },
  { id: "triple", nombre: "TRIPLE", precio: 20000 },
];

// ─── Tamaños para burgers premium (base más alta) ─────────────────────────────
const TAMANIOS_PREMIUM: Tamanio[] = [
  { id: "simple", nombre: "SIMPLE", precio: 17500 },
  { id: "doble",  nombre: "DOBLE",  precio: 20500 },
  { id: "triple", nombre: "TRIPLE", precio: 23500 },
];

export const menu: MenuCategory[] = [
  {
    id: "promos",
    titulo: "PROMOS & COMBOS",
    subtitulo: "Las mejores ofertas para compartir o disfrutar solo.",
    items: [
      {
        nombre: "3X2 BURGERS DOBLES",
        desc: "3 combos dobles al precio de 2. Combinalas como quieras. Incluyen papas fritas.",
        precio: "$35.000",
        tag: "🔥 Top",
        emoji: "🍔",
        destacado: true,
        img: burgers3x2,
      },
      {
        nombre: "PROMO MENÚ CENA",
        desc: "1 burger doble (Cheese Burger o Cheese Bacon) + 1 porción de papas + 1 bebida 500ml.",
        precio: "$16.500",
        tag: "Combo",
        emoji: "🔥",
        destacado: true,
        img: promomenucena,
      },
    ],
  },
  {
    id: "burgers",
    titulo: "HAMBURGUESAS",
    subtitulo: "Smasheadas, artesanales, hechas al momento.",
    items: [
      {
        nombre: "GOLDEN BURGER",
        desc: "Pan de papa, cheddar x2, ketchup, mostaza, cebolla brunoise, panceta crocante, carne smash y pickles.",
        precio: "$14.500", tag: "10% OFF", emoji: "🍔", img: goldenburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "ketchup",  nombre: "Ketchup" },
          { id: "mostaza",  nombre: "Mostaza" },
          { id: "cebolla",  nombre: "Cebolla brunoise" },
          { id: "panceta",  nombre: "Panceta crocante" },
          { id: "pickles",  nombre: "Pickles" },
        ],
      },
      {
        nombre: "NAPOLITANA",
        desc: "Pan de papa, cheddar x2, mayonesa, tomate, jamón y carne smash.",
        precio: "$14.500", tag: "🔥 Popular", emoji: "🍔", img: napolitana,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "mayonesa", nombre: "Mayonesa" },
          { id: "tomate",   nombre: "Tomate" },
          { id: "jamon",    nombre: "Jamón" },
        ],
      },
      {
        nombre: "CUARTITO ALE",
        desc: "Pan de papa, cheddar x2, ketchup, mostaza, cebolla brunoise, carne smash.",
        precio: "$14.500", tag: "Clásica", emoji: "🍔", img: cuartitoale,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "ketchup", nombre: "Ketchup" },
          { id: "mostaza", nombre: "Mostaza" },
          { id: "cebolla", nombre: "Cebolla brunoise" },
        ],
      },
      {
        nombre: "HBQ",
        desc: "Pan de papa, cheddar x2, BBQ, mostaza dulce, cebolla caramelizada, panceta crocante y carne smash.",
        precio: "$14.500", tag: "BBQ", emoji: "🍔", img: hbq,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "bbq",             nombre: "Salsa BBQ" },
          { id: "mostaza-dulce",   nombre: "Mostaza dulce" },
          { id: "cebolla-caramel", nombre: "Cebolla caramelizada" },
          { id: "panceta",         nombre: "Panceta crocante" },
        ],
      },
      {
        nombre: "TUKI BURGER",
        desc: "Pan de papa, cheddar x2, BBQ, huevo a la plancha, panceta crocante y carne smash.",
        precio: "$14.500", tag: "Con huevo", emoji: "🍔", img: tukiburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "bbq",     nombre: "Salsa BBQ" },
          { id: "huevo",   nombre: "Huevo a la plancha" },
          { id: "panceta", nombre: "Panceta crocante" },
        ],
      },
      {
        nombre: "DELUXE CRISPY",
        desc: "Pan de papa, cheddar x2, BBQ, cebolla crispy, panceta crocante, carne smash y pickles.",
        precio: "$14.500", tag: "Crispy", emoji: "🍔", img: deluxecrispy,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "bbq",            nombre: "Salsa BBQ" },
          { id: "cebolla-crispy", nombre: "Cebolla crispy" },
          { id: "panceta",        nombre: "Panceta crocante" },
          { id: "pickles",        nombre: "Pickles" },
        ],
      },
      {
        nombre: "CHEESE BURGER",
        desc: "Pan de papa, salsa mil islas, carne smash x2 y cheddar x2. Incluye papas fritas.",
        precio: "$14.500", tag: "Doble + Papas", emoji: "🍔", img: cheeseburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "mil-islas", nombre: "Salsa mil islas" },
        ],
      },
      {
        nombre: "CHEESE BACON",
        desc: "Pan de papa, cheddar x2, panceta crocante y carne smash.",
        precio: "$14.500", tag: "🥓 Bacon", emoji: "🍔", img: cheesebacon,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "panceta", nombre: "Panceta crocante" },
        ],
      },
      {
        nombre: "LA FITZ ROY",
        desc: "Pan de papa, cheddar x2, BBQ, lechuga, tomate, cebolla, panceta crocante, carne smash x2 y pickles.",
        precio: "$14.500", tag: "Premium", emoji: "🍔", img: lafitzroy,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "bbq",     nombre: "Salsa BBQ" },
          { id: "lechuga", nombre: "Lechuga" },
          { id: "tomate",  nombre: "Tomate" },
          { id: "cebolla", nombre: "Cebolla" },
          { id: "panceta", nombre: "Panceta crocante" },
          { id: "pickles", nombre: "Pickles" },
        ],
      },
      {
        nombre: "BIG MAC",
        desc: "Pan de papa, cheddar x2, salsa big mac, lechuga, cebolla, carne smash x2 y pickles.",
        precio: "$14.500", tag: "Doble", emoji: "🍔", img: bigmac,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "salsa-bigmac", nombre: "Salsa Big Mac" },
          { id: "lechuga",      nombre: "Lechuga" },
          { id: "cebolla",      nombre: "Cebolla" },
          { id: "pickles",      nombre: "Pickles" },
        ],
      },
      {
        nombre: "MIMOSA BURGER",
        desc: "Pan de papa, salsa tasty, lechuga, tomate, cebolla, carne smash y cheddar.",
        precio: "$14.500", tag: "🌱 MIMOSA", emoji: "🍔", img: notburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "mil-islas", nombre: "Salsa mil islas" },
          { id: "lechuga",   nombre: "Lechuga" },
          { id: "tomate",    nombre: "Tomate" },
          { id: "cebolla",   nombre: "Cebolla brunoise" },
        ],
      },
      {
        nombre: "AMERICAN BURGER",
        desc: "Pan de papa, salsa mil islas, lechuga, tomate, cebolla brunoise, carne smash y cheddar x2. Incluye papas fritas.",
        precio: "$14.500", tag: "Con Papas", emoji: "🇺🇸", img: americanburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "mil-islas", nombre: "Salsa mil islas" },
          { id: "lechuga",   nombre: "Lechuga" },
          { id: "tomate",    nombre: "Tomate" },
          { id: "cebolla",   nombre: "Cebolla brunoise" },
        ],
      },
      {
        nombre: "SWEET BURGER",
        desc: "Pan de papa, salsa big mac, cebolla caramelizada con miel, carne smash y cheddar x2.",
        precio: "$14.500", tag: "Dulce", emoji: "🍔", img: sweetburger,
        tamanios: TAMANIOS_BURGERS,
        ingredientes: [
          { id: "salsa-bigmac",    nombre: "Salsa Big Mac" },
          { id: "cebolla-caramel", nombre: "Cebolla caramelizada con miel" },
        ],
      },
      {
        nombre: "BACON JAM",
        desc: "Pan de papa invertido, mermelada de bacon y cebolla caramelizada, queso dambo, queso cheddar, carne smash x2 y pickles.",
        precio: "$17.500", tag: "Premium", emoji: "🍔", img: baconjam,
        tamanios: TAMANIOS_PREMIUM,
        ingredientes: [
          { id: "mermelada-bacon", nombre: "Mermelada de bacon" },
          { id: "cebolla-caramel", nombre: "Cebolla caramelizada" },
          { id: "queso-dambo",     nombre: "Queso dambo" },
          { id: "pickles",         nombre: "Pickles" },
        ],
      },
      {
        nombre: "SLIDERS",
        desc: "Pan de papa, cheddar y carne smash. Mini burger ideal para compartir.",
        precio: "$4.000", tag: "Mini", emoji: "🍔", img: sliders,
        ingredientes: [],
      },
    ],
  },
  {
    id: "bebidas",
    titulo: "BEBIDAS",
    subtitulo: "Para acompañar tu burger.",
    items: [
      { nombre: "COCA COLA 500ml",  desc: "Bebida clásica bien fría.",         precio: "$2.500", tag: "Clásica",  emoji: "🥤", img: cocaCola500 },
      { nombre: "COCA COLA 1.75L",  desc: "Ideal para compartir en familia.",  precio: "$5.000", tag: "Familiar", emoji: "🥤", img: cocaCola175 },
      { nombre: "FANTA 500ml",      desc: "Naranja, refrescante y bien fría.", precio: "$2.500", tag: "Naranja",  emoji: "🥤", img: fanta500 },
    ],
  },
  {
    id: "acompanar",
    titulo: "PARA ACOMPAÑAR",
    subtitulo: "Sumá un extra a tu pedido.",
    items: [
      { nombre: "PAPAS CHICAS",     desc: "150grs de la mejor papa.",                               precio: "$3.000", tag: "10% OFF",       emoji: "🍟", img: bandejadepapa },
      { nombre: "BANDEJA DE PAPAS", desc: "350grs de papas crocantes.",                            precio: "$6.000", tag: "Para compartir", emoji: "🍟", img: bandejadepapa },
      { nombre: "AROS DE CEBOLLA",  desc: "10 aros de cebolla por bandeja (150grs).",              precio: "$7.500", tag: "Crispy",         emoji: "🧅" },
      { nombre: "CHICKEN ALE",      desc: "4 piezas crocantes de pollo + papas + dip a elección.", precio: "$16.000", tag: "🍗 Combo",      emoji: "🍗", img: chickenale },
    ],
  },
];
