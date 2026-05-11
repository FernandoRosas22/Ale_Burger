import burger from "@/assets/hamburguesa-hero.jpg";
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

export type MenuItem = {
  nombre: string;
  desc?: string;
  precio: string;
  precioAnt?: string;
  tag?: string;
  emoji: string;
  destacado?: boolean;
  img?: string;
};

export type MenuCategory = {
  id: string;
  titulo: string;
  subtitulo?: string;
  items: MenuItem[];
};

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
      },
      {
        nombre: "PROMO MENÚ CENA",
        desc: "1 burger doble (Cheese Burger o Cheese Bacon) + 1 porción de papas + 1 bebida 500ml.",
        precio: "$16.500",
        tag: "Combo",
        emoji: "🍟",
        destacado: true,
      },
    ],
  },
  {
    id: "burgers",
    titulo: "HAMBURGUESAS",
    subtitulo: "Smasheadas, artesanales, hechas al momento.",
    items: [
      { nombre: "GOLDEN BURGER", desc: "Pan de papa, cheddar x2, ketchup, mostaza, cebolla brunoise, panceta crocante, carne smash y pickles.", precio: "$13.050", precioAnt: "$14.500", tag: "10% OFF", emoji: "🍔", img: burger },
      { nombre: "NAPOLITANA", desc: "Pan de papa, cheddar x2, mayonesa, tomate, jamón y carne smash.", precio: "$13.050", precioAnt: "$14.500", tag: "🔥 Popular", emoji: "🥓", img: napolitana },
      { nombre: "CUARTITO ALE", desc: "Pan de papa, cheddar x2, ketchup, mostaza, cebolla brunoise, carne smash.", precio: "$13.050", precioAnt: "$14.500", tag: "Clásica", emoji: "🌶️", img: cuartitoale },
      { nombre: "HBQ", desc: "Pan de papa, cheddar x2, BBQ, mostaza dulce, cebolla caramelizada, panceta crocante y carne smash.", precio: "$13.050", precioAnt: "$14.500", tag: "BBQ", emoji: "🍖", img: hbq },
      { nombre: "TUKI BURGER", desc: "Pan de papa, cheddar x2, BBQ, huevo a la plancha, panceta crocante y carne smash.", precio: "$13.050", precioAnt: "$14.500", tag: "Con huevo", emoji: "🍳", img: tukiburger },
      { nombre: "DELUXE CRISPY", desc: "Pan de papa, cheddar x2, BBQ, cebolla crispy, panceta crocante, carne smash y pickles.", precio: "$13.050", precioAnt: "$14.500", tag: "Crispy", emoji: "🧅", img: deluxecrispy },
      { nombre: "CHEESE BURGER", desc: "Pan de papa, salsa mil islas, carne smash x2 y cheddar x2. Incluye papas fritas.", precio: "$13.050", precioAnt: "$14.500", tag: "Doble + Papas", emoji: "🧀", img: cheeseburger },
      { nombre: "CHEESE BACON", desc: "Pan de papa, cheddar x2, panceta crocante y carne smash.", precio: "$13.050", precioAnt: "$14.500", tag: "🥓 Bacon", emoji: "🥓", img: cheesebacon },
      { nombre: "LA FITZ ROY", desc: "Pan de papa, cheddar x2, BBQ, lechuga, tomate, cebolla, panceta crocante, carne smash x2 y pickles.", precio: "$15.750", precioAnt: "$17.500", tag: "Premium", emoji: "⭐", img: lafitzroy },
      { nombre: "BIG MAC", desc: "Pan de papa, cheddar x2, salsa big mac, lechuga, cebolla, carne smash x2 y pickles.", precio: "$15.750", precioAnt: "$17.500", tag: "Doble", emoji: "🍔", img: bigmac },
      { nombre: "NOT BURGER", desc: "Pan de papa, cheddar x2, salsa mil islas, lechuga, tomate, cebolla brunoise y medallón veggie.", precio: "$13.050", precioAnt: "$14.500", tag: "🌱 Veggie", emoji: "🥬", img: notburger },
      { nombre: "AMERICAN BURGER", desc: "Pan de papa, salsa mil islas, lechuga, tomate, cebolla brunoise, carne smash y cheddar x2. Incluye papas fritas.", precio: "$13.050", precioAnt: "$14.500", tag: "Con Papas", emoji: "🇺🇸", img: americanburger },
      { nombre: "SWEET BURGER", desc: "Pan de papa, salsa big mac, cebolla caramelizada con miel, carne smash y cheddar x2.", precio: "$13.050", precioAnt: "$14.500", tag: "Dulce", emoji: "🍯", img: sweetburger  },
      { nombre: "BACON JAM", desc: "Pan de papa invertido, mermelada de bacon y cebolla caramelizada, queso dambo, queso cheddar, carne smash x2 y pickles.", precio: "$15.750", precioAnt: "$17.500", tag: "Premium", emoji: "🔥", img: baconjam },
      { nombre: "SLIDERS", desc: "Pan de papa, cheddar y carne smash. Mini burger ideal para compartir.", precio: "$4.000", tag: "Mini", emoji: "🍔" },
    ],
  },
  {
    id: "bebidas",
    titulo: "BEBIDAS",
    subtitulo: "Para acompañar tu burger.",
    items: [
      { nombre: "COCA COLA 500ml", desc: "Bebida clásica bien fría.", precio: "$2.500", tag: "Clásica", emoji: "🥤", img: cocaCola500 },
      { nombre: "COCA COLA 1.75L", desc: "Ideal para compartir en familia.", precio: "$5.000", tag: "Familiar", emoji: "🧃", img: cocaCola175 },
      { nombre: "FANTA 500ml", desc: "Naranja, refrescante y bien fría.", precio: "$2.500", tag: "Naranja", emoji: "🍊", img: fanta500 },
    ],
  },
  {
    id: "acompanar",
    titulo: "PARA ACOMPAÑAR",
    subtitulo: "Sumá un extra a tu pedido.",
    items: [
      { nombre: "PAPAS CHICAS", desc: "150grs de la mejor papa.", precio: "$2.700", precioAnt: "$3.000", tag: "10% OFF", emoji: "🍟" },
      { nombre: "BANDEJA DE PAPAS", desc: "350grs de papas crocantes.", precio: "$5.400", precioAnt: "$6.000", tag: "Para compartir", emoji: "🍟" },
      { nombre: "AROS DE CEBOLLA", desc: "10 aros de cebolla por bandeja (150grs).", precio: "$6.750", precioAnt: "$7.500", tag: "Crispy", emoji: "🧅" },
      { nombre: "CHICKEN ALE", desc: "4 piezas crocantes de pollo + papas + dip a elección.", precio: "$14.400", precioAnt: "$16.000", tag: "🍗 Combo", emoji: "🍗" },
    ],
  },
];
