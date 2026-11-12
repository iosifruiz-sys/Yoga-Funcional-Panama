import type { Locale } from '../i18n';
import { locations } from '../data/classes/locations';
import links from '../data/classes/links.json';
import scheduleData from '../data/schedule/classes.json';
import { validateScheduleBookingUrl } from './schedule';

export type ClassPlace = keyof typeof locations.es;

export function classBookingUrl(locale: Locale, place: ClassPlace): string {
  const url = new URL(place === 'estudio' ? validateScheduleBookingUrl(scheduleData.bookingUrl) : links.personalBookingUrl);
  const category = locations[locale][place].title.toLowerCase();
  url.searchParams.set('text', place === 'estudio'
    ? (locale === 'es'
      ? 'Hola, quiero consultar el costo actual y las condiciones de las clases en Antakarana.'
      : 'Здравствуйте! Хочу уточнить актуальную стоимость и условия занятий в Antakarana.')
    : locale === 'es'
    ? `Hola, quiero reservar una clase ${category}.`
    : `Здравствуйте! Хочу записаться на занятия: ${category}.`);
  return url.href;
}
