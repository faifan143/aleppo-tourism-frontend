/**
 * Formats a date object to a localized Arabic date string (Gregorian calendar)
 * 
 * @param date Date object or string to format
 * @returns Formatted date string in Arabic with Gregorian calendar
 */
export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Use ar-EG (Egyptian Arabic) which uses Gregorian calendar by default
    return dateObj.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Formats a date range to a human-readable string
 * 
 * @param startDate Start date object or string
 * @param endDate End date object or string
 * @returns Formatted date range string in Arabic locale
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);

    return `${startFormatted} - ${endFormatted}`;
}

/**
 * Checks if a date is in the future
 * 
 * @param date Date object or string to check
 * @returns Boolean indicating if the date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    return dateObj > now;
}

/**
 * Checks if a date is in the past
 * 
 * @param date Date object or string to check
 * @returns Boolean indicating if the date is in the past
 */
export function isPastDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    return dateObj < now;
}

/**
 * Formats a date to a relative time string (e.g., "2 days ago", "in 3 hours")
 * 
 * @param date Date object or string to format
 * @returns Relative time string in Arabic
 */
export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `بعد ${diffInDays} ${diffInDays === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffInDays < 0) {
        return `منذ ${Math.abs(diffInDays)} ${Math.abs(diffInDays) === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffInHours > 0) {
        return `بعد ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffInHours < 0) {
        return `منذ ${Math.abs(diffInHours)} ${Math.abs(diffInHours) === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffInMins > 0) {
        return `بعد ${diffInMins} ${diffInMins === 1 ? 'دقيقة' : 'دقائق'}`;
    } else if (diffInMins < 0) {
        return `منذ ${Math.abs(diffInMins)} ${Math.abs(diffInMins) === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
        return 'الآن';
    }
} 