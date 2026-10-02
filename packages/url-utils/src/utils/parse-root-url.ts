import {URL} from 'url';
import memoize from './memoize';

export interface ParsedRootUrl {
    readonly href: string;
    readonly origin: string;
    readonly protocol: string;
    readonly host: string;
    readonly hostname: string;
    readonly pathname: string;
}

/**
 * Parse a root URL, returning a cached immutable snapshot of the parts url-utils uses.
 * Throws the same errors as `new URL()` for invalid input (errors are not cached).
 *
 * Root URLs (site url, admin url, CDN base urls) are a tiny, near-static set of
 * strings that get re-parsed on almost every url-utils call. Parsing is a pure
 * function of the input string so results can't go stale.
 *
 * @param {string} rootUrl
 * @returns {ParsedRootUrl}
 */
const parseRootUrl = memoize(function parseRootUrl(rootUrl: string): ParsedRootUrl {
    const url = new URL(rootUrl);

    return Object.freeze({
        href: url.href,
        origin: url.origin,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        pathname: url.pathname
    });
});

export default parseRootUrl;
