import * as moment from 'moment-timezone';

interface PermalinkResource {
    published_at?: string | number | Date | null;
    primary_author?: {
        slug: string;
    } | null;
    primary_tag?: {
        slug: string;
    } | null;
    slug: string;
    id: string;
}

interface DateParts {
    year: string;
    month: string;
    day: string;
}

// ISO 8601 date-times with an explicit offset describe an exact instant, so they
// parse identically with `Date.parse` and moment. Anything else (no offset,
// other formats) is parsed by moment in the site timezone and goes the slow path.
const ISO_WITH_OFFSET_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

// Intl uses the Julian calendar before 1582 and moment pads/formats years outside
// 4 digits differently, only use Intl for timestamps comfortably inside 1900-9999
const MIN_FAST_TIMESTAMP = Date.UTC(1900, 0, 2);
const MAX_FAST_TIMESTAMP = Date.UTC(9999, 11, 30);

// Timezones are a tiny set (usually one per site), bounded so arbitrary input
// can't grow the cache unchecked. `null` marks a timezone Intl doesn't support.
const MAX_FORMATTER_ENTRIES = 100;
const formatterCache = new Map<string, Intl.DateTimeFormat | null>();

function getFormatter(timezone: string): Intl.DateTimeFormat | null {
    let formatter = formatterCache.get(timezone);

    if (formatter === undefined) {
        try {
            // en-CA formats as YYYY-MM-DD
            formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            formatter = null;
        }

        if (formatterCache.size >= MAX_FORMATTER_ENTRIES) {
            formatterCache.clear();
        }
        formatterCache.set(timezone, formatter);
    }

    return formatter;
}

function getTimestamp(date: unknown): number | null {
    if (date instanceof Date) {
        return date.getTime();
    }

    if (typeof date === 'number') {
        return date;
    }

    if (typeof date === 'string' && ISO_WITH_OFFSET_REGEX.test(date)) {
        return Date.parse(date);
    }

    return null;
}

function getDatePartsFast(date: unknown, timezone: string): DateParts | null {
    if (typeof timezone !== 'string') {
        return null;
    }

    const timestamp = getTimestamp(date);

    if (timestamp === null || !(timestamp >= MIN_FAST_TIMESTAMP && timestamp <= MAX_FAST_TIMESTAMP)) {
        return null;
    }

    const formatter = getFormatter(timezone);

    if (!formatter) {
        return null;
    }

    const formatted = formatter.format(timestamp);

    // guard against ICU/CLDR changes to the en-CA date format
    if (formatted.length !== 10 || formatted.charCodeAt(4) !== 45 || formatted.charCodeAt(7) !== 45) {
        return null;
    }

    return {
        year: formatted.slice(0, 4),
        month: formatted.slice(5, 7),
        day: formatted.slice(8, 10)
    };
}

function getDateParts(date: unknown, timezone: string): DateParts {
    const fastParts = getDatePartsFast(date, timezone);

    if (fastParts) {
        return fastParts;
    }

    // fall back to moment-timezone for inputs Intl can't handle identically
    const publishedAtMoment = moment.tz(date as moment.MomentInput, timezone);

    return {
        year: publishedAtMoment.format('YYYY'),
        month: publishedAtMoment.format('MM'),
        day: publishedAtMoment.format('DD')
    };
}

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: PermalinkResource, timezone: string = 'UTC'): string {
    const primaryTagFallback = 'all';
    let dateParts: DateParts | undefined;

    // date parts are only computed if the permalink contains a date token
    const getPublishedDateParts = function (): DateParts {
        if (!dateParts) {
            dateParts = getDateParts(resource.published_at || Date.now(), timezone);
        }
        return dateParts;
    };

    // replace tags like :slug or :year with actual values
    return permalink.replace(/(:[a-z_]+)/g, function (match: string): string {
        switch (match) {
        case ':year':
            return getPublishedDateParts().year;
        case ':month':
            return getPublishedDateParts().month;
        case ':day':
            return getPublishedDateParts().day;
        case ':author':
            return resource.primary_author?.slug ?? 'undefined';
        case ':primary_author':
            return resource.primary_author ? resource.primary_author.slug : primaryTagFallback;
        case ':primary_tag':
            return resource.primary_tag ? resource.primary_tag.slug : primaryTagFallback;
        case ':slug':
            return resource.slug;
        case ':id':
            return resource.id;
        default:
            // Unknown route segment - return 'undefined' string
            return 'undefined';
        }
    });
}

export default replacePermalink;
