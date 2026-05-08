# AleBurgers

Sitio web oficial de **AleBurgers** — hamburguesas artesanales smasheadas en Buenos Aires.

Stack: **Vite + React 18 + TypeScript + React Router**. CSS plano, sin frameworks de UI.

## Requisitos

- Node.js 18+
- npm 9+

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # entorno de desarrollo en http://localhost:5173
npm run build    # build de producción en /dist
npm run preview  # servir el build localmente
```

## Estructura

```
src/
├── assets/          # Imágenes (logo, hero, productos)
├── components/      # Componentes UI reutilizables (Navbar, Footer, MenuCard, ...)
├── data/            # Datos estáticos (menú, contacto)
├── hooks/           # Hooks reutilizables
├── pages/           # Páginas ruteables (Home)
├── styles/          # CSS global y tokens de diseño
├── utils/           # Helpers puros (links de WhatsApp, formato)
├── App.tsx          # Router raíz
└── main.tsx         # Entry point
public/
└── media/           # Videos del menú
```

### Convenciones

- **Datos** vivos en `src/data/` — no hardcodear precios en componentes.
- **Componentes** atómicos por archivo, props tipadas, sin lógica de negocio.
- **Estilos** en `src/styles/aleburgers.css` con variables CSS (`--naranja`, `--negro`, ...).
- **Utils** son funciones puras y testeables.

## Deploy

Compatible con Vercel, Netlify y cualquier hosting estático.

```bash
npm run build && npx vercel --prod
```

## Licencia

Privado © AleBurgers.
