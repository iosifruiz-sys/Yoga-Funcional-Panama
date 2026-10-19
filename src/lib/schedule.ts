export const scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type ScheduleDay = typeof scheduleDays[number];

interface GroupClass {
  day: string;
  startTime: string;
  studio: string;
  classType: string;
  bookingUrl: string;
}

export interface GroupSchedule {
  bookingUrl: string;
  classes?: GroupClass[];
}

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function validateScheduleBookingUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !value.startsWith('https://') || /\s/.test(value)) {
    throw new Error('Schedule booking links must be HTTPS URLs (including https://wa.me/).');
  }
  return value;
}

export function sortGroupClasses(entries: readonly GroupClass[] = []) {
  const classes = entries.map((entry) => {
    if (!scheduleDays.includes(entry.day as ScheduleDay)) {
      throw new Error(`Invalid schedule day: ${entry.day}`);
    }
    if (!timePattern.test(entry.startTime)) {
      throw new Error(`Invalid schedule time: ${entry.startTime}. Use HH:mm (00:00–23:59).`);
    }
    if (!entry.studio.trim() || entry.classType !== 'group') {
      throw new Error('Each schedule entry must specify a studio/place and be a group class.');
    }
    validateScheduleBookingUrl(entry.bookingUrl);
    return { ...entry, day: entry.day as ScheduleDay };
  });

  return classes.sort((a, b) => scheduleDays.indexOf(a.day) - scheduleDays.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
}

export function formatScheduleTime(value: string): string {
  if (!timePattern.test(value)) throw new Error(`Invalid schedule time: ${value}`);
  const [hours, minutes] = value.split(':');
  const hour = Number(hours);
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? 'AM' : 'PM'}`;
}
