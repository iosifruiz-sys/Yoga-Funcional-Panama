import type { Locale } from '../i18n';

interface Resource {
  id: string;
  title: string;
  language: 'es' | 'ru';
  description: Record<Locale, string>;
  // Public paths relative to BASE_URL. Set only after adding approved assets.
  pdf: string | null;
  cover: string | null;
}

export const resources: Resource[] = [
  {
    id: 'que-tan-movil-eres',
    title: '¿Qué tan móvil eres?',
    language: 'es',
    description: {
      es: 'Cinco experimentos de movimiento sencillos para explorar tu movilidad por tu cuenta.',
      ru: 'Пять простых двигательных экспериментов для самостоятельного изучения мобильности.',
    },
    pdf: null,
    cover: null,
  },
];
