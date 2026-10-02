import * as moment from 'moment-timezone';
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

// Intl uses the Julian calendar before 1582 and moment pads/formats years outside
// 4 digits differently, only use Intl for timestamps comfortably inside 1900-9999
const MIN_TIMESTAMP = Date.UTC(1900, 0, 2);
const MAX_TIMESTAMP = Date.UTC(9999, 11, 30);

// moment's default postformat, which leaves formatted digits as-is. Locales like
// 'ar' override it to output non-Latin digits
const DEFAULT_POSTFORMAT = moment.localeData('en').postformat;

// en-CA formats as YYYY-MM-DD. Throws for timezones moment doesn't know (it falls
// back to UTC for those, while Intl accepts some, e.g. '+01:00') or Intl doesn't support
const getFormatter = memoize(function getFormatter(timezone: string): Intl.DateTimeFormat {
    if (!moment.tz.zone(timezone)) {
        throw new RangeError(`Unknown timezone: ${timezone}`);
    }

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
});

function getDateParts(date: unknown, timezone: string): DateParts {
    const timestamp = date instanceof Date ? date.getTime() : date;
    const isIntlTimestamp = typeof timestamp === 'number' && timestamp >= MIN_TIMESTAMP && timestamp <= MAX_TIMESTAMP;
    // the active moment locale is global, so check it on every call
    const isDefaultLocale = moment.localeData().postformat === DEFAULT_POSTFORMAT;

    if (isIntlTimestamp && isDefaultLocale) {
        try {
            const formatted = getFormatter(timezone).format(timestamp);
            return {year: formatted.slice(0, 4), month: formatted.slice(5, 7), day: formatted.slice(8, 10)};
        } catch {
            // unknown or unsupported timezone, use moment below
        }
    }

    // moment handles everything Intl can't match exactly: strings (parsed in the
    // site timezone), invalid dates, years outside 1900-9999, unknown timezones and
    // locales that rewrite digits
    const publishedAt = moment.tz(date as moment.MomentInput, timezone);

    return {
        year: publishedAt.format('YYYY'),
        month: publishedAt.format('MM'),
        day: publishedAt.format('DD')
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
