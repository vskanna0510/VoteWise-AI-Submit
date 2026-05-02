/**
 * Google Calendar placeholder.
 * Real wiring uses gapi or the modern Google Identity Services + Calendar v3 API.
 *
 * `addEventToCalendar` returns a deep link to add the event in the user's
 * default Google account — works without a key, perfect for the demo.
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  startISO: string;
  durationMinutes?: number;
  location?: string;
}

export const isCalendarConfigured = (): boolean =>
  Boolean(import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID);

const fmt = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');

export const buildCalendarLink = (e: CalendarEvent): string => {
  const start = fmt(e.startISO);
  const end = fmt(
    new Date(new Date(e.startISO).getTime() + (e.durationMinutes ?? 60) * 60_000).toISOString()
  );
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${start}/${end}`,
    details: e.description ?? '',
    location: e.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const addEventToCalendar = (e: CalendarEvent): void => {
  window.open(buildCalendarLink(e), '_blank', 'noopener');
};
