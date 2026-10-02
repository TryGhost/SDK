import {DateTime, IANAZone} from 'luxon';
import memoize from './memoize';

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

// Intl formats years outside 4 digits with eras or without padding, only use it
// directly for timestamps comfortably inside 1900-9999
const MIN_TIMESTAMP = Date.UTC(1900, 0, 2);
const MAX_TIMESTAMP = Date.UTC(9999, 11, 30);

const INVALID_DATE = 'Invalid date';

// en-CA formats as YYYY-MM-DD
const getFormatter = memoize(function getFormatter(timezone: string): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
});

// unknown, empty or missing timezones fall back to UTC. So do offsets like '+01:00',
// which only some Node versions' Intl accepts
function resolveTimezone(timezone: unknown): string {
    return typeof timezone === 'string' && !/^[+-]/.test(timezone) && IANAZone.isValidZone(timezone) ? timezone : 'UTC';
}

function toDateTime(date: string | number | Date, timezone: string): DateTime {
    if (typeof date !== 'string') {
        return DateTime.fromJSDate(new Date(date), {zone: timezone});
    }

    // ISO strings without an offset are wall time in the site timezone, other
    // formats are parsed by Date
    const dateTime = DateTime.fromISO(date.replace(' ', 'T'), {zone: timezone});
    return dateTime.invalidReason === 'unparsable' ? DateTime.fromJSDate(new Date(date), {zone: timezone}) : dateTime;
}

function getDateParts(date: string | number | Date, timezone: unknown): DateParts {
    const zone = resolveTimezone(timezone);
    const timestamp = date instanceof Date ? date.getTime() : date;

    if (typeof timestamp === 'number' && timestamp >= MIN_TIMESTAMP && timestamp <= MAX_TIMESTAMP) {
        const formatted = getFormatter(zone).format(timestamp);
        return {year: formatted.slice(0, 4), month: formatted.slice(5, 7), day: formatted.slice(8, 10)};
    }

    // luxon handles everything Intl can't format directly: strings (parsed in the
    // site timezone), invalid dates and years outside 1900-9999
    const dateTime = toDateTime(date, zone);

    if (!dateTime.isValid) {
        return {year: INVALID_DATE, month: INVALID_DATE, day: INVALID_DATE};
    }

    return {
        year: dateTime.toFormat('yyyy'),
        month: dateTime.toFormat('MM'),
        day: dateTime.toFormat('dd')
    };
}

function getPublishedDateParts(resource: PermalinkResource, timezone: string): DateParts {
    return getDateParts(resource.published_at || Date.now(), timezone);
}

const Token = {
    Year: 0,
    Month: 1,
    Day: 2,
    Author: 3,
    PrimaryAuthor: 4,
    PrimaryTag: 5,
    Slug: 6,
    Id: 7
} as const;

type Token = typeof Token[keyof typeof Token];

const TOKENS = new Map<string, Token>([
    [':year', Token.Year],
    [':month', Token.Month],
    [':day', Token.Day],
    [':author', Token.Author],
    [':primary_author', Token.PrimaryAuthor],
    [':primary_tag', Token.PrimaryTag],
    [':slug', Token.Slug],
    [':id', Token.Id]
]);

// literal strings are output as-is
type PermalinkPart = string | Token;

// Permalink patterns are a tiny set (one per collection/route), so parse each
// once rather than running the token regex on every call
const compilePermalink = memoize(function compilePermalink(permalink: string): PermalinkPart[] {
    const parts: PermalinkPart[] = [];
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

    return parts;
});

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: PermalinkResource, timezone: string = 'UTC'): string {
    // used in place of a missing primary tag or author
    const fallbackSlug = 'all';
    // date parts are only computed if the permalink contains a date token
    let dateParts: DateParts | undefined;
    let result = '';

    for (const part of compilePermalink(permalink)) {
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        switch (part) {
        case Token.Year:
            dateParts ??= getPublishedDateParts(resource, timezone);
            result += dateParts.year;
            break;
        case Token.Month:
            dateParts ??= getPublishedDateParts(resource, timezone);
            result += dateParts.month;
            break;
        case Token.Day:
            dateParts ??= getPublishedDateParts(resource, timezone);
            result += dateParts.day;
            break;
        case Token.Author:
            result += resource.primary_author?.slug ?? 'undefined';
            break;
        case Token.PrimaryAuthor:
            result += resource.primary_author ? resource.primary_author.slug : fallbackSlug;
            break;
        case Token.PrimaryTag:
            result += resource.primary_tag ? resource.primary_tag.slug : fallbackSlug;
            break;
        case Token.Slug:
            result += resource.slug;
            break;
        case Token.Id:
            result += resource.id;
            break;
        }
    }

    return result;
}

export default replacePermalink;
