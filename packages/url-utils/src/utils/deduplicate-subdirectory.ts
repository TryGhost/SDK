import parseRootUrl from './parse-root-url';

const subdirRegexCache = new Map<string, {subdir: string; regex: RegExp}>();

/**
 * Remove duplicated directories from the start of a path or url's path
 *
 * @param {string} url URL or pathname with possible duplicate subdirectory
 * @param {string} rootUrl Root URL with an optional subdirectory
 * @returns {string} URL or pathname with any duplicated subdirectory removed
 */
const deduplicateSubdirectory = function deduplicateSubdirectory(url: string, rootUrl: string): string {
    // force root url to always have a trailing-slash for consistent behaviour
    if (!rootUrl.endsWith('/')) {
        rootUrl = `${rootUrl}/`;
    }

    const {pathname} = parseRootUrl(rootUrl);

    // do nothing if rootUrl does not have a subdirectory
    if (pathname === '/') {
        return url;
    }

    let cached = subdirRegexCache.get(pathname);

    if (!cached) {
        const subdir = pathname.replace(/(^\/|\/$)+/g, '');
        // we can have subdirs that match TLDs so we need to restrict matches to
        // duplicates that start with a / or the beginning of the url
        cached = {subdir, regex: new RegExp(`(^|/)${subdir}/${subdir}(/|$)`)};

        if (subdirRegexCache.size >= 100) {
            subdirRegexCache.clear();
        }
        subdirRegexCache.set(pathname, cached);
    }

    return url.replace(cached.regex, `$1${cached.subdir}/`);
};

export default deduplicateSubdirectory;
