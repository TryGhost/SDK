import {URL} from 'url';

export interface ParsedRootUrl {
    readonly href: string;
    readonly origin: string;
    readonly protocol: string;
    readonly host: string;
    readonly hostname: string;
    readonly pathname: string;
}

// Root URLs (site url, admin url, CDN base urls) are a tiny, near-static set of
// strings that get re-parsed on almost every url-utils call. Parsing is a pure
// function of the input string so results can be cached without any risk of
// going stale. Bounded so arbitrary input can't grow the cache unchecked.
const MAX_ENTRIES = 100;
const cache = new Map<string, ParsedRootUrl>();

/**
 * Parse a root URL, returning a cached immutable snapshot of the parts url-utils uses.
 * Throws the same errors as `new URL()` for invalid input (errors are not cached).
 *
 * @param {string} rootUrl
 * @returns {ParsedRootUrl}
 */
function parseRootUrl(rootUrl: string): ParsedRootUrl {
    let parsed = cache.get(rootUrl);

    if (parsed) {
        return parsed;
    }

    const url = new URL(rootUrl);
    parsed = Object.freeze({
        href: url.href,
        origin: url.origin,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        pathname: url.pathname
    });

    if (cache.size >= MAX_ENTRIES) {
        cache.clear();
    }
    cache.set(rootUrl, parsed);

    return parsed;
}

parseRootUrl.clearCache = function clearCache(): void {
    cache.clear();
};

export default parseRootUrl;
