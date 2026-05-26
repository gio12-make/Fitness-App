import {
  format,
  startOfWeek,
  addDays,
  differenceInCalendarDays,
  parseISO,
  isToday,
  isYesterday,
} from 'date-fns';

export function toISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISO(new Date());
}

export function isoToDate(iso: string): Date {
  return parseISO(iso);
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekStartISO(date: Date = new Date()): string {
  return toISO(getWeekStart(date));
}

export function daysUntil(targetISO: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(targetISO), new Date()));
}

export function getWeekDates(weekStartISO: string): string[] {
  const start = parseISO(weekStartISO);
  return Array.from({ length: 7 }, (_, i) => toISO(addDays(start, i)));
}

export function getLast30Days(): string[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => toISO(addDays(today, -(29 - i))));
}

export function getLast7Days(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => toISO(addDays(today, -(6 - i))));
}

export function formatDisplayDate(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE d MMM');
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'd MMM');
}

export function dayOfWeek(iso: string): number {
  return parseISO(iso).getDay(); // 0=Sun
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}
