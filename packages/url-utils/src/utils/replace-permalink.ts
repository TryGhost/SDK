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

const TOKEN_YEAR = 0;
const TOKEN_MONTH = 1;
const TOKEN_DAY = 2;
const TOKEN_AUTHOR = 3;
const TOKEN_PRIMARY_AUTHOR = 4;
const TOKEN_PRIMARY_TAG = 5;
const TOKEN_SLUG = 6;
const TOKEN_ID = 7;

const TOKENS = new Map<string, number>([
    [':year', TOKEN_YEAR],
    [':month', TOKEN_MONTH],
    [':day', TOKEN_DAY],
    [':author', TOKEN_AUTHOR],
    [':primary_author', TOKEN_PRIMARY_AUTHOR],
    [':primary_tag', TOKEN_PRIMARY_TAG],
    [':slug', TOKEN_SLUG],
    [':id', TOKEN_ID]
]);

// literal strings are output as-is, numbers are TOKEN_* values
type PermalinkPart = string | number;

// Permalink patterns are a tiny set (one per collection/route), so parse each
// once rather than running the token regex on every call. Bounded so arbitrary
// input can't grow the cache unchecked.
const MAX_PERMALINK_ENTRIES = 100;
const permalinkCache = new Map<string, PermalinkPart[]>();

function compilePermalink(permalink: string): PermalinkPart[] {
    let parts = permalinkCache.get(permalink);

    if (parts) {
        return parts;
    }

    parts = [];
    let lastIndex = 0;

    for (const match of permalink.matchAll(/:[a-z_]+/g)) {
        if (match.index > lastIndex) {
            parts.push(permalink.slice(lastIndex, match.index));
        }
        // unknown route segments are output as the string 'undefined'
        parts.push(TOKENS.get(match[0]) ?? 'undefined');
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < permalink.length) {
        parts.push(permalink.slice(lastIndex));
    }

    if (permalinkCache.size >= MAX_PERMALINK_ENTRIES) {
        permalinkCache.clear();
    }
    permalinkCache.set(permalink, parts);

    return parts;
}

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: PermalinkResource, timezone: string = 'UTC'): string {
    const primaryTagFallback = 'all';
    const parts = compilePermalink(permalink);
    // date parts are only computed if the permalink contains a date token
    let dateParts: DateParts | undefined;
    let result = '';

    for (const part of parts) {
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        if (part <= TOKEN_DAY && !dateParts) {
            dateParts = getDateParts(resource.published_at || Date.now(), timezone);
        }

        switch (part) {
        case TOKEN_YEAR:
            result += dateParts!.year;
            break;
        case TOKEN_MONTH:
            result += dateParts!.month;
            break;
        case TOKEN_DAY:
            result += dateParts!.day;
            break;
        case TOKEN_AUTHOR:
            result += resource.primary_author?.slug ?? 'undefined';
            break;
        case TOKEN_PRIMARY_AUTHOR:
            result += resource.primary_author ? resource.primary_author.slug : primaryTagFallback;
            break;
        case TOKEN_PRIMARY_TAG:
            result += resource.primary_tag ? resource.primary_tag.slug : primaryTagFallback;
            break;
        case TOKEN_SLUG:
            result += resource.slug;
            break;
        case TOKEN_ID:
            result += resource.id;
            break;
        }
    }

    return result;
}

export default replacePermalink;
