# Yoga Funcional Panamá

Primer prototipo visual de una presencia web editorial y brutalista para presentar el yoga como entrenamiento físico, de atención y de recuperación. El alcance actual está deliberadamente limitado a la cabecera, el hero y una sección editorial de método.

## Tecnología

- **Astro 5** con salida HTML completamente estática.
- CSS nativo y tokens globales; sin framework UI, React ni JavaScript hidratado.
- TypeScript estricto y `astro check` para validación.
- Google Fonts para Inter, League Gothic y UnifrakturCook.

No se añadió una biblioteca de animación: un reveal breve con CSS es suficiente para este prototipo, evita peso de cliente y se desactiva con `prefers-reduced-motion`.

## Estructura

```text
src/
  components/       Header, Hero y MethodSection
  layouts/          Metadatos SEO y documento HTML español
  pages/            `/` ahora; preparado para futuras `/ru/` y `/blog/`
  styles/           tokens y composición global
public/fonts/       webfonts propios
design-system.json  fuente de verdad visual
```

Astro usa enrutamiento por archivos: en próximas iteraciones `src/pages/ru/index.astro`, `src/pages/blog/index.astro` y `src/pages/blog/[slug].astro` habilitarán los destinos previstos sin cambiar la base técnica.

## Tipografía y Molot

Molot no se ha descargado de fuentes de terceros. Para activarlo, coloque un archivo **con licencia web válida** en `public/fonts/Molot.woff2`. El `@font-face` ya está preparado con `font-display: swap`; mientras falta el archivo se utiliza el fallback temporal pesado `Arial Black / Impact`, sin condensación artificial. Los demás roles siguen la especificación de `design-system.json`.

## Desarrollo

Requiere Node.js 20 o superior.

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
```

`PUBLIC_WHATSAPP_URL` permite configurar el enlace de **Reservar** sin tocar componentes. Hasta recibir el destino final, apunta a `#reservar`.

## GitHub Pages y dominio futuro

El workflow `.github/workflows/deploy.yml` instala, construye y publica `dist/` al hacer push. La base predeterminada es `/Yoga-Funcional-Panama/`, por lo que los assets funcionan como project site. En **Settings → Pages**, seleccione *GitHub Actions* como fuente.

Para un dominio personalizado, configure el dominio en GitHub Pages y defina durante el build:

```sh
SITE_URL=https://www.ejemplo.com PUBLIC_BASE_PATH=/ npm run build
```

## Pendientes editoriales

- Sustituir el placeholder gráfico por fotografías reales autorizadas del entrenador y la práctica.
- Proporcionar `Molot.woff2` y confirmar su licencia.
- Confirmar URL de WhatsApp, horarios, ubicación y datos de marca.
- Diseñar las rutas rusa y de blog únicamente en una iteración posterior.

## Contenido bilingüe

El español sigue siendo el idioma predeterminado (`/`) y el ruso se publica bajo `/ru/`. Las cadenas de la interfaz y los metadatos de ambos idiomas se editan en `src/i18n.ts`; las páginas comparten los mismos componentes y estilos.

Decap CMS mantiene el mismo acceso en `/admin/` y muestra dos colecciones:

- **Blog ES** guarda artículos en `src/content/blog/` y los publica en `/blog/[slug]/`.
- **Blog RU** guarda artículos en `src/content/blog/ru/` y los publica en `/ru/blog/[slug]/`.

Para enlazar dos traducciones, indique en el campo `translationSlug` de cada artículo el slug del artículo equivalente en la otra colección. El selector de idioma irá directamente a la traducción cuando ambas entradas publicadas se referencien; si no hay traducción, vuelve de forma segura al índice del blog del otro idioma.
