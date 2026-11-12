import type { Locale } from '../i18n';
import { locations } from '../data/classes/locations';
import links from '../data/classes/links.json';

export type ClassPlace = keyof typeof locations.es;

export function classBookingUrl(locale: Locale, place: ClassPlace): string {
  const url = new URL(links.personalBookingUrl);
  const category = locations[locale][place].title.toLowerCase();
  url.searchParams.set('text', locale === 'es'
    ? `Hola, quiero reservar una clase ${category}.`
    : `Здравствуйте! Хочу записаться на занятия: ${category}.`);
  return url.href;
}
