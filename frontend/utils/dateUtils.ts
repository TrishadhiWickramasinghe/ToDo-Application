import { format, parse, isValid, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormattedDateTime {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or H:mm A
  datetime: string; // Combined
  display: string; // Human readable: "Mon, Jun 9 · 2:30 PM"
}

// ─── Conversion Utilities ─────────────────────────────────────────────────────

/**
 * Convert Date object to backend format (separate date and time)
 * @param date - Date object
 * @returns { date, time } in backend format
 */
export const dateToBackend = (date: Date | null) => {
  if (!date || !isValid(date)) {
    return { date: null, time: null };
  }

  return {
    date: format(date, 'yyyy-MM-dd'),
    time: format(date, 'HH:mm:ss'),
  };
};

/**
 * Convert backend date and time strings to Date object
 * @param date - YYYY-MM-DD
 * @param time - HH:mm:ss
 * @returns Date object
 */
export const backendToDate = (date: string | null, time: string | null): Date | null => {
  if (!date) return null;

  try {
    const combined = `${date} ${time || '00:00:00'}`;
    const parsed = parse(combined, 'yyyy-MM-dd HH:mm:ss', new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Convert ISO string to Date object
 * @param iso - ISO 8601 string (e.g., "2026-06-09T14:30:00Z")
 * @returns Date object
 */
export const isoToDate = (iso: string | null): Date | null => {
  if (!iso) return null;

  try {
    const parsed = parseISO(iso);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// ─── Format Utilities ─────────────────────────────────────────────────────────

/**
 * Format date for display
 * @param date - Date object
 * @param timeFormat - '12h' or '24h'
 * @returns Formatted string
 */
export const formatDisplayDateTime = (
  date: Date | null,
  timeFormat: '12h' | '24h' = '24h'
): string => {
  if (!date || !isValid(date)) return '';

  const timeStr = timeFormat === '12h'
    ? format(date, 'h:mm a')
    : format(date, 'HH:mm');

  return `${format(date, 'EEE, MMM d')} · ${timeStr}`;
};

/**
 * Format date only (no time)
 * @param date - Date object
 * @returns Formatted date string
 */
export const formatDate = (date: Date | null): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'EEE, MMM d, yyyy');
};

/**
 * Format time only
 * @param date - Date object
 * @param timeFormat - '12h' or '24h'
 * @returns Formatted time string
 */
export const formatTime = (date: Date | null, timeFormat: '12h' | '24h' = '24h'): string => {
  if (!date || !isValid(date)) return '';
  return timeFormat === '12h' ? format(date, 'h:mm a') : format(date, 'HH:mm');
};

/**
 * Format for input elements (date and time separately)
 * @param date - Date object
 * @returns { dateInput, timeInput }
 */
export const formatForInputs = (date: Date | null) => {
  if (!date || !isValid(date)) {
    return { dateInput: '', timeInput: '' };
  }

  return {
    dateInput: format(date, 'yyyy-MM-dd'),
    timeInput: format(date, 'HH:mm'),
  };
};

/**
 * Get all formatted variations of a date
 * @param date - Date object
 * @param timeFormat - '12h' or '24h'
 * @returns FormattedDateTime object
 */
export const formatDateTime = (
  date: Date | null,
  timeFormat: '12h' | '24h' = '24h'
): FormattedDateTime => {
  if (!date || !isValid(date)) {
    return {
      date: '',
      time: '',
      datetime: '',
      display: '',
    };
  }

  return {
    date: format(date, 'yyyy-MM-dd'),
    time: format(date, 'HH:mm:ss'),
    datetime: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
    display: formatDisplayDateTime(date, timeFormat),
  };
};

// ─── Validation Utilities ────────────────────────────────────────────────────

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns true if valid
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
  return isValid(parsed);
};

/**
 * Validate time string format (HH:mm or HH:mm:ss)
 * @param timeString - Time string to validate
 * @returns true if valid
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  const regexLong = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  const regexShort = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  return regexLong.test(timeString) || regexShort.test(timeString);
};

/**
 * Validate that a date is not in the past
 * @param date - Date to validate
 * @returns true if date is today or in the future
 */
export const isNotPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
};

// ─── Filtering Utilities ─────────────────────────────────────────────────────

/**
 * Filter todos by date range
 * @param todos - Array of todos with startDateTime
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Filtered todos
 */
export const filterTodosByDateRange = <T extends { startDateTime?: string | Date }>(
  todos: T[],
  startDate: Date,
  endDate: Date
): T[] => {
  return todos.filter((todo) => {
    if (!todo.startDateTime) return false;

    const todoDate = typeof todo.startDateTime === 'string'
      ? parseISO(todo.startDateTime)
      : todo.startDateTime;

    return todoDate >= startDate && todoDate <= endDate;
  });
};

/**
 * Group todos by date
 * @param todos - Array of todos
 * @param dateField - Field name containing date
 * @returns Grouped todos
 */
export const groupTodosByDate = <T extends Record<string, any>>(
  todos: T[],
  dateField: string = 'startDateTime'
): Record<string, T[]> => {
  return todos.reduce((acc, todo) => {
    const dateValue = todo[dateField];
    if (!dateValue) return acc;

    const date = typeof dateValue === 'string'
      ? parseISO(dateValue)
      : dateValue;

    const dateKey = format(date, 'yyyy-MM-dd');

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(todo);
    return acc;
  }, {} as Record<string, T[]>);
};

// ─── Relative Date Utilities ─────────────────────────────────────────────────

/**
 * Get relative date text (e.g., "Today", "Tomorrow", "In 3 days")
 * @param date - Date to get relative text for
 * @returns Relative date string
 */
export const getRelativeDateText = (date: Date): string => {
  if (!isValid(date)) return '';

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  const dateNormalized = new Date(date);
  dateNormalized.setHours(0, 0, 0, 0);

  if (dateNormalized.getTime() === today.getTime()) return 'Today';
  if (dateNormalized.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (dateNormalized.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffTime = dateNormalized.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return format(date, 'MMM d, yyyy');
};

/**
 * Get upcoming todos (due within X days)
 * @param todos - Array of todos
 * @param days - Number of days to look ahead
 * @param dateField - Field name containing date
 * @returns Filtered todos
 */
export const getUpcomingTodos = <T extends Record<string, any>>(
  todos: T[],
  days: number = 7,
  dateField: string = 'startDateTime'
): T[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  return filterTodosByDateRange(todos, today, endDate);
};
