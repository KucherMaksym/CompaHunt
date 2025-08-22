import {parseISO, format, Locale} from 'date-fns';
import {fromZonedTime, toZonedTime, formatInTimeZone} from 'date-fns-tz';

// Convert a local Date object to UTC ISO string for sending to server
export function dateToUTC(date: Date): string {
    return date.toISOString();
}

// Convert a UTC ISO string from server to local Date object
export function utcToDate(utcString: string): Date {
    return new Date(utcString);
}

// Get user's timezone
export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Convert datetime-local input value to UTC ISO string
export function inputValueToUTC(inputValue: string): string {
    const userTimezone = getUserTimezone();

    const localDate = new Date(inputValue);

    const utcDate = fromZonedTime(localDate, userTimezone);

    return utcDate.toISOString();
}

// Format a UTC ISO string for datetime-local input
export function formatUTCForInput(utcString: string): string {
    const userTimezone = getUserTimezone();
    const utcDate = parseISO(utcString);

    const localDate = toZonedTime(utcDate, userTimezone);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Format a UTC ISO string for display in user's local timezone
export function formatUTCForDisplay(
    utcString: string,
    formatStr: string = 'PPp',
    options?: { locale?: Locale }
): string {
    const userTimezone = getUserTimezone();
    const utcDate = parseISO(utcString);

    return formatInTimeZone(utcDate, userTimezone, formatStr, options);
}

// Alternative formatting using Intl.DateTimeFormat
export function formatUTCForDisplayIntl(
    utcString: string,
    options?: Intl.DateTimeFormatOptions
): string {
    const userTimezone = getUserTimezone();
    const utcDate = parseISO(utcString);

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userTimezone,
        timeZoneName: 'short'
    };

    return utcDate.toLocaleString(undefined, {...defaultOptions, ...options});
}

// Format a UTC ISO string in a specific timezone
export function formatUTCInTimezone(
    utcString: string,
    targetTimezone: string,
    formatStr: string = 'PPp'
): string {
    const utcDate = parseISO(utcString);
    return formatInTimeZone(utcDate, targetTimezone, formatStr);
}

// Convert local time from one timezone to UTC
export function convertTimezoneToUTC(
    dateString: string,
    sourceTimezone: string
): string {
    const localDate = new Date(dateString);
    const utcDate = fromZonedTime(localDate, sourceTimezone);
    return utcDate.toISOString();
}

// Convert UTC time to specific timezone
export function convertUTCToTimezone(
    utcString: string,
    targetTimezone: string
): Date {
    const utcDate = parseISO(utcString);
    return toZonedTime(utcDate, targetTimezone);
}

// Utility function to check if a datetime string is valid
export function isValidDateTimeString(dateTimeString: string): boolean {
    try {
        const date = parseISO(dateTimeString);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
}

// Get current time in UTC
export function getCurrentUTC(): string {
    return new Date().toISOString();
}

// Get current time formatted for datetime-local input
export function getCurrentForInput(): string {
    return formatUTCForInput(getCurrentUTC());
}

// Get timezone offset in minutes for a specific timezone
export function getTimezoneOffset(timezone: string, date?: Date): number {
    const targetDate = date || new Date();
    const utc = targetDate.getTime() + (targetDate.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (getTimezoneOffsetMs(timezone, targetDate)));
    return (targetTime.getTime() - utc) / 60000;
}

// Helper function to get timezone offset in milliseconds
function getTimezoneOffsetMs(timezone: string, date: Date): number {
    const localTime = date.toLocaleString('en-US', {timeZone: timezone});
    const utcTime = date.toLocaleString('en-US', {timeZone: 'UTC'});
    return new Date(localTime).getTime() - new Date(utcTime).getTime();
}