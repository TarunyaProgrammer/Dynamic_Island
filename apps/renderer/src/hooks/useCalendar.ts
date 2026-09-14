// apps/renderer/src/hooks/useCalendar.ts
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, GoogleCalendarInfo, GoogleOAuthStatus } from '@shared/types';

interface CalendarState {
  events: CalendarEvent[];
  calendars: GoogleCalendarInfo[];
  googleStatus: GoogleOAuthStatus;
  loading: boolean;
  error: string | null;
}

// Fetch events from 14 days ago to 60 days ahead to have full context
function getDateRange(): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() - 14);
  const end = new Date();
  end.setDate(end.getDate() + 60);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function useCalendar() {
  const [state, setState] = useState<CalendarState>({
    events: [],
    calendars: [],
    googleStatus: 'disconnected',
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { start, end } = getDateRange();
      const [events, statusRes, calendars] = await Promise.all([
        window.beacon.calendar.getEvents(start, end),
        window.beacon.calendar.googleAuth.status(),
        window.beacon.calendar.getCalendars(),
      ]);
      setState({
        events,
        calendars,
        googleStatus: statusRes.status,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load calendar events',
      }));
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // Re-fetch when main process broadcasts a calendar change (Google connect/disconnect)
  useEffect(() => {
    return window.beacon.onCalendarChanged(() => {
      void fetchAll();
    });
  }, [fetchAll]);

  const connectGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, googleStatus: 'connecting' }));
    try {
      await window.beacon.calendar.googleAuth.start();
      void fetchAll();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        googleStatus: 'error',
        error: err instanceof Error ? err.message : 'Google Calendar connection failed',
      }));
    }
  }, [fetchAll]);

  const disconnectGoogle = useCallback(async () => {
    await window.beacon.calendar.googleAuth.disconnect();
    void fetchAll();
  }, [fetchAll]);

  /** Events from today onward, sorted by start */
  const upcomingEvents = state.events.filter(
    (e) => new Date(e.end) >= new Date(),
  );

  /** The very next event from now */
  const nextEvent = upcomingEvents[0] ?? null;

  /** Minutes until the next event starts (negative = already started) */
  const minutesUntilNext = nextEvent
    ? Math.round((new Date(nextEvent.start).getTime() - Date.now()) / 60_000)
    : null;

  return {
    ...state,
    upcomingEvents,
    nextEvent,
    minutesUntilNext,
    refetch: fetchAll,
    connectGoogle,
    disconnectGoogle,
  };
}
